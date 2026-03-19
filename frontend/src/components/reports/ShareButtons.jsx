import React, { useState } from 'react';
import { Share2, Link as LinkIcon, MessageCircle, Linkedin, Check } from 'lucide-react';

const ShareButtons = ({ url, title }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareLinks = [
        {
            name: "WhatsApp",
            icon: MessageCircle,
            href: `https://wa.me/?text=Check%20this%20AI%20market%20report:%20${encodedUrl}`,
            color: "text-green-500 hover:bg-green-50"
        },
        {
            name: "Email",
            icon: Share2, // Using Share2 for Email if Mail icon is not imported, or just import Mail
            href: `mailto:?subject=${encodedTitle}&body=Check%20this%20AI%20market%20report:%20${encodedUrl}`,
            color: "text-slate-600 hover:bg-slate-50"
        },
        {
            name: "LinkedIn",
            icon: Linkedin,
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            color: "text-blue-600 hover:bg-blue-50"
        }
    ];

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Link"}
            </button>

            {shareLinks.map((link, i) => (
                <a
                    key={i}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-xl border border-slate-200 bg-white transition-all shadow-sm ${link.color}`}
                    title={`Share on ${link.name}`}
                >
                    <link.icon className="w-5 h-5" />
                </a>
            ))}
            
            <div className="ml-2 hidden sm:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Share2 className="w-3.5 h-3.5" />
                Share Report
            </div>
        </div>
    );
};

export default ShareButtons;
