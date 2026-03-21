import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Helmet } from "react-helmet";
import { Search, MapPin, Star, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import useAuthStore from "../../store/authStore";
import PricingPreview from "../../components/landing/PricingPreview";
import LockedReportGate from "./components/LockedReportGate";
import RankingHistoryChart from "../../components/RankingHistoryChart";
import SignupModal from "./components/SignupModal";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const GoogleMapsRankChecker = () => {
    const { token, user } = useAuthStore();
    const isAdmin = user?.role === "admin";
    const [keyword, setKeyword] = useState("");
    const [city, setCity] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState("");
    const [showLimitModal, setShowLimitModal] = useState(false);

    const handleCheckRankings = async (e) => {
        e.preventDefault();
        setError("");
        
        // Check session limit (Skip for admins)
        const lastScan = localStorage.getItem("locitra_public_scan");
        if (!isAdmin && lastScan) {
            setShowLimitModal(true);
            return;
        }

        if (!keyword || !city) {
            setError("Please enter both keyword and city.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE}/public-scan`, { keyword, city });
            setResults(response.data);
            localStorage.setItem("locitra_public_scan", Date.now());
        } catch (err) {
            console.error("Scan error:", err);
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Helmet>
                <title>Free Google Maps Ranking Checker | Locitra</title>
                <meta name="description" content="Check Google Maps rankings and analyze local competitors instantly. Free SEO tool by Locitra." />
            </Helmet>

            {/* Hero Section */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mb-6 font-bold text-2xl">
                        #1
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                        Free Google Maps Ranking Checker
                    </h1>
                    <p className="text-lg text-slate-600 mb-10">
                        See where businesses rank in any city. Get local SEO insights instantly without an account.
                    </p>

                    <form onSubmit={handleCheckRankings} className="flex flex-col md:row items-center gap-4 bg-white p-2 rounded-2xl shadow-xl border border-slate-100 max-w-2xl mx-auto">
                        <div className="flex-1 flex items-center px-4 w-full">
                            <Search size={20} className="text-slate-400 mr-3" />
                            <input 
                                type="text"
                                placeholder="Keyword (e.g. Dentist)"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="w-full py-3 bg-transparent outline-none text-slate-900 font-medium"
                                required
                            />
                        </div>
                        <div className="flex-1 flex items-center px-4 w-full">
                            <MapPin size={20} className="text-slate-400 mr-3" />
                            <input 
                                type="text"
                                placeholder="City (e.g. Chicago)"
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
                            {loading ? <Loader2 size={24} className="animate-spin" /> : "Check Rankings"}
                        </button>
                    </form>
                    {error && <div className="mt-6 text-red-600 bg-red-50 p-4 rounded-xl max-w-2xl mx-auto border border-red-100 font-medium">{error}</div>}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-12">
                {results ? (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Search Results</h2>
                                <p className="text-sm text-slate-500">Top ranking businesses for "{keyword}" in {city}</p>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded">Live Data</span>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rank</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Business</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reviews</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {results.results.map((biz) => (
                                        <tr key={biz.rank} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-5 font-black text-2xl text-blue-600">#{biz.rank}</td>
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

                        <div className="mt-8">
                            <RankingHistoryChart 
                                history={results.history || []} 
                                isLocked={!token && !isAdmin} 
                            />
                        </div>

                        <LockedReportGate 
                            toolName="Google Maps Rank Checker"
                            features={[
                                "Full competitor list (top 20+)",
                                "Interactive ranking movement maps",
                                "AI-powered SEO insights",
                                "Revenue & Review growth trends"
                            ]}
                        >
                            {/* Premium Content */}
                            <div className="mt-8 p-8 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-center text-center">
                                <div>
                                    <h4 className="font-bold text-blue-900 mb-2">Full Ranking Intelligence Unlocked</h4>
                                    <p className="text-blue-600 text-sm">You can now see the complete market layout and AI growth tips.</p>
                                </div>
                            </div>
                        </LockedReportGate>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                        <p className="text-slate-400 font-medium">Enter details above to check rankings instantly.</p>
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

export default GoogleMapsRankChecker;
