import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { Loader2, AlertCircle, X, Send } from 'lucide-react';

// Report components
import ReportHero from '../components/reports/ReportHero';
import OverviewCards from '../components/reports/OverviewCards';
import CompetitorList from '../components/reports/CompetitorList';
import OpportunitiesPanel from '../components/reports/OpportunitiesPanel';
import IssuesPanel from '../components/reports/IssuesPanel';
import CTASection from '../components/reports/CTASection';
import ShareButtons from '../components/reports/ShareButtons';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const PublicReport = () => {
    const { slug } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [showLeadCapture, setShowLeadCapture] = useState(false);
    const [leadDismissed, setLeadDismissed] = useState(false);
    const [leadSending, setLeadSending] = useState(false);
    const [leadSent, setLeadSent] = useState(false);
    const [leadError, setLeadError] = useState(null);
    const [lead, setLead] = useState({ name: "", email: "", company: "" });

    useEffect(() => {
        fetchData();
    }, [slug]);

    useEffect(() => {
        if (leadDismissed || leadSent) return;
        const onScroll = () => {
            const doc = document.documentElement;
            const scrollTop = window.scrollY || doc.scrollTop || 0;
            const scrollHeight = doc.scrollHeight || 0;
            const height = window.innerHeight || 1;
            const denom = Math.max(scrollHeight - height, 1);
            const ratio = scrollTop / denom;
            if (ratio > 0.35) setShowLeadCapture(true);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, [leadDismissed, leadSent]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            let res;
            try {
                // Backward/forward compatible: some deployments may use /public/report vs /report
                res = await axios.get(`${API_BASE}/public/report/${slug}`);
            } catch (_) {
                res = await axios.get(`${API_BASE}/report/${slug}`);
            }
            if (res.data.success) setData(res.data.data);
            else throw new Error(res.data.message || "Failed to load report");
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to load report data.");
        } finally {
            setLoading(false);
        }
    };

    const submitLead = async () => {
        setLeadError(null);
        const email = String(lead.email || "").trim();
        if (!email || !email.includes("@")) {
            setLeadError("Enter a valid email to continue.");
            return;
        }

        setLeadSending(true);
        try {
            let res;
            try {
                res = await axios.post(`${API_BASE}/report/${slug}/lead`, {
                    name: lead.name,
                    email,
                    company: lead.company
                });
            } catch (_) {
                res = await axios.post(`${API_BASE}/public/report/${slug}/lead`, {
                    name: lead.name,
                    email,
                    company: lead.company
                });
            }
            if (!res.data?.success) throw new Error(res.data?.message || "Failed to submit");
            setLeadSent(true);
            setShowLeadCapture(false);
        } catch (e) {
            setLeadError(e.response?.data?.message || e.message || "Failed to submit. Please try again.");
        } finally {
            setLeadSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-slate-500 font-black text-xs uppercase tracking-widest">Generating Your Report...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Report Not Found</h2>
                    <p className="text-slate-600 mb-8">{error}</p>
                    <Link to="/" className="inline-flex items-center justify-center w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    const { keyword, city, businesses, totalResults } = data;
    
    // Calculate mock stats from results
    const results = businesses || [];
    const avgRating = results.length > 0 
        ? (results.reduce((acc, curr) => acc + (curr.rating || 0), 0) / results.length).toFixed(1)
        : 0;
    const avgReviews = results.length > 0 
        ? Math.round(results.reduce((acc, curr) => acc + (curr.reviews || 0), 0) / results.length)
        : 0;
    
    const stats = {
        avgRating,
        totalCompetitors: totalResults || results.length,
        avgReviews,
        marketScore: 88 // Static for now
    };

    const reportUrl = window.location.href;
    const reportTitle = `${city} ${keyword} Market Analysis | Locitra`;

    return (
        <div className="min-h-screen bg-white selection:bg-purple-100 selection:text-purple-900">
            <Helmet>
                <title>{reportTitle}</title>
                <meta name="description" content={`Explore top ${keyword} businesses in ${city} with AI-powered SEO insights and market analysis.`} />
            </Helmet>

            {/* Sticky Header with Share */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-black italic">L</div>
                        <span className="font-black text-slate-900 text-lg hidden sm:block tracking-tighter uppercase">Locitra</span>
                    </Link>
                    
                    <ShareButtons url={reportUrl} title={reportTitle} />
                </div>
            </header>

            <main>
                <ReportHero 
                    keyword={keyword} 
                    city={city} 
                    companyName={null} // Can be dynamic if we add branding to the SEO scan record
                />
                
                <OverviewCards stats={stats} />
                
                <CompetitorList competitors={results} />
                
                <div className="bg-white">
                    <OpportunitiesPanel keyword={keyword} city={city} />
                    <IssuesPanel />
                </div>
                
                <CTASection />
            </main>

            <footer className="bg-slate-50 border-t border-slate-200 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-slate-500 text-sm font-medium mb-4">
                        Powered by <span className="text-purple-600 font-bold uppercase tracking-tighter">Locitra</span> AI-Intelligence
                    </p>
                    <div className="flex justify-center gap-8">
                        <Link to="/" className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Home</Link>
                        <Link to="/tools" className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Free Tools</Link>
                        <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Login</Link>
                    </div>
                </div>
            </footer>

            {/* Lead Capture (after scroll) */}
            {showLeadCapture && !leadDismissed && !leadSent && (
                <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
                    <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-2xl p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="text-left">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Get the full breakdown</p>
                                <h3 className="text-lg font-black text-slate-900 leading-tight">Want a quick walkthrough + next-step plan?</h3>
                                <p className="text-slate-500 font-medium text-sm mt-1">Drop your email and weâ€™ll send follow-ups with recommendations.</p>
                            </div>
                            <button
                                onClick={() => { setLeadDismissed(true); setShowLeadCapture(false); }}
                                className="p-2 rounded-xl hover:bg-slate-50 transition-all"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input
                                value={lead.name}
                                onChange={(e) => setLead(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Name"
                                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium"
                            />
                            <input
                                value={lead.email}
                                onChange={(e) => setLead(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="Email*"
                                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium"
                            />
                            <input
                                value={lead.company}
                                onChange={(e) => setLead(prev => ({ ...prev, company: e.target.value }))}
                                placeholder="Company"
                                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium"
                            />
                        </div>

                        {leadError && (
                            <div className="mt-3 bg-red-50 border border-red-100 rounded-2xl p-3 text-left">
                                <p className="text-sm font-bold text-red-800">{leadError}</p>
                            </div>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-3">
                            <button
                                onClick={() => { setLeadDismissed(true); setShowLeadCapture(false); }}
                                className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-all"
                            >
                                Not now
                            </button>
                            <button
                                onClick={submitLead}
                                disabled={leadSending}
                                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-xl font-black hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                            >
                                <Send className={`w-4 h-4 ${leadSending ? "animate-pulse" : ""}`} />
                                {leadSending ? "Submitting..." : "Send me the plan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PublicReport;
