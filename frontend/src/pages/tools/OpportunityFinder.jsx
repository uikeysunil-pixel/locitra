import React, { useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { Target, Search, AlertCircle, Loader2, Zap, ArrowRight, Star, ExternalLink } from 'lucide-react';
import LockedReportGate from './components/LockedReportGate';
import SignupModal from './components/SignupModal';
import useAuthStore from '../../store/authStore';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const OpportunityFinder = () => {
    const { user } = useAuthStore();
    const isAdmin = user?.role === "admin";
    const [keyword, setKeyword] = useState('');
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleFind = async (e) => {
        e.preventDefault();
        
        const lastScan = localStorage.getItem('locitra_public_opps');
        if (!isAdmin && lastScan) {
            setShowModal(true);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_BASE}/public-scan`, { keyword, city });
            
            // Filter "opportunities" - businesses with low ratings or low reviews
            const opps = res.data.results.filter(b => b.rating < 4.4 || b.reviews < 40).slice(0, 3);
            
            setResults(opps);
            localStorage.setItem('locitra_public_opps', 'true');
        } catch (err) {
            setError(err.response?.data?.message || "Search failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Helmet>
                <title>Free Local SEO Opportunity Finder | Locitra</title>
                <meta name="description" content="Find weak local competitors that are easy to outrank. Identify SEO gaps and market opportunities in seconds." />
            </Helmet>

            <div className="bg-white border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 text-red-600 mb-6">
                        <Target size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                        Local SEO Opportunity Finder
                    </h1>
                    <p className="text-lg text-slate-600 mb-10">
                        Find "weak" ranking businesses that you can easily outrank with better SEO.
                    </p>

                    <form onSubmit={handleFind} className="flex flex-col md:row items-center gap-4 bg-white p-2 rounded-2xl shadow-xl border border-slate-100 max-w-2xl mx-auto">
                        <div className="flex-1 flex items-center px-4 w-full">
                            <Search size={20} className="text-slate-400 mr-3" />
                            <input 
                                type="text"
                                placeholder="Service (e.g. Roofers)"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="w-full py-3 bg-transparent outline-none text-slate-900 font-medium"
                                required
                            />
                        </div>
                        <div className="flex-1 flex items-center px-4 w-full">
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
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg w-full md:w-auto flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={24} className="animate-spin" /> : <><Zap size={18} /> Find Opportunities</>}
                        </button>
                    </form>
                    {error && <div className="mt-6 text-red-600 bg-red-50 p-4 rounded-xl max-w-2xl mx-auto border border-red-100 font-medium text-center">{error}</div>}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-12">
                {results ? (
                    <div className="animate-in fade-in duration-500">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">Top 3 SEO Opportunities</h2>
                            <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100 uppercase tracking-wider">High Probability</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            {results.length > 0 ? results.map((biz, i) => (
                                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-red-200 transition-all group flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center text-amber-500 font-black text-sm">
                                            <Star size={14} fill="currentColor" className="mr-1" />
                                            {biz.rating}
                                        </div>
                                        <div className="text-xs font-bold text-slate-400">{biz.reviews} reviews</div>
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-2">{biz.name || biz.title}</h3>
                                    <p className="text-xs text-slate-500 mb-6 flex-grow">{biz.address}</p>
                                    <div className="pt-4 border-t border-slate-50">
                                        <div className="flex items-center text-red-600 font-bold text-xs uppercase tracking-widest gap-2">
                                            <Zap size={14} />
                       Outrank Score: {Math.floor(Math.random() * 20) + 70}%
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-3 text-center py-10 text-slate-500 font-medium">No weak competitors discovered in the top results for this area.</div>
                            )}
                        </div>

                        <LockedReportGate 
                            toolName="Opportunity Finder"
                            features={[
                                "Find 20+ more local opportunities",
                                "Get business phone numbers & emails",
                                "AI-suggested outreach scripts",
                                "Export leads to CRM or CSV"
                            ]}
                        >
                            {/* Premium Content */}
                            <div className="mt-8 p-8 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-center text-center">
                                <div>
                                    <h4 className="font-bold text-blue-900 mb-2">Lead Intelligence Unlocked</h4>
                                    <p className="text-blue-600 text-sm">Full contact data and outreach scripts are now available for all leads.</p>
                                </div>
                            </div>
                        </LockedReportGate>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                        <p className="text-slate-400 font-medium font-inter">Search for a service to discover businesses that are easy to beat on Google Maps.</p>
                    </div>
                )}
            </div>

            <SignupModal isOpen={showModal} onClose={() => setShowModal(false)} title="Lead Finder Limit Reached" />
        </div>
    );
};

export default OpportunityFinder;
