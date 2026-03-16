export default function FeaturesSection() {
    const features = [
        {
            title: "Market Scanner",
            desc: "Scan any city and keyword to discover local businesses.",
            img: "/assets/features/market-scanner.png"
        },
        {
            title: "Opportunity Dashboard",
            desc: "Analyze ranking gaps and discover high-demand markets.",
            img: "/assets/features/opportunity-dashboard.png"
        },
        {
            title: "Lead CRM",
            desc: "Save and organize potential business leads.",
            img: "/assets/features/lead-crm.png"
        },
        {
            title: "AI Outreach Generator",
            desc: "Generate personalized outreach messages.",
            img: "/assets/features/ai-outreach.png"
        }
    ];

    return (
        <section id="features" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
                        Powering Your Local Growth
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        The complete toolkit for agencies and consultants to dominated local markets.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {features.map((feat, i) => (
                        <div key={i} className="group text-center">
                            <div className="relative mb-8 inline-block">
                                <div className="absolute inset-0 bg-blue-100 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <img 
                                    src={feat.img} 
                                    alt={feat.title} 
                                    loading="lazy"
                                    className="relative w-20 h-20 mx-auto object-contain hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">{feat.desc}</p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
