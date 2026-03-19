import React, { useEffect, useState } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingFooter from "../components/landing/LandingFooter";
import { ArrowRight, Clock, User, Tag } from "lucide-react";

export default function Blog() {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        // Mocking API fetch delay
        setTimeout(() => {
            setPosts([
                {
                    id: 1,
                    title: "How to Land Your First 3 Agency Clients Using Local SEO Scans",
                    excerpt: "Finding leads is easy. Closing them is where most agencies fail. Learn the exact strategy to use automated reports to build trust...",
                    author: "Alex Rivers",
                    date: "Mar 15, 2026",
                    category: "Growth",
                    readTime: "8 min read",
                    img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800"
                },
                {
                    id: 2,
                    title: "The 2026 Guide to Local GMB Ranking Factors",
                    excerpt: "Google's proximity algorithm has changed. We analyzed 5,000+ businesses to discover what actually moves the needle for local rankings...",
                    author: "Sarah Chen",
                    date: "Mar 12, 2026",
                    category: "SEO",
                    readTime: "12 min read",
                    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
                },
                {
                    id: 3,
                    title: "Automating Your Lead Gen Workflow with Locitra AI",
                    excerpt: "Stop manually searching for businesses. Discover how to build a semi-automated pipeline that runs while you sleep...",
                    author: "David Miller",
                    date: "Mar 10, 2026",
                    category: "Automation",
                    readTime: "6 min read",
                    img: "https://images.unsplash.com/photo-1551288049-bbdac8a28a1e?auto=format&fit=crop&q=80&w=800"
                }
            ]);
            setLoading(false);
        }, 800);
    }, []);

    return (
        <div className="font-sans antialiased bg-slate-50 text-slate-900 min-h-screen">
            <LandingNavbar />
            
            <main className="py-20">
                <div className="max-w-[1200px] mx-auto px-6">
                    
                    <div className="text-center mb-20 max-w-2xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                            The <span className="text-blue-600">Locitra</span> Blog
                        </h1>
                        <p className="text-lg text-slate-600">
                            Expert insights on local SEO, lead generation, and agency scaling.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {posts.map((post) => (
                                <article 
                                    key={post.id} 
                                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col group"
                                >
                                    <div className="h-56 overflow-hidden relative">
                                        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm text-blue-600 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                                            {post.category}
                                        </div>
                                        <img 
                                            src={post.img} 
                                            alt={post.title} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                    
                                    <div className="p-8 flex flex-col flex-1">
                                        <div className="flex items-center gap-4 text-slate-400 text-xs mb-4">
                                            <span className="flex items-center gap-1.5"><Clock size={14} /> {post.date}</span>
                                            <span className="flex items-center gap-1.5"><User size={14} /> {post.author}</span>
                                        </div>
                                        
                                        <h2 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {post.title}
                                        </h2>
                                        
                                        <p className="text-slate-600 text-sm leading-relaxed mb-8 flex-1">
                                            {post.excerpt}
                                        </p>
                                        
                                        <button className="flex items-center gap-2 text-blue-600 font-bold text-sm group/btn group-hover:translate-x-1 transition-transform">
                                            Read More <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {/* Newsletter Box */}
                    <section className="mt-32 p-10 md:p-16 rounded-[40px] bg-slate-900 relative overflow-hidden text-center">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[120px]"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[120px]"></div>
                        
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-3xl font-bold text-white mb-6">Want more agency tips?</h2>
                            <p className="text-slate-400 mb-10">Join 5,000+ agency owners getting weekly growth strategies in their inbox.</p>
                            
                            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                                <input 
                                    type="email" 
                                    placeholder="your@email.com" 
                                    className="flex-1 bg-slate-800 border border-slate-700 text-white px-6 py-4 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-600/20">
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </section>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
