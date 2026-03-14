export default function ProductScreens() {
    return (
        <section className="py-20 bg-slate-50 border-y border-slate-200 overflow-hidden relative">
            <div className="max-w-[1200px] mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                        A Complete Prospecting Arsenal
                    </h2>
                    <p className="text-lg text-slate-600">
                        Everything you need to discover and close local clients.
                    </p>
                </div>

                <div className="relative mx-auto max-w-4xl">
                    <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full"></div>
                    <div className="grid grid-cols-2 gap-4 md:gap-6 relative z-10 perspective-1000">
                        
                        {/* Market Scanner Panel */}
                        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xl transform rotate-y-[-2deg] rotate-x-[2deg] hover:rotate-0 transition-transform duration-500">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Market Scanner</div>
                            <div className="h-32 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-300">
                                [ Scanner Graphic ]
                            </div>
                        </div>

                        {/* Opportunity Dashboard Panel */}
                        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xl transform rotate-y-[2deg] rotate-x-[2deg] hover:rotate-0 transition-transform duration-500">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Opportunity Dashboard</div>
                            <div className="h-32 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-300">
                                [ Dashboard Graphic ]
                            </div>
                        </div>

                        {/* Lead CRM Panel */}
                        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xl transform -translate-y-4 rotate-y-[-2deg] hover:rotate-0 transition-transform duration-500">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Lead CRM</div>
                            <div className="h-32 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-300">
                                [ CRM Graphic ]
                            </div>
                        </div>

                        {/* Outreach Generator Panel */}
                        <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xl transform -translate-y-4 rotate-y-[2deg] hover:rotate-0 transition-transform duration-500">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">AI Outreach Generator</div>
                            <div className="h-32 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-300">
                                [ Outreach Graphic ]
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
