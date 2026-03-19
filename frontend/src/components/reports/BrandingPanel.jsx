import React from 'react';
import { Settings, Image, Type, MessageSquare, Eye } from 'lucide-react';

const BrandingPanel = ({ form, onChange, onDownloadPDF, onDownloadCSV, downloading }) => {
    return (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl">
            <div className="bg-slate-900 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-purple-400" />
                    <h2 className="text-xl font-bold text-white">White-Label Customization</h2>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <Eye className="w-4 h-4" />
                    Live Preview Enabled
                </div>
            </div>

            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Form */}
                    <div className="space-y-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                <Type className="w-4 h-4 text-slate-400" />
                                Your Company Name
                            </label>
                            <input 
                                type="text"
                                placeholder="e.g. Acme Marketing Agency"
                                value={form.companyName}
                                onChange={(e) => onChange('companyName', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                    Keyword
                                </label>
                                <input 
                                    type="text"
                                    placeholder="dentist"
                                    value={form.keyword}
                                    onChange={(e) => onChange('keyword', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                    City
                                </label>
                                <input 
                                    type="text"
                                    placeholder="Chicago"
                                    value={form.city}
                                    onChange={(e) => onChange('city', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                <MessageSquare className="w-4 h-4 text-slate-400" />
                                Custom Message
                            </label>
                            <textarea 
                                rows={4}
                                placeholder="Share a personal message with your client..."
                                value={form.customMessage}
                                onChange={(e) => onChange('customMessage', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all font-medium resize-none"
                            />
                        </div>

                        <div className="pt-4 flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={() => onDownloadPDF('pdf')}
                                disabled={downloading}
                                className="flex-1 px-6 py-4 bg-purple-600 text-white rounded-2xl font-black shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                            >
                                {downloading === 'pdf' ? 'Generating PDF...' : 'Download Branded PDF'}
                            </button>
                            <button 
                                onClick={() => onDownloadCSV('csv')}
                                disabled={downloading}
                                className="px-6 py-4 bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                            >
                                {downloading === 'csv' ? '...' : 'Export CSV'}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Mini Preview */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col">
                        <span className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest flex items-center gap-2">
                            <Eye className="w-3 h-3" />
                            Header Preview
                        </span>
                        
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden whitespace-normal break-words">
                            <span className="inline-block px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-[10px] font-bold mb-4 border border-purple-100">
                                {form.companyName || "Your Company Name"}
                            </span>
                            <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">
                                <span className="capitalize">{form.city || 'Chicago'}</span> <span className="capitalize">{form.keyword || 'Dentist'}</span> Market Analysis
                            </h3>
                            <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
                                {form.customMessage || "Your personalized AI-driven market report for 2026."}
                            </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-200 pt-4">
                            <span>Locitra Engine v2.4</span>
                            <span>© 2026 Locitra</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandingPanel;
