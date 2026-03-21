import React, { useState } from 'react';
import useUiStore from '../../store/uiStore';
import { Link } from 'react-router-dom';
import { 
    Search, 
    ShieldCheck, 
    Users, 
    BarChart3, 
    Target, 
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    Globe
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import ToolPreviewModal from '../../components/tools/ToolPreviewModal';

const tools = [
    {
        name: "Google Maps Ranking Checker",
        description: "Check your business rankings on Google Maps for specific keywords and locations.",
        icon: Search,
        path: "/tools/google-maps-rank-checker",
        color: "blue",
        requiresAuth: true
    },
    {
        name: "Google Business Profile Audit",
        description: "Get a comprehensive audit of your GMB profile and identify optimization gaps.",
        icon: ShieldCheck,
        path: "/tools/google-business-profile-audit",
        color: "green",
        requiresAuth: true
    },
    {
        name: "Local Competitor Finder",
        description: "Discover who your top local competitors are and see how you stack up against them.",
        icon: Users,
        path: "/tools/local-competitor-finder",
        color: "purple",
        requiresAuth: true
    },
    {
        name: "Review Gap Analyzer",
        description: "Analyze the total review gap between you and your top ranking competitors.",
        icon: BarChart3,
        path: "/tools/review-gap-analyzer",
        color: "orange",
        requiresAuth: false
    },
    {
        name: "Local SEO Opportunity Finder",
        description: "Find weak competitors in your area that you can easily outrank with better SEO.",
        icon: Target,
        path: "/tools/local-opportunity-finder",
        color: "red",
        requiresAuth: true
    },
    {
        name: "Website Presence Checker",
        description: "Check if a business has a website and analyze its online presence across platforms.",
        icon: Globe,
        path: "/tools/website-presence",
        color: "indigo",
        requiresAuth: true
    }
];

const ToolsHub = () => {
    const { user } = useAuthStore();
    const { openAuthModal } = useUiStore();
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [selectedTool, setSelectedTool] = useState(null);

    const handleToolClick = (e, tool) => {
        // If user is already logged in, let the Link work normally
        if (user) {
            return;
        }

        // Otherwise (unauthenticated), prevent navigation and show preview modal
        // Store intent for post-login redirect
        const slug = tool.path.split("/").pop();
        localStorage.setItem("selectedTool", slug);
        
        e.preventDefault();
        setSelectedTool(tool);
        setIsPreviewModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                        Free Local SEO Tools by <span className="text-blue-600">Locitra</span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
                        Try Locitra tools instantly. Get a quick preview for free — unlock full insights with a free account.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href="#tools-grid" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
                            Try a Free Tool
                        </a>
                        <button onClick={() => openAuthModal("register")} className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm">
                            Create Free Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Tools Grid */}
            <div id="tools-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tools.map((tool) => (
                        <div key={tool.path} className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-xl transition-all group flex flex-col h-full">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-${tool.color}-50 text-${tool.color}-600 group-hover:scale-110 transition-transform`}>
                                <tool.icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{tool.name}</h3>
                            <p className="text-slate-600 mb-8 flex-grow">
                                {tool.description}
                            </p>
                            <div className="space-y-3">
                                <Link 
                                    to={tool.path}
                                    onClick={(e) => handleToolClick(e, tool)}
                                    className="inline-flex items-center justify-between w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors"
                                >
                                    Try Tool
                                    <ArrowRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <p className="text-xs text-center text-slate-400 font-medium">
                                    {tool.requiresAuth ? "Free preview available" : "No login required"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Preview Modal */}
                <ToolPreviewModal 
                    isOpen={isPreviewModalOpen} 
                    onClose={() => setIsPreviewModalOpen(false)} 
                    toolName={selectedTool?.name} 
                    toolPath={selectedTool?.path}
                />

                {/* Trust Elements */}
                <div className="mt-16 flex flex-wrap justify-center gap-x-12 gap-y-4 pt-10 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <CheckCircle2 size={18} className="text-green-500" />
                        No credit card required
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <CheckCircle2 size={18} className="text-green-500" />
                        Instant access after signup
                    </div>
                </div>
            </div>

            {/* Popular Searches Section (Internal Linking) */}
            <div className="bg-white py-20 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                        <Target size={24} className="text-blue-600" />
                        Popular Local SEO Searches
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { name: "Dentists in Chicago", slug: "dentist-chicago" },
                            { name: "Plumbers in Dallas", slug: "plumber-dallas" },
                            { name: "Roofers in Miami", slug: "roofer-miami" },
                            { name: "Lawyers in Los Angeles", slug: "lawyer-los-angeles" },
                            { name: "HVAC in Houston", slug: "hvac-houston" },
                            { name: "Realtors in Phoenix", slug: "realtor-phoenix" },
                            { name: "Locksmiths in Seattle", slug: "locksmith-seattle" },
                            { name: "Clinics in Boston", slug: "clinic-boston" }
                        ].map((item) => (
                            <Link 
                                key={item.slug}
                                to={`/tools/google-maps-ranking-checker/${item.slug}`}
                                className="text-slate-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-1 group"
                            >
                                <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Conversion Section */}
            <div className="bg-slate-900 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                Unlock Full Local SEO Intelligence
                            </h2>
                            <ul className="space-y-4 mb-8">
                                {[
                                    "Full competitor reports & history",
                                    "AI-powered ranking insights & tips",
                                    "Unlimited scans for any keyword/city",
                                    "Lead generation & export tools",
                                    "Agency-grade white label analytics"
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center text-slate-300">
                                        <CheckCircle2 size={20} className="text-blue-500 mr-3 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={() => openAuthModal("register")} className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg">
                                Create Free Account Now
                            </button>
                        </div>
                        <div className="hidden lg:block relative">
                            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full"></div>
                            <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">
                                <div className="space-y-4">
                                    <div className="h-4 w-2/3 bg-slate-700 rounded animate-pulse"></div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="h-20 bg-slate-700 rounded animate-pulse"></div>
                                        <div className="h-20 bg-slate-700 rounded animate-pulse"></div>
                                        <div className="h-20 bg-slate-700 rounded animate-pulse"></div>
                                    </div>
                                    <div className="h-32 w-full bg-slate-700 rounded animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToolsHub;
