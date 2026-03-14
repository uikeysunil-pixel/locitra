import { Link } from "react-router-dom";

export default function PricingPreview() {
    return (
        <section id="pricing" className="py-24 bg-slate-50 border-b border-slate-200">
            <div className="max-w-[1200px] mx-auto px-6">
                
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
                    <p className="text-lg text-slate-600">Start for free. Upgrade when you close your first client.</p>
                </div>

                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                    
                    {/* Free Plan */}
                    <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Free Plan</h3>
                        <div className="text-slate-500 mb-6 font-medium">Perfect for testing the waters.</div>
                        <div className="text-4xl font-extrabold text-slate-900 mb-8">$0<span className="text-lg text-slate-400 font-medium">/mo</span></div>
                        
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-slate-600 text-sm">
                                <span className="text-blue-500 font-bold">✓</span> 5 scans per day
                            </li>
                            <li className="flex items-center gap-3 text-slate-600 text-sm">
                                <span className="text-blue-500 font-bold">✓</span> Basic AI analysis
                            </li>
                            <li className="flex items-center gap-3 text-slate-400 text-sm opacity-50">
                                <span>✕</span> Lead CRM
                            </li>
                            <li className="flex items-center gap-3 text-slate-400 text-sm opacity-50">
                                <span>✕</span> AI outreach generator
                            </li>
                        </ul>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl shadow-blue-900/20 relative overflow-hidden transform md:-translate-y-4">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                        <div className="absolute top-4 right-4 bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30">Most Popular</div>
                        
                        <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
                        <div className="text-slate-400 mb-6 font-medium">Build a full agency pipeline.</div>
                        <div className="text-4xl font-extrabold text-white mb-8">$49<span className="text-lg text-slate-500 font-medium">/mo</span></div>
                        
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-slate-300 text-sm">
                                <span className="text-blue-400 font-bold">✓</span> <strong className="text-white">Unlimited scans</strong>
                            </li>
                            <li className="flex items-center gap-3 text-slate-300 text-sm">
                                <span className="text-blue-400 font-bold">✓</span> <strong className="text-white">Full AI analysis</strong>
                            </li>
                            <li className="flex items-center gap-3 text-slate-300 text-sm">
                                <span className="text-blue-400 font-bold">✓</span> Lead CRM Access
                            </li>
                            <li className="flex items-center gap-3 text-slate-300 text-sm">
                                <span className="text-blue-400 font-bold">✓</span> AI outreach generator
                            </li>
                        </ul>

                        <Link to="/register" className="block text-center w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors">
                            Start Free Trial
                        </Link>
                    </div>

                </div>

            </div>
        </section>
    );
}
