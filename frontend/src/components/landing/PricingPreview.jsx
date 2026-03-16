import { Link } from "react-router-dom";
import { plans } from "../../config/plans";

export default function PricingPreview() {
    return (
        <section id="pricing" className="py-24 bg-slate-50 border-b border-slate-200">
            <div className="max-w-[1200px] mx-auto px-6">
                
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
                    <p className="text-lg text-slate-600">Start for free. Upgrade when you close your first client.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div 
                            key={plan.name}
                            className={`p-8 rounded-2xl border transition-all duration-300 ${
                                plan.popular 
                                    ? "bg-slate-900 border-slate-800 shadow-xl shadow-blue-900/20 relative overflow-hidden transform md:-translate-y-4" 
                                    : "bg-white border-slate-200 shadow-sm hover:shadow-md"
                            }`}
                        >
                            {plan.popular && (
                                <>
                                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                                    <div className="absolute top-4 right-4 bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30">Most Popular</div>
                                </>
                            )}
                            
                            <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? "text-white" : "text-slate-900"}`}>{plan.name} Plan</h3>
                            <div className={`mb-6 font-medium ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>{plan.description}</div>
                            <div className={`text-4xl font-extrabold mb-8 ${plan.popular ? "text-white" : "text-slate-900"}`}>
                                ${plan.price}<span className={`text-lg font-medium ${plan.popular ? "text-slate-500" : "text-slate-400"}`}>/mo</span>
                            </div>
                            
                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className={`flex items-center gap-3 text-sm ${plan.popular ? "text-slate-300" : "text-slate-600"}`}>
                                        <span className={plan.popular ? "text-blue-400 font-bold" : "text-blue-500 font-bold"}>✓</span> 
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link 
                                to="/register" 
                                className={`block text-center w-full font-bold py-3 rounded-xl transition-colors ${
                                    plan.popular 
                                        ? "bg-blue-600 hover:bg-blue-500 text-white" 
                                        : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                                }`}
                            >
                                {plan.buttonText}
                            </Link>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
