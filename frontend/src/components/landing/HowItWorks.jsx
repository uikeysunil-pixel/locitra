export default function HowItWorks() {
    const steps = [
        {
            title: "Scan Market",
            text: "Select your city and niche to find local business listings.",
            icon: "🔍"
        },
        {
            title: "Find Opportunities",
            text: "Identify businesses with weak SEO or missing websites.",
            icon: "💡"
        },
        {
            title: "Save Leads",
            text: "Export high-potential prospects directly to your CRM.",
            icon: "📥"
        },
        {
            title: "AI Outreach",
            text: "Send personalized, AI-generated pitches to close deals.",
            icon: "✉️"
        }
    ];

    return (
        <section className="py-24 bg-slate-50">
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
                            <div key={i} className="flex flex-col items-center">
                                <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-3xl mb-8 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                                    <span className="hidden group-hover:block animate-bounce">{step.icon}</span>
                                    <span className="text-blue-600 font-bold text-2xl">{i + 1}</span>
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
