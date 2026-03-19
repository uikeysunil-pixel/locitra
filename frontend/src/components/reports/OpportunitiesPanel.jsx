import React from 'react';
import { Lightbulb, CheckCircle2, ArrowRight } from 'lucide-react';

const OpportunitiesPanel = ({ keyword, city }) => {
    const opportunities = [
        {
            title: `Missing "${keyword} near me" Keywords`,
            description: "Top 3 competitors are ranking for 'near me' intent but your business is missing these signals.",
            impact: "High Impact"
        },
        {
            title: "Low Competition Content Gaps",
            description: `Hyper-local content about ${city} services has very low difficulty in this niche.`,
            impact: "Quick Win"
        },
        {
            title: "Weak Competitor Gaps",
            description: "The #4 and #5 competitors have low review counts and can be easily outranked.",
            impact: "Growth Gap"
        }
    ];

    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-green-50 rounded-xl text-green-600">
                        <Lightbulb className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Opportunities for Growth</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {opportunities.map((item, index) => (
                        <div key={index} className="relative group bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:bg-green-50 hover:border-green-100 transition-all duration-300">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-100 px-2.5 py-1 rounded-lg">
                                    {item.impact}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-green-700">{item.title}</h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-6">{item.description}</p>
                            
                            <div className="mt-auto flex items-center gap-2 text-green-600 font-bold text-sm">
                                Explore this gap <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default OpportunitiesPanel;
