import { Link } from "react-router-dom";

export default function FinalCTA() {
    return (
        <section className="py-24 bg-slate-900 overflow-hidden relative">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-[50%] h-full bg-blue-600/10 blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[50%] h-full bg-purple-600/10 blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
                    Start Discovering Local Opportunities Today
                </h2>
                <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Find businesses that need your services and convert them into clients.
                </p>
                <div className="flex justify-center">
                    <Link 
                        to="/scan" 
                        className="group relative px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xl rounded-2xl shadow-xl shadow-blue-600/20 transition-all duration-300 hover:scale-[1.05] active:scale-95"
                    >
                        Start Free Scan
                        <span className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    </Link>
                </div>
            </div>
        </section>
    );
}
