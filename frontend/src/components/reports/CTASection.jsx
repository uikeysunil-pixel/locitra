import React from 'react';
import { Rocket, Sparkles, ArrowRight } from 'lucide-react';

const CTASection = () => {
    return (
        <section id="cta-section" className="py-24 bg-slate-900 overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl translate-y-[-50%]"></div>
                <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl translate-y-[-50%]"></div>
            </div>

            <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-bold mb-8 backdrop-blur-sm border border-white/10">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Limited Lifetime Offer
                </div>
                
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                    Want These Results For Your Business?
                </h2>
                
                <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
                    Get a personalized audit and discover exactly what's holding you back from the Google Maps #1 spot.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <button 
                        onClick={() => window.location.href = '/register'}
                        className="group flex items-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-xl shadow-2xl hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
                    >
                        Scan My Business
                        <Rocket className="w-6 h-6 text-purple-600 transition-transform group-hover:translate-x-1" />
                    </button>
                    
                    <a 
                        href="/tools" 
                        className="text-slate-400 hover:text-white font-bold text-lg flex items-center gap-2 group transition-colors"
                    >
                        Explore More Tools
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </a>
                </div>

                <div className="mt-16 pt-16 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-8">
                    {[
                        { label: "Free Scans", val: "Unlimited" },
                        { label: "Accuracy", val: "99.9%" },
                        { label: "Insights", val: "AI-Powered" },
                        { label: "Support", val: "24/7" }
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-white font-black text-lg mb-1">{stat.val}</div>
                            <div className="text-slate-500 text-xs uppercase tracking-widest font-bold">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CTASection;
