import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, CheckCircle2 } from 'lucide-react';

const LockedSection = ({ title, features, ctaText = "Create Free Account to unlock full analysis" }) => {
    return (
        <div className="mt-12 relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-8 group">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10"></div>
            
            <div className="relative z-20 text-center py-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6">
                    <Lock size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
                <div className="flex flex-wrap justify-center gap-6 mb-10 max-w-2xl mx-auto">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-center text-slate-600 font-medium">
                            <CheckCircle2 size={18} className="text-blue-500 mr-2" />
                            {feature}
                        </div>
                    ))}
                </div>
                <Link 
                    to="/signup" 
                    className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                >
                    {ctaText}
                </Link>
            </div>

            {/* Blurred Background UI Mockup */}
            <div className="absolute inset-0 flex flex-col gap-4 p-8 pointer-events-none opacity-20 filter blur-[4px]">
                <div className="h-8 w-1/3 bg-slate-300 rounded"></div>
                <div className="h-32 w-full bg-slate-200 rounded"></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-slate-200 rounded"></div>
                    <div className="h-24 bg-slate-200 rounded"></div>
                </div>
            </div>
        </div>
    );
};

export default LockedSection;
