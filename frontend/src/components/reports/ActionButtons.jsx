import React from 'react';
import { FileText, Download, Link, Check, Copy } from 'lucide-react';

const ActionButtons = ({ onGeneratePDF, onExportCSV, onCopyLink, onSendEmail, downloading, success, shareUrl }) => {
    const [copied, setCopied] = React.useState(false);
    const [showEmailInput, setShowEmailInput] = React.useState(false);
    const [email, setEmail] = React.useState("");
    const [sending, setSending] = React.useState(false);
    const [sent, setSent] = React.useState(false);

    const handleCopy = async () => {
        console.log("Copy link clicked");
        const ok = await Promise.resolve(onCopyLink?.());
        if (!ok) return;
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleBackendSend = async () => {
        console.log("Send via Locitra clicked", { email, shareUrl });
        if (!email || !email.includes("@")) {
            alert("Please enter a valid recipient email address.");
            return;
        }
        setSending(true);
        try {
            const ok = await Promise.resolve(onSendEmail?.(email));
            if (ok) {
                console.log("Email sent successfully via backend");
                setSent(true);
                setTimeout(() => { setSent(false); setShowEmailInput(false); }, 2000);
            } else {
                console.error("Backend email send returned failure");
            }
        } catch (err) {
            console.error("Backend email send error:", err);
        }
        setSending(false);
    };

    const handleMailClient = () => {
        console.log("Mail client clicked", { email, shareUrl });
        // Use shareUrl directly as it's already pre-formatted
        const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent("Market Report")}&body=${encodeURIComponent("Check this AI market report: " + shareUrl)}`;
        window.location.href = mailtoUrl;
    };

    return (
        <div className="flex flex-col gap-4 mt-8">
            <button
                onClick={onGeneratePDF}
                disabled={downloading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-purple-200 hover:shadow-purple-300 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3 text-lg"
            >
                {downloading === 'pdf' ? (
                    <>
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating PDF...
                    </>
                ) : (
                    <>
                        <FileText className="w-6 h-6" />
                        Generate Client PDF
                    </>
                )}
            </button>

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={onExportCSV}
                    disabled={downloading}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-700 font-bold hover:border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                    <Download className="w-5 h-5" />
                    Export CSV
                </button>

                <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-700 font-bold hover:border-slate-200 hover:bg-slate-50 transition-all"
                >
                    {copied ? (
                        <>
                            <Check className="w-5 h-5 text-green-500" />
                            <span className="text-green-600">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Link className="w-5 h-5" />
                            Copy Link
                        </>
                    )}
                </button>
            </div>

            {showEmailInput ? (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 animate-in slide-in-from-top-2">
                    <div className="flex gap-2">
                        <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="client@email.com"
                            className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-purple-500 transition-all"
                        />
                        <button 
                            onClick={handleBackendSend}
                            disabled={sending}
                            className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 disabled:opacity-50 transition-all"
                        >
                            {sending ? "..." : sent ? "Sent!" : "Send"}
                        </button>
                        <button onClick={() => setShowEmailInput(false)} className="p-2 text-slate-400 hover:text-slate-600">×</button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setShowEmailInput(true)}
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-purple-50 border-2 border-purple-100 rounded-2xl text-purple-700 font-bold hover:bg-purple-100 transition-all"
                    >
                        <Download className="w-5 h-5 rotate-180" />
                        Send via Locitra
                    </button>
                    <button
                        onClick={handleMailClient}
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 transition-all"
                    >
                        <Download className="w-5 h-5 rotate-180" />
                        Mail Client
                    </button>
                </div>
            )}

            <div className="flex justify-center">
                <a 
                    href={`https://wa.me/?text=Check%20this%20AI%20market%20report:%20${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-2 text-green-600 font-bold hover:text-green-700 transition-all text-sm"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                </a>
            </div>
        </div>
    );
};

export default ActionButtons;
