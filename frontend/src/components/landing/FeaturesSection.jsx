export default function FeaturesSection() {
    const features = [
        {
            title: "Google Maps Scanner",
            desc: "Type in any keyword and city. Our engine pools hundreds of business listings instantly without you lifting a finger.",
            icon: "🗺️"
        },
        {
            title: "AI Opportunity Scoring",
            desc: "Instead of guessing, our algorithm grades businesses based on how badly they need help with their online presence.",
            icon: "🎯"
        },
        {
            title: "AI Outreach Generator",
            desc: "Generate personalized cold emails targeting the exact weaknesses our system discovered for that specific prospect.",
            icon: "⚡"
        },
        {
            title: "Lead CRM",
            desc: "Save the best prospects to your built-in CRM Pipeline. Track who you contacted and who became a paying client.",
            icon: "💼"
        },
        {
            title: "Top Opportunities Dashboard",
            desc: "Never look at a blank screen again. Log in and instantly see a ranked list of the absolute best leads to contact today.",
            icon: "🔥"
        }
    ];

    return (
        <section id="features" className="py-24 bg-white">
            <div className="max-w-[1200px] mx-auto px-6">
                
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
                        Everything You Need To Build A Client Roster
                    </h2>
                    <p className="text-lg text-slate-600">
                        Locitra isn't just a scraper. It's a complete operating system for local lead generation.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feat, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-100 p-8 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="text-4xl mb-6">{feat.icon}</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">{feat.title}</h3>
                            <p className="text-slate-600 leading-relaxed">{feat.desc}</p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
