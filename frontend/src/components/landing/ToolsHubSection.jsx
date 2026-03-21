import React, { useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useUiStore from "../../store/uiStore";
import ToolPreviewModal from "../tools/ToolPreviewModal";

const tools = [
    {
        title: "Google Maps Ranking Checker",
        desc: "See exactly where any business ranks on Google Maps for your target keywords.",
        icon: (
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        link: "/tools/google-maps-ranking-checker"
    },
    {
        title: "Google Business Profile Audit",
        desc: "Get a detailed health score and optimization checklist for any GBP listing.",
        icon: (
            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        link: "/tools/gbp-audit"
    },
    {
        title: "Local Competitor Finder",
        desc: "Identify the top competitors in any niche and see their SEO secrets.",
        icon: (
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
        link: "/tools/competitor-finder"
    },
    {
        title: "Review Gap Analyzer",
        desc: "Compare review volume and quality against local leaders.",
        icon: (
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
        ),
        link: "/tools/review-gap-analyzer"
    },
    {
        title: "Local Opportunity Finder",
        desc: "Discover businesses with weak SEO that are prime for outreach.",
        icon: (
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        link: "/tools/opportunity-finder"
    },
    {
        title: "Website Presence Checker",
        desc: "Check if a business has a website and analyze its online presence across platforms.",
        icon: (
            <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18" />
            </svg>
        ),
        link: "/tools/website-presence"
    }
];

export default function ToolsHubSection() {
    const { user } = useAuthStore();
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [selectedTool, setSelectedTool] = useState(null);

    const handleToolClick = (e, tool) => {
        // If user is already logged in, let the Link work normally
        if (user) {
            return;
        }

        // Otherwise, prevent navigation and show preview modal for ALL tools
        // Store intent for post-login redirect
        const slug = tool.link.split("/").pop();
        localStorage.setItem("selectedTool", slug);

        e.preventDefault();
        setSelectedTool({ name: tool.title, path: tool.link });
        setIsPreviewModalOpen(true);
    };

    return (
        <section id="tools" className="py-24 bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                        Free Local SEO Tools
                    </h2>
                    <p className="text-xl text-slate-600 leading-relaxed">
                        Try Locitra tools instantly. Get a quick preview for free — unlock full insights with a free account.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tools.map((tool, i) => (
                        <div key={i} className="group p-8 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                                {tool.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">{tool.title}</h3>
                            <p className="text-slate-600 mb-8 line-clamp-2">{tool.desc}</p>
                            <div className="flex flex-col gap-3">
                                <Link 
                                    to={tool.link} 
                                    onClick={(e) => handleToolClick(e, tool)}
                                    className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors"
                                >
                                    Try Tool
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                                <p className="text-xs text-slate-400 font-medium">
                                    {tool.title === "Review Gap Analyzer" ? "No login required" : "Free preview available"}
                                </p>
                            </div>
                        </div>
                    ))}
                    
                    {/* Preview Modal */}
                    <ToolPreviewModal 
                        isOpen={isPreviewModalOpen} 
                        onClose={() => setIsPreviewModalOpen(false)} 
                        toolName={selectedTool?.name} 
                        toolPath={selectedTool?.path}
                    />
                    
                </div>
            </div>
        </section>
    );
}
