import React from "react";
import { Link } from "react-router-dom";

const popularSearches = [
    { keyword: "Dentists", city: "Chicago", slug: "dentist-chicago" },
    { keyword: "Plumbers", city: "Dallas", slug: "plumber-dallas" },
    { keyword: "Roofers", city: "Miami", slug: "roofer-miami" },
    { keyword: "Lawyers", city: "New York", slug: "lawyer-new-york" },
    { keyword: "HVAC Services", city: "Austin", slug: "hvac-austin" },
];

export default function ProgrammaticSEOSection() {
    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-xl">
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
                            Popular Local SEO Searches
                        </h2>
                        <p className="text-slate-600">
                            Discover high-value opportunities discovered by Locitra across top US cities and niches.
                        </p>
                    </div>
                    <Link to="/tools" className="text-blue-600 font-bold flex items-center gap-2 hover:gap-3 transition-all">
                        Explore All Markets
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {popularSearches.map((search, i) => (
                        <Link 
                            key={i}
                            to={`/tools/google-maps-ranking-checker/${search.slug}`}
                            className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
                        >
                            <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">{search.city}</div>
                            <div className="font-bold text-slate-900 flex items-center justify-between">
                                {search.keyword}
                                <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
