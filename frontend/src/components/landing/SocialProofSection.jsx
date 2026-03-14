export default function SocialProofSection() {
    const agencies = [
        "SEO Agencies",
        "Web Design Agencies",
        "Marketing Agencies",
        "Lead Gen Experts",
        "Freelancers"
    ];

    return (
        <section className="py-12 bg-slate-50 border-t border-slate-100">
            <div className="max-w-[1200px] mx-auto px-6 text-center">
                <p className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-8">
                    Built specifically for
                </p>
                <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 lg:gap-12 opacity-70">
                    {agencies.map((agency, i) => (
                        <div key={i} className="text-lg md:text-xl font-bold font-serif text-slate-800 tracking-tight">
                            {agency}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
