import { Link } from "react-router-dom";

export default function Hero() {
    return (
        <section className="relative pt-32 pb-24 overflow-hidden" style={{ background: 'linear-gradient(135deg,#0f172a,#1e293b,#020617)' }}>
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8 animate-fade-in">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    New: AI-Powered Market Discovery is Live
                </div>

                <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-8 max-w-4xl mx-auto">
                    Find Local Business <br /> Opportunities <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Instantly</span>
                </h1>
                
                <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                    Locitra scans local markets, discovers SEO opportunities, and generates leads using AI.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link 
                        to="/register" 
                        className="group relative w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-300 hover:scale-[1.05] active:scale-95"
                    >
                        Start Free Scan
                        <span className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    </Link>
                    <Link 
                        to="/demo" 
                        className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg rounded-xl border border-slate-700 transition-all duration-300 hover:scale-[1.05] active:scale-95"
                    >
                        View Demo
                    </Link>
                </div>

                {/* Trust Badge */}
                <div className="mt-16 pt-8 border-t border-slate-800/50 max-w-sm mx-auto">
                    <p className="text-sm text-slate-500 font-medium">
                        Trusted by 500+ growth agencies worldwide
                    </p>
                </div>
            </div>
        </section>
    );
}
