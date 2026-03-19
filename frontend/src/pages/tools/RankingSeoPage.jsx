import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { Search, MapPin, Star, MessageSquare, Loader2, AlertCircle, ChevronRight, Globe } from 'lucide-react';
import LockedSection from './components/LockedSection';
import RankingHistoryChart from '../../components/RankingHistoryChart';
import PricingPreview from '../../components/landing/PricingPreview';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const RankingSeoPage = () => {
    const { slug } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, [slug]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Parse slug: keyword-city (last hyphen is the divider)
            const parts = slug.split('-');
            const city = parts.pop();
            const keyword = parts.join(' ') || parts[0]; // fallback if no hyphen

            const res = await axios.get(`${API_BASE}/seo-scan/${encodeURIComponent(keyword)}/${encodeURIComponent(city)}`);
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load ranking data.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Loading local SEO insights...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Data Not Available</h2>
                    <p className="text-slate-600 mb-8">{error}</p>
                    <Link to="/tools" className="inline-flex items-center justify-center w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                        Back to Tools Hub
                    </Link>
                </div>
            </div>
        );
    }

    const { keyword, city, results, totalResults, lastUpdated } = data;
    const year = new Date().getFullYear();
    const formattedDate = lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'Recent';

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Helmet>
                <title>{`${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Google Maps Rankings in ${city.charAt(0).toUpperCase() + city.slice(1)} | Locitra`}</title>
                <meta name="description" content={`See the top ${keyword} ranking on Google Maps in ${city}. Analyze competitors, ratings, and reviews with Locitra's free local SEO tool.`} />
            </Helmet>

            {/* Breadcrumbs */}
            <div className="max-w-6xl mx-auto px-4 pt-8">
                <nav className="flex items-center text-sm font-medium text-slate-400 gap-2">
                    <Link to="/tools" className="hover:text-blue-600 transition-colors">Tools</Link>
                    <ChevronRight size={14} />
                    <Link to="/tools/google-maps-rank-checker" className="hover:text-blue-600 transition-colors">Rank Checker</Link>
                    <ChevronRight size={14} />
                    <span className="text-slate-600 truncate">{keyword} in {city}</span>
                </nav>
            </div>

            {/* Hero Section */}
            <header className="max-w-4xl mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                    Top {keyword.charAt(0).toUpperCase() + keyword.slice(1)} Ranking on Google Maps in {city.charAt(0).toUpperCase() + city.slice(1)}
                </h1>
                <p className="text-xl text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                    Discover which {keyword} rank on Google Maps in {city}. See competitor ratings, review counts, and local SEO insights powered by Locitra.
                </p>
                <div className="flex items-center justify-center gap-4 text-sm font-bold text-slate-400">
                    <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                        <Globe size={14} /> {totalResults} Businesses Tracked
                    </span>
                    <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                        Updated {formattedDate}
                    </span>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Business</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reviews</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {results.map((biz) => (
                                <tr key={biz.rank} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-6 border-l-4 border-transparent group-hover:border-blue-500 transition-all font-black text-2xl text-blue-600">
                                        #{biz.rank}
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="font-bold text-lg text-slate-900">{biz.title}</div>
                                        <div className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                            <MapPin size={12} className="text-slate-300" />
                                            {biz.address}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center text-amber-500 font-bold">
                                            <Star size={16} fill="currentColor" className="mr-1" />
                                            {biz.rating}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
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
                        history={data.history || []} 
                        isLocked={true} 
                    />
                </div>

                <LockedSection 
                    title="Unlock Full Local SEO Analysis"
                    features={[
                        "Full competitor list (top 20+)",
                        "Interactive ranking movement maps",
                        "AI-powered SEO insights",
                        "Revenue & Review growth trends"
                    ]}
                />

                <div className="mt-24 space-y-12">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Why monitor local rankings?</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            Google Maps rankings are the primary driver of new customers for local businesses. Locitra provides the intelligence you need to outrank competitors and capture more market share.
                        </p>
                    </div>
                    <PricingPreview />
                </div>
            </div>
        </div>
    );
};

export default RankingSeoPage;
