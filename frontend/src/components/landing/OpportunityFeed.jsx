import { useEffect, useState } from "react";

const mockOpportunities = [
    { city: "Dallas", niche: "Dentist", score: 92, issue: "No website", color: "text-red-600", bg: "bg-red-50" },
    { city: "Austin", niche: "Restaurant", score: 88, issue: "Poor SEO", color: "text-orange-600", bg: "bg-orange-50" },
    { city: "Miami", niche: "Lawyer", score: 90, issue: "Low reviews", color: "text-yellow-600", bg: "bg-yellow-50" },
    { city: "Chicago", niche: "Plumber", score: 87, issue: "Outdated website", color: "text-slate-600", bg: "bg-slate-50" },
    { city: "Denver", niche: "Roofing", score: 95, issue: "Unclaimed profile", color: "text-red-600", bg: "bg-red-50" },
    { city: "Seattle", niche: "HVAC", score: 86, issue: "No reviews", color: "text-orange-600", bg: "bg-orange-50" },
];

export default function OpportunityFeed() {
    const [feed, setFeed] = useState(mockOpportunities.slice(0, 4));

    useEffect(() => {
        const interval = setInterval(() => {
            setFeed(prev => {
                const arr = [...prev];
                // Rotate array to simulate live incoming data
                const first = arr.shift();
                arr.push(mockOpportunities[Math.floor(Math.random() * mockOpportunities.length)]);
                return arr;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-20 border-t border-slate-100 bg-white overflow-hidden">
            <div className="max-w-[1200px] mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Opportunities Discovered Right Now</h2>
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                        Live data powered by Locitra
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {feed.map((item, i) => (
                        <div key={i} className="animate-[slideIn_0.5s_ease-out] bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-sm font-bold text-slate-800">{item.city}</div>
                                    <div className="text-xs text-slate-500 font-medium">{item.niche}</div>
                                </div>
                                <div className="bg-green-100 text-green-700 text-xs font-extrabold px-2 py-1 rounded">
                                    Score {item.score}
                                </div>
                            </div>
                            <div className={`mt-2 ${item.bg} ${item.color} font-semibold text-xs px-3 py-2 rounded-lg inline-block border border-opacity-20`}>
                                Issue: {item.issue}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <style jsx>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </section>
    );
}
