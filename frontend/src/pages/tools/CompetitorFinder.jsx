import React, { useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { Users, Search, AlertCircle, Loader2, Star, MessageSquare } from 'lucide-react';
import LockedReportGate from './components/LockedReportGate';
import SignupModal from './components/SignupModal';
import useAuthStore from '../../store/authStore';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const CompetitorFinder = () => {
    const { user } = useAuthStore();
    const isAdmin = user?.role === "admin";
    const [keyword, setKeyword] = useState('');
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        
        const lastScan = localStorage.getItem('locitra_public_competitors');
        if (!isAdmin && lastScan) {
            setShowModal(true);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_BASE}/public-scan`, { keyword, city });
            setResults(res.data.results);
            localStorage.setItem('locitra_public_competitors', 'true');
        } catch (err) {
            setError(err.response?.data?.message || "Search failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Helmet>
                <title>Free Local Competitor Finder | Locitra</title>
                <meta name="description" content="Discover your top local competitors on Google Maps. See their ratings, review counts, and market positioning." />
            </Helmet>

            <div className="bg-white border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 mb-6">
                        <Users size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                        Local Competitor Finder
                    </h1>
                    <p className="text-lg text-slate-600 mb-10">
                        Identify who is currently winning in your local market and why.
                    </p>

                    <form onSubmit={handleSearch} className="flex flex-col md:row items-center gap-4 bg-white p-2 rounded-2xl shadow-xl border border-slate-100 max-w-2xl mx-auto">
                        <div className="flex-1 flex items-center px-4 w-full">
                            <Search size={20} className="text-slate-400 mr-3" />
                            <input 
                                type="text"
                                placeholder="Service (e.g. Plumber)"
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
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-70 w-full md:w-auto"
                        >
                            {loading ? <Loader2 size={24} className="animate-spin mx-auto" /> : "Find Competitors"}
                        </button>
                    </form>
                    {error && <div className="mt-6 text-red-600 bg-red-50 p-4 rounded-xl max-w-2xl mx-auto border border-red-100">{error}</div>}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-12">
                {results ? (
                    <div className="animate-in fade-in duration-500">
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-12">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Competitor</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reviews</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {results.map((biz, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-slate-900">{biz.name || biz.title}</div>
                                                <div className="text-xs text-slate-400 mt-1">{biz.address}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center text-amber-500 font-bold">
                                                    <Star size={16} fill="currentColor" className="mr-1" />
                                                    {biz.rating}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center text-slate-600 font-medium">
                                                    <MessageSquare size={16} className="text-slate-300 mr-2" />
                                                    {biz.reviews}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <LockedReportGate 
                            toolName="Competitor Finder"
                            features={[
                                "Full market density report",
                                "Competitor pricing insights",
                                "Historical ranking maps",
                                "Review sentiment analysis"
                            ]}
                        >
                            {/* Premium Content */}
                            <div className="mt-8 p-8 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-center text-center">
                                <div>
                                    <h4 className="font-bold text-blue-900 mb-2">Market Layout Unlocked</h4>
                                    <p className="text-blue-600 text-sm">You can now see the complete landscape of local competitors.</p>
                                </div>
                            </div>
                        </LockedReportGate>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                        <p className="text-slate-400 font-medium">Search for a service and city to discover your top competitors.</p>
                    </div>
                )}
            </div>

            <SignupModal isOpen={showModal} onClose={() => setShowModal(false)} title="Competitor Finder Limit Reached" />
        </div>
    );
};

export default CompetitorFinder;
