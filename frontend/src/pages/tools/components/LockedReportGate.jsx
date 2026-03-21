import React from 'react';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import useUiStore from '../../../store/uiStore';

/**
 * LockedReportGate Component
 * Standardized conversion gate for all tools.
 * 
 * @param {string} toolName - Name of the tool (for logging/desc)
 * @param {string[]} features - List of features unlocked
 * @param {React.ReactNode} children - The premium content to show if unlocked
 */
const LockedReportGate = ({ toolName, features, children }) => {
    const { token, user } = useAuthStore();
    const { openAuthModal } = useUiStore();
    const isAdmin = user?.role === "admin";
    
    // If user is logged in OR is admin, show the full report (children)
    if (token || isAdmin) {
        return <>{children}</>;
    }

    return (
        <div className="mt-12 relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 md:p-12 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Background pattern for premium feel */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
                {/* Lock Icon */}
                <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-inner border border-blue-100/50">
                    <Lock size={36} strokeWidth={2.5} />
                </div>

                {/* Content */}
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tight">Full Report Locked</h3>
                <p className="text-lg text-slate-600 mb-10 max-w-xl leading-relaxed">
                    Unlock full competitor insights and AI-powered recommendations with a free account.
                </p>

                {/* Features List */}
                {features && features.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mb-12 text-left max-w-2xl mx-auto">
                        {features.map((feature, i) => (
                            <div key={i} className="flex items-center text-slate-700 font-bold text-sm">
                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 shrink-0">
                                    <CheckCircle2 size={14} strokeWidth={3} />
                                </div>
                                {feature}
                            </div>
                        ))}
                    </div>
                )}

                {/* Primary CTA */}
                <div className="w-full max-w-sm">
                    <button 
                        onClick={() => {
                            if (toolName) localStorage.setItem('post_signup_redirect', window.location.pathname);
                            openAuthModal("register");
                        }}
                        className="group flex items-center justify-center w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-500/20 active:scale-[0.98]"
                    >
                        Unlock Full Reports
                        <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    {/* Subtext */}
                    <p className="mt-4 text-sm font-semibold text-slate-400 flex items-center justify-center gap-2">
                        No credit card required <span className="text-slate-200 text-xs">•</span> Instant access
                    </p>
                </div>
            </div>

            {/* Blurred UI Mockup (Visual placeholder for premium content) */}
            <div className="absolute -bottom-20 left-10 right-10 flex flex-col gap-4 opacity-[0.08] filter blur-[4px] pointer-events-none select-none">
                <div className="h-8 w-1/3 bg-slate-900 rounded-lg"></div>
                <div className="h-40 w-full bg-slate-800 rounded-2xl"></div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-slate-800 rounded-2xl"></div>
                    <div className="h-24 bg-slate-800 rounded-2xl"></div>
                    <div className="h-24 bg-slate-800 rounded-2xl"></div>
                </div>
            </div>
        </div>
    );
};

export default LockedReportGate;
