import { Link } from "react-router-dom";

export default function FinalCTA() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-50 opacity-[0.03] pattern-grid-lg"></div>
            
            <div className="max-w-[800px] mx-auto px-6 text-center relative z-10">
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
                    Start Finding High-Value Clients <span className="text-blue-600">Today</span>
                </h2>
                <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                    Stop guessing which businesses to contact. Let AI show you the best opportunities and exactly what to pitch them.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Link to="/register" className="w-full sm:w-auto text-center bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1">
                        Start Free Scan
                    </Link>
                </div>
                <p className="mt-6 text-sm text-slate-400 font-medium">Join 2,000+ agencies finding clients right now.</p>
            </div>
        </section>
    );
}
