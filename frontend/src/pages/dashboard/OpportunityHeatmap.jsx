import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Search, MapPin, TrendingUp, AlertCircle, 
    Download, Lock, ChevronRight, BarChart3, 
    Zap, AlertTriangle, CheckCircle2, Loader2 
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const OpportunityHeatmap = () => {
    const { token, user } = useAuthStore();
    const [keyword, setKeyword] = useState("");
    const [city, setCity] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const isPaid = user?.plan?.toLowerCase() !== "free";

    const handleAnalyze = async (e) => {
        if (e) e.preventDefault();
        if (!keyword || !city) return;

        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE}/opportunity-heatmap`, {
                params: { keyword, city },
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to analyze market. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        if (!isPaid) return;
        try {
            const res = await axios.get(`${API_BASE}/opportunity-heatmap/export`, {
                params: { keyword, city },
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Locitra-Leads-${city}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export failed", err);
        }
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 'High': return 'bg-red-50 text-red-700 border-red-100';
            case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'Low': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    const getIcon = (level) => {
        switch (level) {
            case 'High': return <AlertTriangle size={18} className="text-red-500" />;
            case 'Medium': return <Zap size={18} className="text-amber-500" />;
            case 'Low': return <CheckCircle2 size={18} className="text-emerald-500" />;
            default: return null;
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <BarChart3 className="text-blue-600" size={32} />
                    Local Opportunity Heatmap
                </h1>
                <p className="text-slate-500 mt-2 font-medium">Identify weakly optimized businesses in any city to generate high-quality SEO leads.</p>
            </div>

            {/* Input Panel */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                <form onSubmit={handleAnalyze} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Keyword (e.g. Dentist)"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="City (e.g. Chicago)"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group disabled:opacity-70"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                Analyze Market
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
                            </>
                        )}
                    </button>
                </form>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-3xl flex items-start gap-4">
                    <AlertCircle className="shrink-0 mt-1" />
                    <div>
                        <p className="font-bold">Analysis Failed</p>
                        <p className="text-sm opacity-90">{error}</p>
                    </div>
                </div>
            )}

            {data && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Heatmap Grid */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">Market Heatmap</h2>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> High Opp
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Medium
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.results.map((biz, idx) => (
                                <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400">
                                            #{biz.rank}
                                        </div>
                                        <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${getLevelColor(biz.level)}`}>
                                            {getIcon(biz.level)}
                                            {biz.level} Opportunity
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-lg line-clamp-1 mb-1">{biz.name}</h3>
                                    <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                                        <span className="flex items-center gap-1"><Zap size={14} className="text-amber-400" /> {biz.rating} Rating</span>
                                        <span className="flex items-center gap-1"><TrendingUp size={14} className="text-blue-400" /> {biz.reviews} Reviews</span>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score: {biz.opportunityScore}/3</span>
                                        <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${biz.opportunityScore >= 2 ? 'bg-red-500' : biz.opportunityScore === 1 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${(biz.opportunityScore / 3) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {data.isTruncated && (
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent z-10 rounded-3xl" />
                                <div className="bg-white rounded-3xl p-12 border-2 border-dashed border-blue-200 text-center relative z-20 shadow-xl shadow-blue-50/50">
                                    <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                                        <Lock size={32} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-3">Unlock Full Opportunity Heatmap</h3>
                                    <p className="text-slate-600 max-w-sm mx-auto mb-8 font-medium">
                                        Upgrade to Pro or Agency plan to see all {data.totalFound} business opportunities and access the full lead generation engine.
                                    </p>
                                    <a 
                                        href="/billing" 
                                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-10 py-4 rounded-2xl transition-all shadow-xl shadow-blue-200"
                                    >
                                        Upgrade Now
                                        <Zap size={18} />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Insights Panel */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">Lead Insights</h2>
                            <button 
                                onClick={handleExport}
                                disabled={!isPaid}
                                className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-all ${isPaid ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                            >
                                <Download size={16} />
                                Export Lead List
                            </button>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
                            {data.results.filter(b => b.level === 'High').length > 0 ? (
                                data.results.filter(b => b.level === 'High').map((lead, idx) => (
                                    <div key={idx} className="p-6 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-red-600">High Impact Lead</span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 mb-2">{lead.name}</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed italic">
                                            "{lead.insight}"
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-4" />
                                    <p className="text-slate-500 font-medium italic">No high-impact leads identified in this segment.</p>
                                </div>
                            )}
                        </div>

                        {isPaid && (
                            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
                                <div className="relative z-10">
                                    <h4 className="text-xl font-black mb-2">Pro Action Plan</h4>
                                    <p className="text-blue-100 text-sm font-medium leading-relaxed mb-6">
                                        Run a deep outreach campaign targeting these leads. Our CRM can help you track conversions.
                                    </p>
                                    <a href="/outreach" className="bg-white text-blue-600 font-black px-6 py-3 rounded-xl block text-center transition-all hover:scale-105 active:scale-95">
                                        Start Outreach
                                    </a>
                                </div>
                                <Zap className="absolute -right-4 -bottom-4 text-blue-500 opacity-20" size={160} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!data && !loading && !error && (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] py-24 text-center">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6 text-blue-600">
                        <Zap size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Ready to find opportunities?</h3>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto">
                        Enter a keyword and city above to visualize weakly optimized businesses.
                    </p>
                </div>
            )}
        </div>
    );
};

export default OpportunityHeatmap;
