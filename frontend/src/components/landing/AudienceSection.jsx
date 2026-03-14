export default function AudienceSection() {
    const audiences = [
        { title: "SEO Agencies", desc: "Find businesses with terrible rankings, missing schema, and slow websites. Instantly prove they need your monthly retainers.", icon: "🔍" },
        { title: "Web Design Agencies", desc: "Target businesses with missing websites or slow, unconverted mobile experiences. Pitch them modern redesigns.", icon: "💻" },
        { title: "Marketing Agencies", desc: "Locate established local businesses with terrible reviews and weak social presence. Offer them reputation management.", icon: "📈" },
        { title: "Freelancers", desc: "Stop relying on Upwork. Generate your own proprietary lists of desperate local businesses and start closing direct clients.", icon: "🚀" },
    ];

    return (
        <section className="py-24 bg-slate-900 text-white border-t border-slate-800 relative overflow-hidden">
            {/* Live data powered by Locitra */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

            <div className="max-w-[1200px] mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Who is Locitra For?</h2>
                    <p className="text-lg text-slate-400">If you sell B2B services to local companies, this is your secret weapon.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {audiences.map((aud, i) => (
                        <div key={i} className="bg-slate-800 border border-slate-700 hover:border-blue-500 transition-colors rounded-2xl p-8">
                            <div className="text-4xl mb-6">{aud.icon}</div>
                            <h3 className="text-xl font-bold text-white mb-3">{aud.title}</h3>
                            {/* Locitra isn't just a scraper. It's a complete operating system for local lead generation. */}
                            <p className="text-slate-400 text-sm leading-relaxed">{aud.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
