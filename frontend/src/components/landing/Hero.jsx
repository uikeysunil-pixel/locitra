import { useState } from "react";
import { Link } from "react-router-dom";

export default function Hero() {
    const [keyword, setKeyword] = useState("");
    const [city, setCity] = useState("");
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const handleRunScan = (e) => {
        e.preventDefault();
        setLoading(true);
        setShowResults(false);
        
        // Mock loading 1.5 seconds
        setTimeout(() => {
            setLoading(false);
            setShowResults(true);
        }, 1500);
    };

    const sampleResults = [
        { rank: 1, name: "Chicago Dental Experts", rating: 4.7, reviews: 210 },
        { rank: 2, name: "Smile Dental Clinic", rating: 4.6, reviews: 180 },
        { rank: 3, name: "Lincoln Park Dentistry", rating: 4.5, reviews: 162 },
    ];

    return (
        <section className="relative pt-32 pb-24 overflow-hidden" style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b,#020617)' }}>
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8 animate-fade-in text-nowrap">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            New: AI-Powered Market Discovery is Live
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-8">
                            Find Local SEO <br /> Opportunities <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">in Seconds</span>
                        </h1>
                        
                        <p className="text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed">
                            Scan any city, uncover weak competitors, and generate high-value local leads instantly.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <Link 
                                to="/register" 
                                className="group relative w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-300 hover:scale-[1.05] active:scale-95"
                            >
                                Get Started Free
                                <span className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                            </Link>
                        </div>

                        {/* Trust Badge */}
                        <div className="mt-16 pt-8 border-t border-slate-800/50 max-w-sm">
                            <p className="text-sm text-slate-500 font-medium">
                                Trusted by 500+ growth agencies worldwide
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Try a Sample Search
                            </h3>
                            
                            <form onSubmit={handleRunScan} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Keyword</label>
                                        <input 
                                            type="text"
                                            placeholder="e.g., dentist"
                                            value={keyword}
                                            onChange={(e) => setKeyword(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">City</label>
                                        <input 
                                            type="text"
                                            placeholder="e.g., chicago"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        />
                                    </div>
                                </div>
                                
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Scanning...
                                        </span>
                                    ) : "Run Free Scan"}
                                </button>
                            </form>

                            {showResults && (
                                <div className="mt-8 animate-fade-in-up">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                                    <th className="pb-3 px-2">Rank</th>
                                                    <th className="pb-3 px-2">Business</th>
                                                    <th className="pb-3 px-2">Rating</th>
                                                    <th className="pb-3 px-2">Reviews</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-slate-300">
                                                {sampleResults.map((res, i) => (
                                                    <tr key={i} className="border-b border-white/5 group hover:bg-white/5 transition-colors">
                                                        <td className="py-4 px-2 font-bold text-blue-400">#{res.rank}</td>
                                                        <td className="py-4 px-2 font-medium text-white">{res.name}</td>
                                                        <td className="py-4 px-2">{res.rating}</td>
                                                        <td className="py-4 px-2">{res.reviews}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    <div className="mt-6 p-4 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-center relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-blue-600/5 blur-xl group-hover:scale-110 transition-transform"></div>
                                        <p className="text-sm font-semibold text-blue-400 mb-4 relative z-10 flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                            </svg>
                                            Unlock full competitor insights and opportunity scores.
                                        </p>
                                        <Link 
                                            to="/register"
                                            className="inline-block py-2 px-6 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-500 transition-colors relative z-10"
                                        >
                                            Create Free Account
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Decorative background element for the card */}
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl -z-10"></div>
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -z-10"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
