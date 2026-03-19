import React, { useEffect } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingFooter from "../components/landing/LandingFooter";
import { Briefcase, User, Star, TrendingUp } from "lucide-react";

export default function UseCases() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const cases = [
        {
            title: "For Lead Gen Agencies",
            desc: "Automate your prospecting and deliver high-value reports to your clients. Turn cold leads into warm conversations using our AI insights.",
            icon: <Briefcase className="text-blue-600" />,
            color: "bg-blue-50"
        },
        {
            title: "For Solo Freelancers",
            desc: "Find your next high-paying client by identifying local businesses with poor SEO and providing them with a complete audit.",
            icon: <User className="text-purple-600" />,
            color: "bg-purple-50"
        },
        {
            title: "For Local SEO Experts",
            desc: "Track GMB rankings and monitor competition across multiple cities for your clients without manual work.",
            icon: <Star className="text-yellow-600" />,
            color: "bg-yellow-50"
        },
        {
            title: "For Growth Hackers",
            desc: "Aggressively scan and enrich datasets to build massive outreach campaigns across various industries.",
            icon: <TrendingUp className="text-green-600" />,
            color: "bg-green-50"
        }
    ];

    return (
        <div className="font-sans antialiased bg-white text-slate-900 min-h-screen">
            <LandingNavbar />
            
            <main className="py-24 px-6 max-w-[1200px] mx-auto">
                <div className="text-center mb-20 max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 font-display tracking-tight">
                        Built for <span className="text-blue-600">Growers</span>
                    </h1>
                    <p className="text-lg text-slate-600 font-medium">
                        Locitra is designed to be the ultimate companion for those who help local businesses win.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {cases.map((cs, i) => (
                        <div key={i} className="p-10 rounded-[32px] border border-slate-100 bg-slate-50 transition-all hover:shadow-2xl hover:-translate-y-2 group">
                            <div className={`w-14 h-14 ${cs.color} rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                                {cs.icon}
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">{cs.title}</h2>
                            <p className="text-slate-600 leading-relaxed font-medium">{cs.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
