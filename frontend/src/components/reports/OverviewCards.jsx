import React from 'react';
import { Star, MessageSquare, Users, BarChart3 } from 'lucide-react';

const OverviewCards = ({ stats }) => {
    const { avgRating, totalCompetitors, avgReviews, marketScore } = stats;

    const cards = [
        {
            label: "Average Rating",
            value: avgRating?.toFixed(1) || "0.0",
            icon: Star,
            color: "text-amber-500",
            bg: "bg-amber-50"
        },
        {
            label: "Total Competitors",
            value: totalCompetitors || 20,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            label: "Avg Reviews",
            value: Math.round(avgReviews) || 0,
            icon: MessageSquare,
            color: "text-purple-500",
            bg: "bg-purple-50"
        },
        {
            label: "Market Score",
            value: `${marketScore || 85}/100`,
            icon: BarChart3,
            color: "text-green-500",
            bg: "bg-green-50"
        }
    ];

    return (
        <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Market Overview</h2>
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        Based on real-time Google Maps data
                    </span>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {cards.map((card, index) => (
                        <div key={index} className="relative overflow-hidden group rounded-3xl border border-slate-100 bg-white p-8 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className={`inline-flex rounded-2xl ${card.bg} p-3 mb-6 transition-transform group-hover:scale-110`}>
                                <card.icon className={`h-6 w-6 ${card.color}`} aria-hidden="true" />
                            </div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{card.label}</p>
                            <p className="mt-2 text-3xl font-black text-slate-900">{card.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default OverviewCards;
