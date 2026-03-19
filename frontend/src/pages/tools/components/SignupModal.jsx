import React from 'react';
import { Link } from 'react-router-dom';
import { X, Check } from 'lucide-react';

const SignupModal = ({ isOpen, onClose, title = "Unlock Full Local SEO Analysis" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="p-8 pb-0 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 text-blue-600 mb-6 border-4 border-white shadow-sm">
                        <Check size={40} strokeWidth={3} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
                    <p className="text-slate-600 mb-8">
                        Join 2,000+ business owners using Locitra to dominate their local market.
                    </p>
                </div>

                <div className="bg-slate-50 p-8 border-t border-slate-100">
                    <ul className="space-y-4 mb-8">
                        {[
                            "Unlimited daily ranking scans",
                            "AI-powered SEO recommendations",
                            "Competitor weakness alerts",
                            "Export reports to PDF & CSV",
                            "Lead contact data discovery"
                        ].map((feature, i) => (
                            <li key={i} className="flex items-center text-slate-700">
                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 shrink-0">
                                    <Check size={12} strokeWidth={4} />
                                </div>
                                <span className="text-sm font-medium">{feature}</span>
                            </li>
                        ))}
                    </ul>
                    <Link 
                        to="/signup" 
                        className="flex items-center justify-center w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-md active:scale-[0.98]"
                    >
                        Create Your Free Account
                    </Link>
                    <p className="text-center text-xs text-slate-400 mt-4">
                        Quick setup. No credit card required.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupModal;
