import React, { useEffect } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingFooter from "../components/landing/LandingFooter";
import PricingPreview from "../components/landing/PricingPreview";
import { Check, ShieldCheck, Zap, Globe, MessageSquare } from "lucide-react";

export default function Pricing() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const faq = [
        {
            q: "Can I change my plan later?",
            a: "Yes, you can upgrade or downgrade your plan at any time from your billing dashboard."
        },
        {
            q: "Do you offer a free trial?",
            a: "Our 'Free' plan is free forever. For Starter and Agency plans, we offer a 7-day money-back guarantee."
        },
        {
            q: "What payment methods do you accept?",
            a: "We accept all major credit cards, PayPal, and Razorpay for our international and Indian customers."
        }
    ];

    return (
        <div className="font-sans antialiased bg-white text-slate-900">
            <LandingNavbar />
            
            <main>
                {/* Hero Section */}
                <section className="py-20 bg-slate-50 border-b border-slate-100">
                    <div className="max-w-[1200px] mx-auto px-6 text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
                            Ready to Scale Your <span className="text-blue-600">Agency?</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Choose the plan that fits your growth stage. From solo consultants to full-scale lead generation agencies.
                        </p>
                    </div>
                </section>

                {/* Main Pricing Grid (Reusing Preview component style) */}
                <PricingPreview />

                {/* Trust & Features Comparison */}
                <section className="py-24 bg-white">
                    <div className="max-w-[1000px] mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything You Need to Succeed</h2>
                            <p className="text-slate-600">All plans include these core features to help you find and close more deals.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                    <Globe size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-2">Global Market Search</h3>
                                    <p className="text-slate-600 text-sm italic line-clamp-2">Scan any city, any country, and any niche on Google Maps.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-2">Instant AI Insights</h3>
                                    <p className="text-slate-600 text-sm italic line-clamp-2">Get automated SEO audits and opportunity scores for every lead.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-2">Verified Data</h3>
                                    <p className="text-slate-600 text-sm italic line-clamp-2">Our system verifies emails and social profiles to ensure high delivery.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                                    <MessageSquare size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-2">Campaign Tracking</h3>
                                    <p className="text-slate-600 text-sm italic line-clamp-2">Manage your entire pipeline from within our built-in Lead CRM.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-24 bg-slate-50">
                    <div className="max-w-[800px] mx-auto px-6">
                        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            {faq.map((item, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md cursor-pointer group">
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">{item.q}</h3>
                                    <p className="text-slate-600">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
}
