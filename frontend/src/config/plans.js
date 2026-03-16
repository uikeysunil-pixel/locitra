export const plans = [
    {
        name: "Free",
        price: 0,
        scansPerDay: 2,
        businesses: 100,
        features: [
            "2 scans per day",
            "Up to 100 businesses per scan",
            "Basic AI analysis"
        ],
        description: "Perfect for testing the waters.",
        buttonText: "Start Free Scan",
        icon: "🆓"
    },
    {
        name: "Starter",
        price: 49,
        scansPerDay: 20,
        businesses: 500,
        features: [
            "20 scans per day",
            "Up to 500 businesses per scan",
            "Full AI analysis",
            "Lead CRM access"
        ],
        description: "Build a full agency pipeline.",
        buttonText: "Start Starter Trial",
        icon: "🚀",
        popular: true
    },
    {
        name: "Agency",
        price: 99,
        scansPerDay: "Unlimited",
        businesses: "500+",
        features: [
            "Unlimited scans",
            "500+ businesses per scan",
            "AI outreach generator",
            "Lead CRM",
            "Full analytics"
        ],
        description: "For established lead gen agencies.",
        buttonText: "Join Agency Plan",
        icon: "🏢"
    }
];
