import { Link } from "react-router-dom";

export default function LandingNavbar() {
    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-[1200px] mx-auto px-6 h-16 display flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <span className="text-xl font-extrabold tracking-tight text-slate-900">
                        Locitra <span className="text-blue-600">AI</span>
                    </span>
                </Link>

                {/* Center Menu */}
                <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
                    <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
                    <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
                    <a href="#blog" className="hover:text-blue-600 transition-colors">Blog</a>
                </div>

                {/* Right CTA */}
                <div className="flex items-center gap-4">
                    <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors">
                        Login
                    </Link>
                    <Link to="/register" className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-sm transition-all hover:shadow">
                        Start Free Trial
                    </Link>
                </div>
            </div>
        </nav>
    );
}
