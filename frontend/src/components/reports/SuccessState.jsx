import React from 'react';
import { CheckCircle2, Copy, FileText, Globe, ExternalLink, Mail, Send, AlertCircle, Share2, Rocket, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const SuccessState = ({ shareUrl, onDownloadPDF, onCopyLink, onSendEmail }) => {
    const [email, setEmail] = React.useState("");
    const [sending, setSending] = React.useState(false);
    const [sendError, setSendError] = React.useState(null);
    const [toast, setToast] = React.useState(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleCopy = async () => {
        const ok = await Promise.resolve(onCopyLink?.());
        if (ok) {
            showToast("Link copied ✅");
        }
    };

    const handleSend = async () => {
        setSendError(null);
        const to = String(email || "").trim();
        
        if (!to || !to.includes("@")) {
            setSendError("Please enter a valid recipient email address.");
            return;
        }

        setSending(true);
        try {
            const ok = await Promise.resolve(onSendEmail(to));
            if (ok) {
                showToast("Sent successfully ✅");
                setEmail("");
            } else {
                setSendError("Failed to send email. Please try again.");
            }
        } catch (e) {
            setSendError(e?.message || "Failed to send email. Please try again.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="relative max-w-2xl mx-auto">
            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800">
                        <span className="text-sm font-bold">{toast}</span>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-[2rem] border border-slate-200 p-6 md:p-10 shadow-2xl shadow-purple-500/5 animate-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-green-50/50">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Report Ready!</h2>
                    <p className="text-slate-500 font-medium text-lg">
                        Your branded market report has been generated successfully.
                    </p>
                    <p className="mt-1 text-purple-600 font-bold flex items-center gap-1.5">
                        <Rocket className="w-4 h-4" />
                        Share this report with your client and close deals faster 🚀
                    </p>

                    {/* PRIMARY ACTION */}
                    <div className="w-full mt-10">
                        <a 
                            href={shareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center justify-center w-full p-5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all outline-none focus:ring-4 focus:ring-purple-500/20"
                        >
                            <div className="flex items-center gap-3">
                                <Globe className="w-6 h-6 text-white/90 group-hover:scale-110 transition-transform" />
                                <span className="text-xl font-black text-white">View Report</span>
                                <ArrowRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </a>
                    </div>

                    {/* SECONDARY ACTIONS GROUP */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <button 
                            onClick={handleCopy}
                            className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-white transition-all group text-left"
                        >
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm group-hover:text-purple-600">
                                <Copy className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-black text-slate-900">Copy Link</div>
                                <div className="text-[11px] font-bold text-slate-400">Share anywhere</div>
                            </div>
                        </button>

                        <a 
                            href={`https://wa.me/?text=Check%20this%20AI%20market%20report:%20${encodeURIComponent(shareUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 bg-green-50/50 rounded-2xl border border-green-100 hover:border-green-300 hover:bg-green-50 transition-all group text-left"
                        >
                            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform text-white">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            </div>
                            <div>
                                <div className="text-sm font-black text-slate-900 uppercase">WhatsApp</div>
                                <div className="text-[11px] font-black text-green-600">Share instantly</div>
                            </div>
                        </a>
                    </div>

                    {/* EMAIL CARD */}
                    <div className="w-full mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-200 text-left">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                                <Mail className="w-4 h-4" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 lowercase first-letter:uppercase">Send this report to your client</h3>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="client@company.com"
                                className="flex-1 px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-bold placeholder:font-medium placeholder:text-slate-300"
                            />
                            <button
                                onClick={handleSend}
                                disabled={sending}
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
                            >
                                {sending ? <Zap className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {sending ? "Sending..." : "Send Report"}
                            </button>
                        </div>
                        
                        <p className="mt-3 text-[11px] font-bold text-slate-400 flex items-center gap-1.5 ml-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            We’ll deliver a professional report instantly
                        </p>

                        {sendError && (
                            <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                <span className="text-sm font-bold text-red-800">{sendError}</span>
                            </div>
                        )}
                    </div>

                    {/* FALLBACKS & DOWNLOADS */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
                        {onDownloadPDF && (
                            <button
                                onClick={onDownloadPDF}
                                className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-xs uppercase tracking-widest transition-all"
                            >
                                <FileText className="w-4 h-4" />
                                Download PDF again
                            </button>
                        )}
                        <a 
                            href={`mailto:${email}?subject=${encodeURIComponent("Market Report")}&body=${encodeURIComponent("Check this AI market report: " + shareUrl)}`}
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-xs uppercase tracking-widest transition-all"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Open in Mail Client
                        </a>
                    </div>
                </div>
            </div>

            {/* UPGRADE CTA */}
            <div className="mt-8 p-8 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2rem] text-center border border-white/10 shadow-xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Zap className="w-32 h-32 text-white" />
                </div>
                
                <h3 className="text-xl font-black text-white mb-2 relative z-10">Want more reports like this?</h3>
                <p className="text-white/60 font-bold mb-6 relative z-10">Upgrade now to unlock unlimited reports and premium insights.</p>
                
                <Link 
                    to="/billing"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-slate-50 transition-all shadow-xl hover:-translate-y-1 relative z-10"
                >
                    <span>Upgrade to Starter</span>
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
};

export default SuccessState;
