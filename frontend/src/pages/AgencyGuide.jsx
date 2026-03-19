import React, { useEffect } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingFooter from "../components/landing/LandingFooter";
import { BookOpen, Award, CheckCircle } from "lucide-react";

export default function AgencyGuide() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="font-sans antialiased bg-slate-50 text-slate-900 min-h-screen">
            <LandingNavbar />
            
            <main className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white p-12 md:p-16 rounded-[48px] border border-slate-200 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 blur-[100px]"></div>
                        
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 mb-6 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                                <BookOpen size={14} /> Agency Resource
                            </div>
                            
                            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8 font-display leading-tight">
                                High-Growth <span className="text-blue-600">Agency Guide</span>
                            </h1>
                            
                            <p className="text-xl text-slate-600 mb-12 leading-relaxed font-medium">
                                Scaling from $0 to $10k/month requires more than just tools—it requires a system. 
                                This guide outlines the exact framework our top partners use to scale their local SEO agencies.
                            </p>

                            <div className="space-y-12">
                                <section>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                        <Award className="text-blue-600" /> Phase 1: The Foundation
                                    </h2>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-semibold flex items-center gap-3">
                                            <CheckCircle className="text-green-500 shrink-0" size={18} /> Identifying Profitable Niches
                                        </div>
                                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-semibold flex items-center gap-3">
                                            <CheckCircle className="text-green-500 shrink-0" size={18} /> Setting Your Proxy Pricing
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                        <TrendingUp className="text-purple-600" /> Phase 2: Prospecting at Scale
                                    </h2>
                                    <p className="text-slate-600 mb-6">Using Locitra to find companies with clear SEO gaps and generating white-labeled reports that close meetings automatically.</p>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}

const TrendingUp = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
)
