export default function SolutionSection() {
    return (
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
            
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>

            <div className="max-w-[1200px] mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">
                        AI Finds Businesses That <span className="text-blue-400">Actually Need Your Help</span>
                    </h2>
                    <p className="text-lg text-slate-400">
                        We automated the entire prospecting workflow into a simple 3-step process.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
                    
                    {/* Step 1 */}
                    <div className="relative">
                        <div className="text-6xl font-black text-slate-800 opacity-50 absolute -top-8 -left-4 -z-10">1</div>
                        <h3 className="text-xl font-bold mb-4">Scan a City + Niche</h3>
                        <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                            Pick any geographic location and industry. Our engine instantly pools hundreds of local Google Maps listings.
                        </p>
                        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-xl">
                            <div className="flex items-center gap-3 text-sm font-mono text-blue-300">
                                <span className="text-slate-500">❯</span> Dentists in Dallas
                            </div>
                            <div className="flex items-center gap-3 text-sm font-mono text-blue-300 mt-2">
                                <span className="text-slate-500">❯</span> Lawyers in Miami
                            </div>
                            <div className="flex items-center gap-3 text-sm font-mono text-blue-300 mt-2">
                                <span className="text-slate-500">❯</span> Restaurants in Chicago
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative">
                        <div className="text-6xl font-black text-slate-800 opacity-50 absolute -top-8 -left-4 -z-10">2</div>
                        <h3 className="text-xl font-bold mb-4">AI Analyzes Data</h3>
                        <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                            We cross-reference every business to detect fundamental marketing flaws that you can solve.
                        </p>
                        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-xl space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-green-400">✓</span> Website Presence
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-green-400">✓</span> Google Reviews Count
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-green-400">✓</span> Average Rating
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-green-400">✓</span> SEO Signals
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative">
                        <div className="text-6xl font-black text-slate-800 opacity-50 absolute -top-8 -left-4 -z-10">3</div>
                        <h3 className="text-xl font-bold mb-4">Opportunity Score Generates</h3>
                        <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                            Every prospect gets an Opportunity Score from 0 to 100 based on how badly they need your services.
                        </p>
                        <div className="bg-slate-800 rounded-xl p-5 border border-blue-500 shadow-xl shadow-blue-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-blue-600 text-xs font-bold px-3 py-1 rounded-bl-lg">Opportunity Score: 91</div>
                            <h4 className="font-bold text-white mb-2 pb-2 border-b border-slate-700 mt-4">Issues Detected:</h4>
                            <ul className="space-y-2 mt-3">
                                <li className="text-xs font-semibold text-red-300 bg-red-900/30 px-3 py-2 rounded-lg inline-block mr-2 border border-red-500/20">No website</li>
                                <li className="text-xs font-semibold text-orange-300 bg-orange-900/30 px-3 py-2 rounded-lg inline-block mr-2 border border-orange-500/20">Low reviews</li>
                                <li className="text-xs font-semibold text-yellow-300 bg-yellow-900/30 px-3 py-2 rounded-lg inline-block border border-yellow-500/20">Poor SEO</li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
