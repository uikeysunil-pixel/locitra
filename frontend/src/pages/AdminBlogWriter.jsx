import { useState, useCallback, useRef } from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import useAuthStore from "../store/authStore"

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

/* ── Quill toolbar config ─────────────────────────────── */
const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "code-block"],
        ["link"],
        ["clean"]
    ]
}

const quillFormats = ["header", "bold", "italic", "underline", "strike", "list", "bullet", "blockquote", "code-block", "link"]

/* ── Slug generator ───────────────────────────────────── */
function toSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
}

/* ── Count words in HTML string ──────────────────────── */
function wordCount(html) {
    const text = html.replace(/<[^>]*>/g, " ")
    return text.trim().split(/\s+/).filter(Boolean).length
}

export default function AdminBlogWriter() {
    const { token } = useAuthStore()

    /* ── Left panel state ── */
    const [topic, setTopic] = useState("")
    const [keywords, setKeywords] = useState("")
    const [tone, setTone] = useState("professional")
    const [generating, setGenerating] = useState(false)
    const [genError, setGenError] = useState("")

    /* ── Right panel / form state ── */
    const [blogId, setBlogId] = useState(null)
    const [title, setTitle] = useState("")
    const [slug, setSlug] = useState("")
    const [metaTitle, setMetaTitle] = useState("")
    const [metaDescription, setMetaDescription] = useState("")
    const [excerpt, setExcerpt] = useState("")
    const [content, setContent] = useState("")
    const [coverImage, setCoverImage] = useState("")
    const [category, setCategory] = useState("")
    const [status, setStatus] = useState("draft")
    const [keywordTags, setKeywordTags] = useState([])

    /* ── Saving state ── */
    const [saving, setSaving] = useState(false)
    const [saveMsg, setSaveMsg] = useState("")

    /* ── Preview mode ── */
    const [preview, setPreview] = useState(false)

    /* ─────────────────────────────────────────────────── */
    /*  AI Generation                                      */
    /* ─────────────────────────────────────────────────── */
    const handleGenerate = async () => {
        if (!topic.trim()) { setGenError("Please enter a topic."); return }
        setGenError("")
        setGenerating(true)
        try {
            const res = await fetch(`${API}/admin/blog/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    topic: topic.trim(),
                    keywords: keywords.split(",").map(k => k.trim()).filter(Boolean),
                    tone
                })
            })
            const data = await res.json()
            if (!data.success) throw new Error(data.message || "Generation failed")

            const g = data.data
            setTitle(g.title || "")
            setSlug(toSlug(g.title || ""))
            setMetaTitle(g.metaTitle || "")
            setMetaDescription(g.metaDescription || "")
            setExcerpt(g.excerpt || "")
            setContent(g.content || "")
            setKeywordTags(Array.isArray(g.keywords) ? g.keywords : [])
        } catch (err) {
            setGenError(err.message || "Something went wrong.")
        } finally {
            setGenerating(false)
        }
    }

    /* ─────────────────────────────────────────────────── */
    /*  Save / Publish                                     */
    /* ─────────────────────────────────────────────────── */
    const handleSave = async (publishStatus) => {
        if (!title.trim()) { setSaveMsg("❌ Title is required"); return }
        setSaving(true)
        setSaveMsg("")

        const payload = {
            title,
            slug: slug || toSlug(title),
            excerpt,
            content,
            coverImage,
            category,
            metaTitle,
            metaDescription,
            keywords: keywordTags,
            status: publishStatus
        }

        try {
            let res
            if (blogId) {
                res = await fetch(`${API}/admin/blog/${blogId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify(payload)
                })
            } else {
                res = await fetch(`${API}/admin/blog`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify(payload)
                })
            }

            const data = await res.json()
            if (!data.success) throw new Error(data.message || "Save failed")

            setBlogId(data.data._id)
            setStatus(data.data.status)
            setSlug(data.data.slug)
            setSaveMsg(publishStatus === "published" ? "✅ Blog published!" : "✅ Draft saved!")
        } catch (err) {
            setSaveMsg(`❌ ${err.message}`)
        } finally {
            setSaving(false)
        }
    }

    /* ─────────────────────────────────────────────────── */
    /*  Reset form                                         */
    /* ─────────────────────────────────────────────────── */
    const handleReset = () => {
        setBlogId(null); setTitle(""); setSlug(""); setMetaTitle("")
        setMetaDescription(""); setExcerpt(""); setContent(""); setCoverImage("")
        setCategory(""); setStatus("draft"); setKeywordTags([]); setSaveMsg("")
        setTopic(""); setKeywords(""); setTone("professional")
    }

    const wc = wordCount(content)

    /* ────────────────────────────────────────────────── */
    /*  RENDER                                            */
    /* ────────────────────────────────────────────────── */
    return (
        <div style={wrap}>
            {/* ── Header ── */}
            <div style={header}>
                <div>
                    <h1 style={headerTitle}>✍️ Blog Writer <span style={adminBadge}>ADMIN</span></h1>
                    <p style={headerSub}>Generate, edit and publish SEO-optimized blogs with AI</p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button style={previewBtn} onClick={() => setPreview(p => !p)}>
                        {preview ? "📝 Edit Mode" : "👁️ Preview"}
                    </button>
                    <button style={resetBtn} onClick={handleReset}>+ New Blog</button>
                </div>
            </div>

            {/* ── Main content ── */}
            {preview ? (
                /* Preview pane */
                <div style={previewPane}>
                    {coverImage && <img src={coverImage} alt="Cover" style={previewImg} />}
                    <span style={previewCategory}>{category || "General"}</span>
                    <h1 style={previewTitle}>{title || "Untitled Blog"}</h1>
                    <p style={previewExcerpt}>{excerpt}</p>
                    <div style={previewMeta}>
                        <span>Meta: <em>{metaTitle}</em></span>
                        <span style={{ margin: "0 8px" }}>|</span>
                        <span>{metaDescription}</span>
                    </div>
                    <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "20px 0" }} />
                    <div className="blog-preview-content" dangerouslySetInnerHTML={{ __html: content }} style={{ lineHeight: 1.8, color: "#cbd5e1" }} />
                    <div style={{ marginTop: "24px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {keywordTags.map((k, i) => <span key={i} style={tag}>{k}</span>)}
                    </div>
                </div>
            ) : (
                <div style={splitLayout}>
                    {/* ══════════ LEFT PANEL ══════════ */}
                    <div style={leftPanel}>
                        <h2 style={panelTitle}>🤖 AI Generator</h2>

                        <label style={label}>Blog Topic *</label>
                        <input
                            style={input}
                            placeholder="e.g. How to rank higher on Google Maps"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                        />

                        <label style={label}>Target Keywords <span style={hint}>(comma separated)</span></label>
                        <input
                            style={input}
                            placeholder="local SEO, Google Maps, GMB"
                            value={keywords}
                            onChange={e => setKeywords(e.target.value)}
                        />

                        <label style={label}>Tone</label>
                        <select style={select} value={tone} onChange={e => setTone(e.target.value)}>
                            <option value="professional">Professional</option>
                            <option value="casual">Casual</option>
                            <option value="persuasive">Persuasive</option>
                        </select>

                        {genError && <p style={errTxt}>{genError}</p>}

                        <button style={generating ? genBtnDisabled : genBtn} onClick={handleGenerate} disabled={generating}>
                            {generating ? (
                                <><span style={spinner} /> Generating…</>
                            ) : (
                                "✨ Generate with AI"
                            )}
                        </button>

                        {/* Keyword suggestion tags */}
                        {keywordTags.length > 0 && (
                            <div style={{ marginTop: "20px" }}>
                                <p style={label}>Generated Keywords</p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                                    {keywordTags.map((k, i) => <span key={i} style={tag}>{k}</span>)}
                                </div>
                            </div>
                        )}

                        {/* Status badge */}
                        <div style={{ marginTop: "24px" }}>
                            <p style={label}>Current Status</p>
                            <span style={status === "published" ? publishedBadge : draftBadge}>
                                {status === "published" ? "🟢 Published" : "🟡 Draft"}
                            </span>
                        </div>

                        {blogId && (
                            <div style={{ marginTop: "12px" }}>
                                <p style={label}>Slug</p>
                                <code style={slugCode}>/blog/{slug}</code>
                            </div>
                        )}
                    </div>

                    {/* ══════════ RIGHT PANEL ══════════ */}
                    <div style={rightPanel}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h2 style={panelTitle}>📝 Content Editor</h2>
                            <span style={wcBadge}>📊 {wc} words</span>
                        </div>

                        <div style={formGrid}>
                            <div style={formGroup}>
                                <label style={label}>Title *</label>
                                <input style={input} value={title} placeholder="Blog title…" onChange={e => {
                                    setTitle(e.target.value)
                                    setSlug(toSlug(e.target.value))
                                }} />
                            </div>
                            <div style={formGroup}>
                                <label style={label}>Slug (auto-generated)</label>
                                <input style={{ ...input, color: "#6366f1" }} value={slug} placeholder="auto-slug" onChange={e => setSlug(e.target.value)} />
                            </div>
                            <div style={formGroup}>
                                <label style={label}>Meta Title</label>
                                <input style={input} value={metaTitle} placeholder="SEO meta title…" onChange={e => setMetaTitle(e.target.value)} />
                            </div>
                            <div style={formGroup}>
                                <label style={label}>Meta Description</label>
                                <input style={input} value={metaDescription} placeholder="SEO meta description…" onChange={e => setMetaDescription(e.target.value)} />
                            </div>
                            <div style={formGroup}>
                                <label style={label}>Cover Image URL</label>
                                <input style={input} value={coverImage} placeholder="https://…" onChange={e => setCoverImage(e.target.value)} />
                            </div>
                            <div style={formGroup}>
                                <label style={label}>Category</label>
                                <input style={input} value={category} placeholder="e.g. Local SEO, Marketing" onChange={e => setCategory(e.target.value)} />
                            </div>
                        </div>

                        <label style={label}>Excerpt</label>
                        <textarea style={textarea} value={excerpt} placeholder="Short teaser / excerpt…" rows={2} onChange={e => setExcerpt(e.target.value)} />

                        <label style={{ ...label, marginTop: "16px" }}>Content *</label>
                        <div style={editorWrap}>
                            <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={quillModules}
                                formats={quillFormats}
                                style={{ background: "#1e293b", color: "#e2e8f0", minHeight: "320px" }}
                            />
                        </div>

                        {saveMsg && <p style={saveMsg.startsWith("✅") ? successTxt : errTxt}>{saveMsg}</p>}

                        <div style={actionRow}>
                            <button style={draftSaveBtn} onClick={() => handleSave("draft")} disabled={saving}>
                                {saving ? "Saving…" : "💾 Save Draft"}
                            </button>
                            <button style={publishSaveBtn} onClick={() => handleSave("published")} disabled={saving}>
                                {saving ? "Publishing…" : "🚀 Publish"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

/* ── Styles ─────────────────────────────────────────────── */
const wrap = {
    minHeight: "100vh",
    background: "#0f172a",
    color: "#e2e8f0",
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: "0"
}

const header = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "28px 32px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    background: "rgba(255,255,255,0.02)"
}

const headerTitle = {
    fontSize: "22px",
    fontWeight: "800",
    color: "#fff",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "10px"
}

const headerSub = {
    fontSize: "13px",
    color: "rgba(255,255,255,0.4)",
    marginTop: "4px"
}

const adminBadge = {
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: "#fff",
    fontSize: "10px",
    fontWeight: "700",
    padding: "3px 8px",
    borderRadius: "6px",
    letterSpacing: "0.05em"
}

const splitLayout = {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: "0",
    minHeight: "calc(100vh - 100px)"
}

const leftPanel = {
    borderRight: "1px solid rgba(255,255,255,0.07)",
    padding: "28px 24px",
    background: "rgba(255,255,255,0.02)",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
}

const rightPanel = {
    padding: "28px 32px",
    overflowY: "auto"
}

const panelTitle = {
    fontSize: "15px",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "20px"
}

const label = {
    display: "block",
    fontSize: "11px",
    fontWeight: "600",
    color: "rgba(255,255,255,0.45)",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    marginBottom: "6px",
    marginTop: "14px"
}

const hint = {
    textTransform: "none",
    fontWeight: "400",
    color: "rgba(255,255,255,0.25)"
}

const input = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#e2e8f0",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box"
}

const select = {
    ...input,
    cursor: "pointer"
}

const textarea = {
    ...input,
    resize: "vertical",
    lineHeight: "1.6"
}

const editorWrap = {
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.1)",
    marginBottom: "20px"
}

const genBtn = {
    marginTop: "20px",
    width: "100%",
    padding: "13px",
    borderRadius: "10px",
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "14px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: "0 4px 20px rgba(99,102,241,0.4)"
}

const genBtnDisabled = {
    ...genBtn,
    opacity: 0.6,
    cursor: "not-allowed"
}

const spinner = {
    display: "inline-block",
    width: "14px",
    height: "14px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite"
}

const resetBtn = {
    padding: "10px 18px",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.08)",
    color: "#e2e8f0",
    border: "1px solid rgba(255,255,255,0.12)",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer"
}

