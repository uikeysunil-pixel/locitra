import { Link, useNavigate, useLocation } from "react-router-dom";
import useUiStore from "../../store/uiStore";

export default function LandingNavbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { openAuthModal } = useUiStore();

    const handleFeaturesClick = (e) => {
        e.preventDefault();
        if (location.pathname === "/") {
            const el = document.getElementById("features");
            if (el) el.scrollIntoView({ behavior: "smooth" });
        } else {
            navigate("/");
            setTimeout(() => {
                const el = document.getElementById("features");
                if (el) el.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-xl font-extrabold tracking-tight text-slate-900">
                        Locitra <span className="text-blue-600">AI</span>
                    </span>
                </Link>

                {/* Center Menu */}
                <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
                    <a 
                        href="#features" 
                        onClick={handleFeaturesClick}
                        className="hover:text-blue-600 transition-colors"
                    >
                        Features
                    </a>
                    <Link to="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
                    <Link to="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
                </div>

                {/* Right CTA */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => openAuthModal("login")}
                        className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => openAuthModal("register")}
                        className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-sm transition-all hover:shadow"
                    >
                        Create Free Account
                    </button>
                </div>
            </div>
        </nav>
    );
}
