import React from 'react';
import { AlertTriangle, XCircle, Info } from 'lucide-react';

const IssuesPanel = () => {
    const issues = [
        {
            title: "Low Review Velocity",
            description: "Competitors are gaining 5+ reviews per month. Your current profile shows stagnant growth.",
            severity: "Critical"
        },
        {
            title: "Poor Keyword Density",
            description: "Your GMB categories and description lack key service associations for this market.",
            severity: "Warning"
        },
        {
            title: "Missing Citations",
            description: "Consistent business info is missing on 40% of major local directories.",
            severity: "Attention"
        }
    ];

    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-red-50 rounded-xl text-red-600">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Identified Critical Issues</h2>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {issues.map((item, index) => (
                        <div key={index} className="flex gap-6 items-start bg-white border border-slate-200 rounded-3xl p-6 hover:border-red-100 hover:bg-red-50/30 transition-all">
                            <div className={`mt-1 flex-shrink-0 p-2 rounded-xl ${
                                item.severity === 'Critical' ? 'bg-red-100 text-red-600' : 
                                item.severity === 'Warning' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'
                            }`}>
                                {item.severity === 'Critical' ? <XCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                        item.severity === 'Critical' ? 'bg-red-600 text-white' : 
                                        item.severity === 'Warning' ? 'bg-orange-500 text-white' : 'bg-slate-500 text-white'
                                    }`}>
                                        {item.severity}
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default IssuesPanel;
