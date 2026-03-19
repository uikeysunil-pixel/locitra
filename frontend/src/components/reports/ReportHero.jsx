import React from 'react';
import { Target, TrendingUp, Users } from 'lucide-react';

const ReportHero = ({ keyword, city, companyName }) => {
    const year = new Date().getFullYear();
    
    return (
        <div className="relative overflow-hidden bg-white pt-16 pb-12 sm:pt-24 sm:pb-16 border-b border-slate-100">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-purple-50 opacity-50 blur-3xl text-purple-600"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-blue-50 opacity-50 blur-3xl text-blue-600"></div>
            
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                <div className="flex justify-center mb-6">
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 ring-1 ring-inset ring-purple-600/20">
                        {companyName || "Locitra Intelligence"} Exclusive Report
                    </span>
                </div>
                
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6">
                    <span className="block text-purple-600 capitalize">{city} {keyword}</span>
                    <span className="block">Market Analysis ({year + 1})</span>
                </h1>
                
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                    AI-powered local SEO insights and competitive benchmarking for businesses in {city}. Discover growth opportunities and market gaps.
                </p>
                
                <div className="mt-10 flex flex-wrap justify-center gap-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                        <Users className="w-4 h-4 text-purple-500" />
                        Competitor Analysis
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                        <Target className="w-4 h-4 text-blue-500" />
                        SEO Opportunities
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        Growth Insights
                    </div>
                </div>

                <div className="mt-12">
                    <button 
                        onClick={() => document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="rounded-full bg-slate-900 px-8 py-4 text-lg font-bold text-white shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
                    >
                        Get Your Free Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportHero;
