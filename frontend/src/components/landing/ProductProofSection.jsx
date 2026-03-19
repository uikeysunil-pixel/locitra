import React from "react";
import { Link } from "react-router-dom";

const exampleLeads = [
    { name: "Chicago Dental Experts", city: "Chicago", rank: "#7", reviews: 23, opportunity: "High" },
    { name: "Lincoln Park Dentistry", city: "Chicago", rank: "#9", reviews: 18, opportunity: "High" },
    { name: "Austin Family Dental", city: "Austin", rank: "#6", reviews: 42, opportunity: "Medium" },
    { name: "NY Midtown Dental", city: "New York", rank: "#8", reviews: 35, opportunity: "Medium" },
];

export default function ProductProofSection() {
    return (
        <section className="py-24 bg-slate-900 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                        See Real Opportunities Found by Locitra
                    </h2>
                    <p className="text-xl text-slate-400 leading-relaxed">
                        Locitra analyzes thousands of local businesses daily to uncover growth gaps for agencies.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 mb-16">
                    {/* Data Table */}
                    <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h3 className="font-bold text-white">Example Market Scan: Dental (US Cities)</h3>
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full uppercase tracking-wider">Live Analysis</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5">
                                    <tr className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                        <th className="py-4 px-6">Business</th>
                                        <th className="py-4 px-6 text-center">Rank</th>
                                        <th className="py-4 px-6 text-center">Reviews</th>
                                        <th className="py-4 px-6 text-right">Opportunity</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300">
                                    {exampleLeads.map((lead, i) => (
                                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-white">{lead.name}</div>
                                                <div className="text-xs text-slate-500">{lead.city}</div>
                                            </td>
                                            <td className="py-4 px-6 text-center text-blue-400 font-mono font-bold">{lead.rank}</td>
                                            <td className="py-4 px-6 text-center">{lead.reviews}</td>
                                            <td className="py-4 px-6 text-right">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                    lead.opportunity === 'High' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'
                                                }`}>
                                                    {lead.opportunity}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Insights Panel */}
                    <div className="space-y-6">
                        <div className="bg-blue-600 p-8 rounded-3xl shadow-xl shadow-blue-600/20 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>
                            <h4 className="text-blue-100 uppercase tracking-widest text-xs font-bold mb-4">Opportunity Insight</h4>
                            <p className="text-2xl font-bold text-white leading-tight">
                                72% of dental clinics ranking below position #5 have fewer than 50 reviews.
                            </p>
                            <div className="mt-6 flex items-center gap-2 text-blue-200 text-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                High probability of ranking increase
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
                            <h4 className="text-slate-500 uppercase tracking-widest text-xs font-bold mb-4">Estimated Revenue</h4>
                            <div className="text-4xl font-extrabold text-white mb-2">$148,000</div>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                potential SEO revenue discovered from just 20 scanned businesses.
                            </p>
                            <div className="w-full bg-slate-800 h-2 rounded-full mt-6 overflow-hidden">
                                <div className="bg-blue-500 h-full w-[65%]" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <Link 
                        to="/register" 
                        className="inline-flex items-center gap-2 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xl rounded-2xl shadow-xl shadow-blue-600/20 transition-all duration-300 hover:scale-[1.05] active:scale-95"
                    >
                        Run Free Scan
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
}