const previewBtn = {
    ...resetBtn,
    background: "rgba(99,102,241,0.15)",
    color: "#a5b4fc",
    border: "1px solid rgba(99,102,241,0.3)"
}

const actionRow = {
    display: "flex",
    gap: "12px",
    marginTop: "8px"
}

const draftSaveBtn = {
    flex: 1,
    padding: "13px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.07)",
    color: "#e2e8f0",
    border: "1px solid rgba(255,255,255,0.12)",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer"
}

const publishSaveBtn = {
    flex: 1,
    padding: "13px",
    borderRadius: "10px",
    background: "linear-gradient(135deg,#10b981,#059669)",
    color: "#fff",
    border: "none",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(16,185,129,0.3)"
}

const errTxt = {
    color: "#f87171",
    fontSize: "12px",
    marginTop: "8px"
}

const successTxt = {
    color: "#4ade80",
    fontSize: "12px",
    fontWeight: "600",
    marginTop: "8px"
}

const tag = {
    background: "rgba(99,102,241,0.15)",
    color: "#a5b4fc",
    border: "1px solid rgba(99,102,241,0.25)",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
    padding: "3px 10px"
}

const draftBadge = {
    background: "rgba(245,158,11,0.15)",
    color: "#fbbf24",
    border: "1px solid rgba(245,158,11,0.25)",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 12px"
}

