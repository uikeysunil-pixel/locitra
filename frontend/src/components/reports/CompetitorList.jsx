import React from 'react';
import { Star, MessageSquare, MapPin, Trophy } from 'lucide-react';

const CompetitorList = ({ competitors }) => {
    return (
        <section className="py-12 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10 text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Top Competitors</h2>
                    <p className="text-slate-600">The most visible businesses currently dominating this market.</p>
                </div>

                <div className="grid gap-6">
                    {competitors.map((biz, index) => (
                        <div 
                            key={index} 
                            className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all duration-300 overflow-hidden"
                        >
                            {/* Rank Badge */}
                            <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                <div className={`flex items-center justify-center w-12 h-12 rounded-2xl font-black text-xl shadow-inner
                                    ${index === 0 ? 'bg-amber-100 text-amber-600' : 
                                      index === 1 ? 'bg-slate-100 text-slate-500' : 
                                      index === 2 ? 'bg-orange-100 text-orange-600' : 
                                      'bg-purple-50 text-purple-400'}`}
                                >
                                    {index + 1}
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                                        {biz.name || biz.title}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {biz.address || "Local Business"}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                <div className="flex flex-col items-center sm:items-end">
                                    <div className="flex items-center gap-1 text-amber-500 font-black">
                                        <Star className="w-4 h-4" fill="currentColor" />
                                        {biz.rating || "0.0"}
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rating</span>
                                </div>

                                <div className="flex flex-col items-center sm:items-end">
                                    <div className="flex items-center gap-1 text-slate-700 font-black">
                                        <MessageSquare className="w-4 h-4 text-slate-400" />
                                        {biz.reviews || 0}
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reviews</span>
                                </div>

                                {index === 0 && (
                                    <div className="hidden lg:flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ring-amber-500/20">
                                        <Trophy className="w-3.5 h-3.5" />
                                        Market Leader
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CompetitorList;
