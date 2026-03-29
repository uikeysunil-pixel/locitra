const Blog = require("../models/blog.model")
const OpenAI = require("openai")

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

/* ─── Slug helper ─────────────────────────────────────── */
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
}

/* ─── POST /api/admin/blog/generate ──────────────────── */
exports.generateBlog = async (req, res) => {
    try {
        const { topic, keywords = [], tone = "professional" } = req.body

        if (!topic) {
            return res.status(400).json({ success: false, message: "Topic is required" })
        }

        const keywordStr = keywords.length > 0 ? keywords.join(", ") : topic

        const systemPrompt = `You are an expert SEO content writer. Always respond with valid JSON only—no markdown fences, no extra text.`

        const userPrompt = `Write a high-quality SEO-optimized blog article about: "${topic}".
Target keywords: ${keywordStr}.
Tone: ${tone}.

Include:
- Engaging introduction (2-3 sentences)
- Clear headings (H1, H2, H3) using HTML tags
- Actionable insights and detailed explanations
- Bullet points where needed using <ul><li> tags
- Conclusion with a strong CTA
- Full article length: 1000–1500 words

Return ONLY a JSON object with these exact keys:
{
  "title": "SEO-optimized blog title",
  "metaTitle": "Meta title under 60 characters",
  "metaDescription": "Compelling meta description under 160 characters",
  "excerpt": "1-2 sentence excerpt/teaser",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "content": "<h1>...</h1><p>...</p><h2>...</h2>... (full HTML article)"
}`

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 3500
        })

        const raw = completion.choices[0].message.content.trim()

        // Strip potential markdown fences
        const jsonStr = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim()

        let generated
        try {
            generated = JSON.parse(jsonStr)
        } catch (parseErr) {
            console.error("JSON parse error:", parseErr, "\nRaw:", raw)
            return res.status(500).json({ success: false, message: "AI returned malformed JSON. Please try again." })
        }

        return res.json({ success: true, data: generated })

    } catch (err) {
        console.error("Blog generate error:", err)
        return res.status(500).json({ success: false, message: "AI generation failed", error: err.message })
    }
}

/* ─── POST /api/admin/blog ── Create/Save blog ────────── */
exports.createBlog = async (req, res) => {
    try {
        const { title, slug, excerpt, content, coverImage, author, category, metaTitle, metaDescription, keywords, status } = req.body

        if (!title) {
            return res.status(400).json({ success: false, message: "Title is required" })
        }

        const finalSlug = slug || generateSlug(title)

        // Ensure slug uniqueness
        const existing = await Blog.findOne({ slug: finalSlug })
        if (existing) {
            return res.status(409).json({ success: false, message: "A blog with this slug already exists. Change the title or slug." })
        }

        const blog = await Blog.create({
            title,
            slug: finalSlug,
            excerpt,
            content,
            coverImage,
            author: author || req.user?.email || "Locitra AI",
            category,
            metaTitle,
            metaDescription,
            keywords: Array.isArray(keywords) ? keywords : (keywords ? keywords.split(",").map(k => k.trim()) : []),
            status: status || "draft"
        })

        return res.status(201).json({ success: true, data: blog })

    } catch (err) {
        console.error("Blog create error:", err)
        return res.status(500).json({ success: false, message: "Failed to save blog", error: err.message })
    }
}

/* ─── PUT /api/admin/blog/:id ── Update blog ──────────── */
exports.updateBlog = async (req, res) => {
    try {
        const { id } = req.params
        const updates = req.body

        // Regenerate slug if title changed and slug not provided
        if (updates.title && !updates.slug) {
            updates.slug = generateSlug(updates.title)
        }

        // Normalize keywords
        if (updates.keywords && typeof updates.keywords === "string") {
            updates.keywords = updates.keywords.split(",").map(k => k.trim())
        }

        const blog = await Blog.findByIdAndUpdate(id, updates, { new: true, runValidators: true })

        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" })
        }

        return res.json({ success: true, data: blog })

    } catch (err) {
        console.error("Blog update error:", err)
        return res.status(500).json({ success: false, message: "Failed to update blog", error: err.message })
    }
}

/* ─── GET /api/admin/blog ── List all blogs (admin) ─────── */
exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 }).select("-content")
        return res.json({ success: true, data: blogs })
    } catch (err) {
        console.error("Blog list error:", err)
        return res.status(500).json({ success: false, message: "Failed to fetch blogs" })
    }
}

/* ─── GET /api/admin/blog/:id ── Get single blog ──────── */
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" })
        return res.json({ success: true, data: blog })
    } catch (err) {
        return res.status(500).json({ success: false, message: "Failed to fetch blog" })
    }
}

/* ─── DELETE /api/admin/blog/:id ─────────────────────── */
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id)
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" })
        return res.json({ success: true, message: "Blog deleted" })
    } catch (err) {
        return res.status(500).json({ success: false, message: "Failed to delete blog" })
    }
}

/* ─── GET /api/public/blogs ── Public published blogs ─── */
exports.getPublishedBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ status: "published" }).sort({ createdAt: -1 }).select("-content")
        return res.json({ success: true, data: blogs })
    } catch (err) {
        return res.status(500).json({ success: false, message: "Failed to fetch blogs" })
    }
}

/* ─── GET /api/public/blogs/:slug ── Public single blog ─ */
exports.getPublishedBlogBySlug = async (req, res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug, status: "published" })
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" })
        return res.json({ success: true, data: blog })
    } catch (err) {
        return res.status(500).json({ success: false, message: "Failed to fetch blog" })
    }
}