const publishedBadge = {
    ...draftBadge,
    background: "rgba(16,185,129,0.15)",
    color: "#4ade80",
    border: "1px solid rgba(16,185,129,0.25)"
}

const wcBadge = {
    background: "rgba(255,255,255,0.05)",
    color: "rgba(255,255,255,0.4)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
    padding: "4px 12px"
}

const slugCode = {
    display: "block",
    fontSize: "11px",
    color: "#6366f1",
    background: "rgba(99,102,241,0.1)",
    padding: "6px 10px",
    borderRadius: "6px",
    fontFamily: "monospace",
    wordBreak: "break-all",
    marginTop: "4px"
}

const formGrid = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0 16px"
}

const formGroup = {
    width: "100%"
}

/* ── Preview styles ── */
const previewPane = {
    maxWidth: "860px",
    margin: "0 auto",
    padding: "40px 32px"
}

const previewImg = {
    width: "100%",
    borderRadius: "12px",
    marginBottom: "24px",
    objectFit: "cover",
    maxHeight: "360px"
}

const previewCategory = {
    background: "rgba(99,102,241,0.15)",
    color: "#a5b4fc",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    padding: "4px 12px",
    letterSpacing: "0.05em",
    textTransform: "uppercase"
}

const previewTitle = {
    fontSize: "36px",
    fontWeight: "800",
    color: "#fff",
    marginTop: "20px",
    lineHeight: 1.2
}

const previewExcerpt = {
    fontSize: "16px",
    color: "rgba(255,255,255,0.5)",
    marginTop: "12px",
    lineHeight: 1.7
}

const previewMeta = {
    fontSize: "12px",
    color: "rgba(255,255,255,0.3)",
    marginTop: "16px"
}
