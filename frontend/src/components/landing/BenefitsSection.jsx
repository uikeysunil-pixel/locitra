export default function BenefitsSection() {
    const benefits = [
        { title: "Find leads 10× faster", value: "10x", label: "Speed" },
        { title: "Target businesses likely to convert", value: "82%", label: "Conversion Rate" },
        { title: "Increase outreach response rates", value: "3.5x", label: "Responses" },
        { title: "Close higher value clients", value: "$3k+", label: "Avg Retainer" }
    ];

    return (
        <section className="py-24 bg-blue-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/always-grey.png')] opacity-10"></div>
            <div className="max-w-[1200px] mx-auto px-6 relative z-10">
                
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-4">The Impact of AI Prospecting</h2>
                    <p className="text-blue-100 text-lg">Shift your time from searching for leads to actually closing them.</p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benefits.map((b, i) => (
                        <div key={i} className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                            <div className="text-5xl font-black mb-2 tracking-tighter text-blue-50">{b.value}</div>
                            <div className="text-blue-200 text-xs font-bold tracking-widest uppercase mb-4">{b.label}</div>
                            <p className="text-white font-medium text-sm">{b.title}</p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
