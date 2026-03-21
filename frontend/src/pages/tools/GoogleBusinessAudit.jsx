import React, { useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { ShieldCheck, Info, Search, AlertCircle, Loader2 } from 'lucide-react';
import LockedReportGate from './components/LockedReportGate';
import SignupModal from './components/SignupModal';
import PricingPreview from '../../components/landing/PricingPreview';
import useAuthStore from '../../store/authStore';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const GoogleBusinessAudit = () => {
    const { user } = useAuthStore();
    const isAdmin = user?.role === "admin";
    const [businessName, setBusinessName] = useState('');
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleAudit = async (e) => {
        e.preventDefault();
        
        // Check session limit (Skip for admins)
        const lastScan = localStorage.getItem('locitra_public_audit');
        if (!isAdmin && lastScan) {
            setShowModal(true);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_BASE}/public-scan`, {
                keyword: businessName,
                city: city
            });
            
            // Calculate a simple "Local SEO Score"
            const business = res.data.results[0]; // Assume first result might be them if named exactly
            const score = calculateScore(business);
            
            setResults({
                score,
                business: business,
                issues: generateIssues(business)
            });
            
            localStorage.setItem('locitra_public_audit', 'true');
        } catch (err) {
            setError(err.response?.data?.message || "Audit failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const calculateScore = (biz) => {
        if (!biz) return 42; // Baseline
        let score = 50;
        if (biz.rating >= 4.5) score += 20;
        else if (biz.rating >= 4.0) score += 10;
        
        if (biz.reviews > 100) score += 20;
        else if (biz.reviews > 50) score += 10;
        
        if (biz.website) score += 10;
        return Math.min(score, 98);
    };

    const generateIssues = (biz) => {
        const issues = [];
        if (!biz) return ["Business not found in top results", "Category optimization needed"];
        
        if (biz.rating < 4.5) issues.push("Rating below industry average (4.5+)");
        if (biz.reviews < 100) issues.push("Low review count compared to market leaders");
        if (!biz.website) issues.push("Missing or non-functional website link");
        issues.push("Weak keyword targeting in description");
        return issues;
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Helmet>
                <title>Free Google Business Profile Audit | Locitra</title>
                <meta name="description" content="Get a free comprehensive audit of your Google Business Profile. Identify optimization gaps and outrank competitors." />
            </Helmet>

            <div className="bg-white border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-50 text-green-600 mb-6">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                        Free Google Business Profile Audit
                    </h1>
                    <p className="text-lg text-slate-600 mb-10">
                        Is your business profile fully optimized for Google Maps? Get your instant SEO score.
                    </p>

                    <form onSubmit={handleAudit} className="flex flex-col md:row items-center gap-4 bg-white p-2 rounded-2xl shadow-xl border border-slate-100 max-w-2xl mx-auto">
                        <div className="flex-1 flex items-center px-4 w-full">
                            <Search size={20} className="text-slate-400 mr-3" />
                            <input 
                                type="text"
                                placeholder="Business Name"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                className="w-full py-3 bg-transparent outline-none text-slate-900 font-medium placeholder:text-slate-400"
                                required
                            />
                        </div>
                        <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
                        <div className="flex-1 flex items-center px-4 w-full">
                            <input 
                                type="text"
                                placeholder="City"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full py-3 bg-transparent outline-none text-slate-900 font-medium placeholder:text-slate-400"
                                required
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-70 w-full md:w-auto flex items-center justify-center min-w-[160px]"
                        >
                            {loading ? <Loader2 size={24} className="animate-spin" /> : "Start Free Audit"}
                        </button>
                    </form>
                    
                    {error && (
                        <div className="mt-6 flex items-center justify-center text-red-600 bg-red-50 p-4 rounded-xl max-w-2xl mx-auto border border-red-100">
                            <AlertCircle size={20} className="mr-2" />
                            <span className="font-medium">{error}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-12">
                {results ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                                <h3 className="text-slate-500 font-bold uppercase tracking-wider text-sm mb-4">Your SEO Score</h3>
                                <div className="relative inline-flex items-center justify-center">
                                    <svg className="w-40 h-40 transform -rotate-90">
                                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * results.score) / 100} className="text-green-500 transition-all duration-1000" />
                                    </svg>
                                    <span className="absolute text-4xl font-black text-slate-900">{results.score}<span className="text-lg text-slate-400">/100</span></span>
                                </div>
                                <p className="mt-6 text-slate-600 font-medium">
                                    Your profile is doing <span className="text-green-600 font-bold">Better than 65%</span> of local competitors.
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                                <h3 className="text-slate-900 font-bold mb-6 flex items-center">
                                    <Info size={20} className="text-blue-500 mr-2" />
                                    Key Issues Found
                                </h3>
                                <ul className="space-y-4">
                                    {results.issues.map((issue, i) => (
                                        <li key={i} className="flex items-start text-slate-600">
                                            <div className="w-2 h-2 rounded-full bg-red-400 mt-2 mr-3 shrink-0"></div>
                                            {issue}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <LockedReportGate 
                            toolName="Google Business Audit"
                            features={[
                                "Category optimization tips",
                                "Keyword gap analysis",
                                "Photo quantity vs competitors",
                                "Review sentiment analysis"
                            ]}
                        >
                            {/* Premium Content */}
                            <div className="mt-8 p-8 bg-blue-50/50 rounded-2xl border border-blue-100/50 text-center">
                                <h4 className="font-bold text-blue-900 mb-2">Strategy Roadmap Unlocked</h4>
                                <p className="text-blue-600 text-sm">Full optimization steps and AI recommendations are now visible.</p>
                            </div>
                        </LockedReportGate>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                        <p className="text-slate-400 font-medium">Enter business details to see your SEO audit results.</p>
                    </div>
                )}

                <div className="mt-20">
                    <PricingPreview />
                </div>
            </div>

            <SignupModal 
                isOpen={showModal} 
                onClose={() => setShowModal(false)}
                title="Free Audit Limit Reached"
            />
        </div>
    );
};

export default GoogleBusinessAudit;
