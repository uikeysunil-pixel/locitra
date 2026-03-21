import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import { Helmet } from "react-helmet";
import { 
    Search, 
    MapPin, 
    Loader2, 
    Globe, 
    Mail, 
    Facebook, 
    Instagram, 
    Linkedin,
    Twitter,
    Youtube,
    CheckCircle2,
    XCircle,
    ArrowRight
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import PricingPreview from "../../components/landing/PricingPreview";
import LockedReportGate from "./components/LockedReportGate";
import SignupModal from "./components/SignupModal";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const WebsitePresenceChecker = () => {
    const { token, user } = useAuthStore();
    const isAdmin = user?.role === "admin";
    const location = useLocation();
    
    const [businessName, setBusinessName] = useState("");
    const [city, setCity] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState("");
    const [showLimitModal, setShowLimitModal] = useState(false);

    // Auto-populate from location state (Lead selection)
    useEffect(() => {
        if (location.state?.lead) {
            setBusinessName(location.state.lead.name || "");
            setCity(location.state.lead.city || "");
        }
    }, [location.state]);

    const handleCheckPresence = async (e) => {
        e.preventDefault();
        setError("");
        
        if (!businessName || !city) {
            setError("Please enter both business name and city.");
            return;
        }

        // Check session limit for public users (Skip for admins)
        const lastScan = localStorage.getItem("locitra_presence_scan");
        if (!token && !isAdmin && lastScan && Date.now() - parseInt(lastScan) < 3600000) { // 1 hour limit for public
            setShowLimitModal(true);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE}/tools/website-presence`, { 
                name: businessName, 
                city 
            });
            
            setResults(response.data.data);
            if (!token && !isAdmin) {
                localStorage.setItem("locitra_presence_scan", Date.now().toString());
            }
        } catch (err) {
            console.error("Presence check error:", err);
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Helmet>
                <title>Free Website Presence Checker | Locitra</title>
                <meta name="description" content="Check if a business has a website and analyze its online presence across platforms instantly. Free tool by Locitra." />
            </Helmet>

            {/* Hero Section */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                        <Globe size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                        Website Presence Checker
                    </h1>
                    <p className="text-lg text-slate-600 mb-10">
                        Check if a business has a website and see their social media footprint in seconds.
                    </p>

                    <form onSubmit={handleCheckPresence} className="flex flex-col md:flex-row items-center gap-4 bg-white p-2 rounded-2xl shadow-xl border border-slate-100 max-w-2xl mx-auto">
                        <div className="flex-1 flex items-center px-4 w-full">
                            <Search size={20} className="text-slate-400 mr-3" />
                            <input 
                                type="text"
                                placeholder="Business Name"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                className="w-full py-3 bg-transparent outline-none text-slate-900 font-medium"
                                required
                            />
                        </div>
                        <div className="flex-1 flex items-center px-4 w-full border-t md:border-t-0 md:border-l border-slate-100">
                            <MapPin size={20} className="text-slate-400 mr-3" />
                            <input 
                                type="text"
                                placeholder="City"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full py-3 bg-transparent outline-none text-slate-900 font-medium"
                                required
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg w-full md:w-auto flex items-center justify-center min-w-[160px]"
                        >
                            {loading ? <Loader2 size={24} className="animate-spin" /> : "Try Tool"}
                        </button>
                    </form>
                    {error && <div className="mt-6 text-red-600 bg-red-50 p-4 rounded-xl max-w-2xl mx-auto border border-red-100 font-medium">{error}</div>}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-12">
                {results ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">{results.name}</h2>
                                <p className="text-slate-500 flex items-center gap-1">
                                    <MapPin size={14} />
                                    {results.address || city}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${results.website ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                    {results.website ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                    {results.website ? "Website Found" : "No Website"}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            {/* Website Card */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Globe size={20} />
                                    </div>
                                    <h3 className="font-bold text-slate-900">Website Address</h3>
                                </div>
                                {results.website ? (
                                    <div className="flex-grow">
                                        <a href={results.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:underline break-all">
                                            {results.website}
                                        </a>
                                        <p className="text-sm text-slate-400 mt-2 italic">Status: Live and accessible</p>
                                    </div>
                                ) : (
                                    <div className="flex-grow text-slate-400 font-medium">
                                        No website discovered for this business.
                                    </div>
                                )}
                            </div>

                            {/* Social Presence Card */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                                        <Linkedin size={20} />
                                    </div>
                                    <h3 className="font-bold text-slate-900">Social Footprint</h3>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <SocialLink icon={<Facebook size={18} />} label="Facebook" url={results.facebook} />
                                    <SocialLink icon={<Instagram size={18} />} label="Instagram" url={results.instagram} />
                                    <SocialLink icon={<Linkedin size={18} />} label="LinkedIn" url={results.linkedin} />
                                    <SocialLink icon={<Twitter size={18} />} label="X / Twitter" url={results.twitter} />
                                </div>
                            </div>

                            {/* Contact Details Card */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                                            <Mail size={20} />
                                        </div>
                                        <h3 className="font-bold text-slate-900">Contact Accessibility</h3>
                                    </div>
                                    {!token && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">PREVIEW</span>}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Business Email</p>
                                        <p className="font-medium text-slate-900">{results.email || "Not found"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Page</p>
                                        <p className="font-medium text-slate-900 truncate">
                                            {results.contactPage ? (
                                                <a href={results.contactPage} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    View Page
                                                </a>
                                            ) : "Not found"}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                                        <p className="font-medium text-slate-900">{results.phone || "Not available"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <LockedReportGate 
                            toolName="Website Presence Checker"
                            features={[
                                "Full list of indexed social profiles",
                                "Email discovery for decision makers",
                                "Technical website health audit",
                                "Competitor presence comparison"
                            ]}
                        >
                            {/* Premium Content */}
                            <div className="mt-8 p-8 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-center text-center">
                                <div>
                                    <h4 className="font-bold text-blue-900 mb-2">Deep Presence Insights Unlocked</h4>
                                    <p className="text-blue-600 text-sm">Full contact discovery and social footprint analysis are now available.</p>
                                </div>
                            </div>
                        </LockedReportGate>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                        <p className="text-slate-400 font-medium">Enter business details above to analyze presence instantly.</p>
                    </div>
                )}

                <div className="mt-20">
                    <PricingPreview />
                </div>
            </div>

            <SignupModal 
                isOpen={showLimitModal} 
                onClose={() => setShowLimitModal(false)} 
                title="Free Scan Limit Reached" 
            />
        </div>
    );
};

const SocialLink = ({ icon, label, url }) => (
    <div className={`flex items-center gap-2 p-3 rounded-xl border ${url ? "border-slate-200 bg-slate-50 text-slate-900" : "border-slate-100 bg-slate-50/50 text-slate-300"}`}>
        {icon}
        <span className="text-sm font-semibold">{label}</span>
        {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="ml-auto text-blue-500">
                <ArrowRight size={14} />
            </a>
        )}
    </div>
);

export default WebsitePresenceChecker;
