import { Link } from "react-router-dom";
import useUiStore from "../../store/uiStore";

export default function FinalCTA() {
    const { openAuthModal } = useUiStore();
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
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                    <button 
                        onClick={() => openAuthModal("register")}
                        className="group relative w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xl rounded-2xl shadow-xl shadow-blue-600/20 transition-all duration-300 hover:scale-[1.05] active:scale-95"
                    >
                        Start Free Scan
                        <span className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    </button>
                    <Link 
                        to="/tools" 
                        className="w-full sm:w-auto px-10 py-5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xl rounded-2xl border border-slate-700 transition-all duration-300 hover:scale-[1.05] active:scale-95"
                    >
                        Explore Free Tools
                    </Link>
                </div>
            </div>
        </section>
    );
}

