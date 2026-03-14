export default function ProblemSection() {
    const problems = [
        { title: "Manual Google Maps Searches", desc: "Wasting hours scrolling map listings to find decent leads without any filtering criteria." },
        { title: "Checking Websites Individually", desc: "Clicking every single website link to blindly guess if they need a redesign or SEO help." },
        { title: "Analyzing Reviews Manually", desc: "Reading through competitor reviews to figure out who has a weak reputation in the market." },
        { title: "Sending Blind Outreach", desc: "Using generic cold email templates that get ignored because you don't know the business' actual pain points." }
    ];

    return (
        <section className="py-24 bg-white">
            <div className="max-w-[1200px] mx-auto px-6">
                
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
                        Finding Local Clients Is <span className="text-red-500">Slow</span> and <span className="text-red-500">Unpredictable</span>
                    </h2>
                    <p className="text-lg text-slate-600">
                        Stop doing manual labor that takes away time you should be spending closing deals and fulfilling services.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {problems.map((prob, i) => (
                        <div key={i} className="bg-red-50/50 border border-red-100 rounded-2xl p-8 hover:bg-red-50 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex justify-center items-center font-bold mb-6">✕</div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">{prob.title}</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">{prob.desc}</p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
