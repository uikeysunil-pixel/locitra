export default function ProductScreens() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <div className="mb-16">
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">See Opportunities Instantly</h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        Analyze markets, identify competitors, and capture leads in one powerful dashboard.
                    </p>
                </div>

                <div className="relative group">
                    <div className="absolute inset-0 bg-blue-600/5 rounded-[2.5rem] blur-3xl group-hover:bg-blue-600/10 transition-colors duration-500"></div>
                    <div className="relative mx-auto max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 transition-transform duration-700 hover:scale-[1.01]">
                        <img 
                            src="/assets/dashboard-preview.png" 
                            alt="Locitra Dashboard Preview" 
                            loading="lazy"
                            className="w-full h-auto block"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

