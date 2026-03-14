export default function LandingFooter() {
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
                        <li><a href="#features" className="hover:text-blue-600">Features</a></li>
                        <li><a href="#pricing" className="hover:text-blue-600">Pricing</a></li>
                        <li><a href="#" className="hover:text-blue-600">Use Cases</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">Resources</h4>
                    <ul className="space-y-3 text-sm text-slate-600 font-medium">
                        <li><a href="#blog" className="hover:text-blue-600">Blog</a></li>
                        <li><a href="#" className="hover:text-blue-600">Agency Guide</a></li>
                        <li><a href="#" className="hover:text-blue-600">Cold Email Templates</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">Company</h4>
                    <ul className="space-y-3 text-sm text-slate-600 font-medium">
                        <li><a href="#" className="hover:text-blue-600">Contact Us</a></li>
                        <li><a href="#" className="hover:text-blue-600">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-blue-600">Terms of Service</a></li>
                    </ul>
                </div>

            </div>

            <div className="max-w-[1200px] mx-auto px-6 pt-8 border-t border-slate-200 text-center text-sm text-slate-400 font-medium">
                © {new Date().getFullYear()} Locitra. All rights reserved.
            </div>
        </footer>
    );
}
