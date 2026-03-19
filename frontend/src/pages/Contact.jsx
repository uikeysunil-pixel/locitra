import React, { useEffect } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingFooter from "../components/landing/LandingFooter";
import { Mail, MessageSquare, Clock, Shield } from "lucide-react";

export default function Contact() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="font-sans antialiased bg-white text-slate-900 min-h-screen flex flex-col">
            <LandingNavbar />
            
            <main className="flex-1 py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 font-display">
                            Get in <span className="text-blue-600">Touch</span>
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Have questions about our agency plans or custom solutions? Our team is here to help you scale your lead generation.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="flex gap-6 p-8 rounded-3xl bg-slate-50 border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1">
                                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-1">Email Us</h3>
                                    <p className="text-slate-600 mb-2">Technical & Billing Support</p>
                                    <a href="mailto:support@locitra.com" className="text-blue-600 font-bold hover:underline">support@locitra.com</a>
                                </div>
                            </div>

                            <div className="flex gap-6 p-8 rounded-3xl bg-slate-50 border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1">
                                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
                                    <MessageSquare size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-1">Live Chat</h3>
                                    <p className="text-slate-600 mb-2">Available for Agency Plan members</p>
                                    <span className="text-blue-600 font-bold">24/7 Priority Support</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-6 p-6">
                                <Shield className="text-green-500" size={20} />
                                <span className="text-sm font-medium text-slate-500 italic">Encrypted and secure information handling</span>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-2xl shadow-blue-900/5">
                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="John Doe" 
                                        className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-slate-900 font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        placeholder="john@agency.com" 
                                        className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-slate-900 font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Message</label>
                                    <textarea 
                                        rows="4" 
                                        placeholder="Tell us about your requirements..." 
                                        className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-slate-900 font-medium resize-none"
                                    ></textarea>
                                </div>
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-5 rounded-2xl shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98]">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
