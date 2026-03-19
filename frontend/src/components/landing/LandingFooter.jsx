import { Link, useNavigate, useLocation } from "react-router-dom";

export default function LandingFooter() {
    const navigate = useNavigate();
    const location = useLocation();

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
        <footer className="bg-slate-50 border-t border-slate-200 py-12">
            <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-4 gap-8 mb-12">
                
                <div className="md:col-span-1">
                    <span className="text-xl font-extrabold tracking-tight text-slate-900 block mb-4">
                        Locitra <span className="text-blue-600">AI</span>
                    </span>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        The intelligent prospecting engine for marketing agencies and freelancers.
                    </p>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">Product</h4>
                    <ul className="space-y-3 text-sm text-slate-600 font-medium">
                        <li>
                            <a 
                                href="#features" 
                                onClick={handleFeaturesClick}
                                className="hover:text-blue-600 transition-colors"
                            >
                                Features
                            </a>
                        </li>
                        <li><Link to="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
                        <li><Link to="/use-cases" className="hover:text-blue-600 transition-colors">Use Cases</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">Resources</h4>
                    <ul className="space-y-3 text-sm text-slate-600 font-medium">
                        <li><Link to="/blog" className="hover:text-blue-600 transition-colors">Blog</Link></li>
                        <li><Link to="/agency-guide" className="hover:text-blue-600 transition-colors">Agency Guide</Link></li>
                        <li><Link to="/templates" className="hover:text-blue-600 transition-colors">Cold Email Templates</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">Company</h4>
                    <ul className="space-y-3 text-sm text-slate-600 font-medium">
                        <li><Link to="/contact" className="hover:text-blue-600 transition-colors">Contact Us</Link></li>
                        <li><Link to="/privacy-policy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                        <li><Link to="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
                    </ul>
                </div>

            </div>

            <div className="max-w-[1200px] mx-auto px-6 pt-8 border-t border-slate-200 text-center text-sm text-slate-400 font-medium">
                © {new Date().getFullYear()} Locitra. All rights reserved.
            </div>
        </footer>
    );
}
