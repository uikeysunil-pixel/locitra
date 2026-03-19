import React from 'react';
import { Shield, Star, Globe, TrendingUp, Search, MapPin } from 'lucide-react';

const ReportPreview = ({ form }) => {
    const city = form.city || "Chicago";
    const keyword = form.keyword || "Dentist";
    const company = form.companyName || "Your Agency";
    const message = form.customMessage || "We've analyzed the local market to identify growth opportunities for your business.";

    return (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-full min-h-[600px]">
            {/* Browser Header Mac Style */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-4">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white border border-slate-200 rounded-lg py-1 px-4 text-[10px] text-slate-400 font-medium truncate">
                    locitra.com/report/{keyword.toLowerCase().replace(/\s+/g, '-')}-{city.toLowerCase().replace(/\s+/g, '-')}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6 border border-purple-100">
                        <MapPin className="w-3 h-3" />
                        {city} Market Analysis
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 leading-tight mb-4">
                        {city} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">{keyword}</span> Market Report
                    </h1>
                    <div className="flex items-center justify-center gap-3 text-sm font-bold text-slate-500">
                        <span>Prepared by {company}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>March 2026</span>
                    </div>
                </div>

                {/* Custom Message Card */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-10">
                    <p className="text-slate-600 text-sm italic leading-relaxed">
                        "{message}"
                    </p>
                </div>

                {/* Grid Stats */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Avg Rating</div>
                        <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            4.2
                            <div className="flex text-amber-500">
                                <Star className="w-4 h-4 fill-current" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Market Opp.</div>
                        <div className="text-2xl font-black text-green-600">High</div>
                    </div>
                </div>

                {/* Mock List */}
                <div className="space-y-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-4 px-2">Top Competitors in {city}</div>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400">
                                    #{i}
                                </div>
                                <div className="h-4 w-32 bg-slate-100 rounded-md animate-pulse" />
                            </div>
                            <div className="h-4 w-12 bg-slate-50 rounded-md" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-600 rounded-lg" />
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">Locitra</span>
                </div>
                <div className="text-[10px] font-bold text-slate-400 italic">
                    Live Data Preview
                </div>
            </div>
        </div>
    );
};

export default ReportPreview;
