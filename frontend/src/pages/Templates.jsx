import React, { useEffect } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingFooter from "../components/landing/LandingFooter";
import { Copy, Check, FileText } from "lucide-react";

export default function Templates() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const templates = [
        {
            name: "The 'SEO Gap' Strategy",
            subject: "Question about {{Business Name}}'s ranking in {{City}}",
            body: "Hi {{First Name}},\n\nI was just looking at {{City}} search results and noticed that {{Business Name}} is currently on the 3rd page for {{Keyword}}.\n\nYou're actually losing about {{Opportunity Score}} callers a month to {{Competitor Name}} just because of a few simple missing local SEO factors.\n\nI've attached a full audit of your competitors here. Would you like to see how we can move you to the top spot?\n\nBest,\n{{My Name}}",
            tag: "High Response"
        },
        {
            name: "The Video Audit Pitch",
            subject: "Quick video for {{Business Name}} team",
            body: "Hey {{First Name}},\n\nI just filmed a 2-minute video audit of your Google Business Profile. There's a small change you can make today that will likely double your map views.\n\nMind if I send the link over?\n\nRegards,\n{{My Name}}",
            tag: "Personalized"
        }
    ];

    const [copied, setCopied] = React.useState(null);

    const handleCopy = (text, idx) => {
        navigator.clipboard.writeText(text);
        setCopied(idx);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="font-sans antialiased bg-white text-slate-900 min-h-screen flex flex-col">
            <LandingNavbar />
            
            <main className="flex-1 py-20 px-6 max-w-5xl mx-auto">
                <div className="mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 font-display">
                        Cold Email <span className="text-blue-600">Templates</span>
                    </h1>
                    <p className="text-lg text-slate-600 font-medium">Proven scripts for closing local SEO clients. Copy, paste, and customize.</p>
                </div>

                <div className="space-y-12">
                    {templates.map((tpl, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-200 rounded-[32px] overflow-hidden transition-all hover:shadow-2xl">
                            <div className="bg-white border-b border-slate-200 p-6 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{tpl.name}</h3>
                                        <span className="text-[10px] uppercase tracking-widest font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{tpl.tag}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleCopy(tpl.subject + "\n\n" + tpl.body, i)}
                                    className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-all"
                                >
                                    {copied === i ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy All</>}
                                </button>
                            </div>
                            <div className="p-8 space-y-4">
                                <div>
                                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Subject:</span>
                                    <p className="font-bold text-slate-900">{tpl.subject}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block mb-1">Body:</span>
                                    <p className="text-slate-600 whitespace-pre-wrap leading-relaxed font-medium">{tpl.body}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
