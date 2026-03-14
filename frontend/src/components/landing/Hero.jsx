import { Link } from "react-router-dom";
import { useState } from "react";

export default function Hero() {
    const [scanLoading, setScanLoading] = useState(false);
    const [scanned, setScanned] = useState(false);

    const handleMockScan = () => {
        setScanLoading(true);
        setTimeout(() => {
            setScanLoading(false);
            setScanned(true);
        }, 1500);
    };

    return (
        <section className="bg-slate-50 pt-20 pb-24 overflow-hidden">
            <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                
                {/* Left Content */}
                <div>
                    <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                        Find Local Businesses That Need Your Services — <span className="text-blue-600">Instantly</span>
                    </h1>
                    <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
                        Locitra scans Google Maps and identifies businesses that need SEO, websites, or marketing help.
                    </p>

                    {/* Interactive Demo Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 mb-8">
                        <div className="flex gap-3 mb-4">
                            <select className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors">
                                <option>Dallas, TX</option>
                                <option>Austin, TX</option>
                                <option>Chicago, IL</option>
                            </select>
                            <select className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-3 outline-none focus:border-blue-500 transition-colors">
                                <option>Dentists</option>
                                <option>Restaurants</option>
                                <option>Lawyers</option>
                            </select>
                        </div>
                        <button 
                            onClick={handleMockScan}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg shadow-md transition-all flex justify-center items-center"
                        >
                            {scanLoading ? (
                                <span className="animate-pulse">Scanning Maps...</span>
                            ) : "Scan Market"}
                        </button>

                        {/* Mock Results */}
                        <div className={`mt-4 space-y-3 transition-all duration-500 overflow-hidden ${scanned ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-slate-900">Smile Dental</div>
                                    <div className="text-xs text-red-600 font-medium mt-1">Weakness: No website</div>
                                </div>
                                <div className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-xs">Score 92</div>
                            </div>
                            <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-slate-900">BrightCare Dental</div>
                                    <div className="text-xs text-orange-600 font-medium mt-1">Weakness: Low reviews</div>
                                </div>
                                <div className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-xs">Score 88</div>
                            </div>
                            <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-slate-900">Urban Smiles</div>
                                    <div className="text-xs text-yellow-600 font-medium mt-1">Weakness: Poor SEO</div>
                                </div>
                                <div className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-xs">Score 84</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Link to="/register" className="w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]">
                            Start Free Scan
                        </Link>
                        <p className="text-xs text-slate-500 font-medium">
                            No credit card required • Setup in 60 seconds
                        </p>
                    </div>
                </div>

                {/* Right Content - Mock UI Preview */}
                <div className="relative hidden lg:block perspective-1000">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-[2rem] blur-3xl" />
                    <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 transform rotate-y-[-5deg] rotate-x-[5deg] transition-transform hover:rotate-0 duration-700">
                        {/* Fake Browser Top */}
                        <div className="flex gap-2 items-center px-4 py-3 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        {/* Dashboard Mock */}
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg">Top Opportunities</h3>
                                <div className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-semibold">12 Found</div>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { n: "Apex Roofing", w: "No Website", s: 95 },
                                    { n: "City Plumbers", w: "2.1 Rating", s: 89 },
                                    { n: "Elite Law Firm", w: "Not claimed", s: 85 }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between p-4 border border-slate-100 rounded-xl hover:shadow-md transition-shadow">
                                        <div>
                                            <div className="font-semibold text-slate-800">{item.n}</div>
                                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> {item.w}
                                            </div>
                                        </div>
                                        <button className="text-sm font-semibold text-blue-600 bg-blue-50 px-4 rounded-lg">Save Lead</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
