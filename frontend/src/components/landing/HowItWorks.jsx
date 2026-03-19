export default function HowItWorks() {
    const steps = [
        {
            title: "Scan Market",
            text: "Enter your keyword and city to start the discovery process.",
            icon: "🔍"
        },
        {
            title: "Find Opportunities",
            text: "Locitra detects weak competitors and SEO gaps in your niche.",
            icon: "💡"
        },
        {
            title: "Capture Leads",
            text: "Save high-value businesses directly into your lead dashboard.",
            icon: "📥"
        },
        {
            title: "Grow Revenue",
            text: "Convert insights into clients and scale your SEO agency.",
            icon: "💰"
        }
    ];

    return (
        <section className="py-24 bg-slate-50 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">How Locitra Works</h2>
                    <p className="text-slate-600 max-w-xl mx-auto text-lg">Four simple steps to transform your local outreach and generate more revenue.</p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-10 left-0 w-full h-0.5 bg-slate-200"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center relative z-10">
                        {steps.map((step, i) => (
                            <div key={i} className="flex flex-col items-center group">
                                <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-3xl mb-8 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-1">
                                    <span className="text-blue-600 font-bold text-2xl group-hover:hidden">{i + 1}</span>
                                    <span className="hidden group-hover:block animate-bounce">{step.icon}</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed px-4">{step.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

