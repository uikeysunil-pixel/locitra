import React, { useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { BarChart3, Search, AlertCircle, Loader2, Minus, TrendingUp } from 'lucide-react';
import LockedSection from './components/LockedSection';
import SignupModal from './components/SignupModal';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ReviewGapAnalyzer = () => {
    const [businessName, setBusinessName] = useState('');
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        
        const lastScan = localStorage.getItem('locitra_public_reviewgap');
        if (lastScan) {
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
            
            const results = res.data.results;
            const topCompetitor = results[0]; // Highest ranking
            const you = results.find(b => b.title.toLowerCase().includes(businessName.toLowerCase())) || { reviews: 0 };
            
            const gap = Math.max(0, topCompetitor.reviews - you.reviews);
            const target = Math.ceil(gap * 0.7); // Estimated to compete

            setData({
                yourReviews: you.reviews,
                topCompetitorReviews: topCompetitor.reviews,
                topCompetitorName: topCompetitor.title,
                gap,
                target
            });
            
            localStorage.setItem('locitra_public_reviewgap', 'true');
        } catch (err) {
            setError(err.response?.data?.message || "Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Helmet>
                <title>Free Google Review Gap Analyzer | Locitra</title>
                <meta name="description" content="Calculate the review gap between you and your top Google Maps competitors. See how many reviews you need to rank higher." />
            </Helmet>

            <div className="bg-white border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 mb-6">
                        <BarChart3 size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                        Review Gap Analyzer
                    </h1>
                    <p className="text-lg text-slate-600 mb-10">
                        See exactly how many reviews you need to beat your top local competitor.
                    </p>

                    <form onSubmit={handleAnalyze} className="flex flex-col md:row items-center gap-4 bg-white p-2 rounded-2xl shadow-xl border border-slate-100 max-w-2xl mx-auto">
                        <div className="flex-1 flex items-center px-4 w-full">
                            <Search size={20} className="text-slate-400 mr-3" />
                            <input 
                                type="text"
                                placeholder="Your Business Name"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
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
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg w-full md:w-auto"
                        >
                            {loading ? <Loader2 size={24} className="animate-spin mx-auto" /> : "Analyze Gap"}
                        </button>
                    </form>
                    {error && <div className="mt-6 text-red-600 bg-red-50 p-4 rounded-xl max-w-2xl mx-auto border border-red-100 font-medium">{error}</div>}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-12">
                {data ? (
                    <div className="animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center">
                                <div className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-2">Your Reviews</div>
                                <div className="text-3xl font-black text-slate-900">{data.yourReviews}</div>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center border-b-4 border-b-orange-500">
                                <div className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-2 text-orange-600">Review Gap</div>
                                <div className="text-3xl font-black text-slate-900">{data.gap}</div>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center">
                                <div className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-2">Top Competitor</div>
                                <div className="text-3xl font-black text-slate-900">{data.topCompetitorReviews}</div>
                                <div className="text-xs text-slate-400 mt-1 truncate px-2">{data.topCompetitorName}</div>
                            </div>
                        </div>

                        <div className="bg-orange-600 rounded-3xl p-10 text-white shadow-xl mb-12 relative overflow-hidden">
                            <div className="relative z-10 flex flex-col md:row items-center justify-between gap-8">
                                <div className="flex-1">
                                    <div className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Target Goal</div>
                                    <h3 className="text-3xl font-bold mb-4">Acquire {data.target} New Reviews</h3>
                                    <p className="text-orange-100 text-lg">
                                        You need approximately <span className="font-bold text-white">{data.target}</span> more reviews to reach the <span className="font-black">Competition Threshold</span> for "{city}".
                                    </p>
                                </div>
                                <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white text-orange-600 font-black text-3xl shadow-inner border-4 border-orange-400/30 shrink-0">
                                    +{data.target}
                                </div>
                            </div>
                            <TrendingUp size={200} className="absolute -bottom-16 -right-16 text-white/10 rotate-12 pointer-events-none" />
                        </div>

                        <LockedSection 
                            title="Unlock Competitor Review Growth Trends"
                            features={[
                                "Monthly review velocity comparison",
                                "AI review generation strategies",
                                "Competitor sentiment heatmaps",
                                "Customer review source tracking"
                            ]}
                        />
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                        <p className="text-slate-400 font-medium">Enter your business details to analyze the review gap in your local market.</p>
                    </div>
                )}
            </div>

            <SignupModal isOpen={showModal} onClose={() => setShowModal(false)} title="Review Gap Limit Reached" />
        </div>
    );
};

export default ReviewGapAnalyzer;
