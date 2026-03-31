export const plans = [
    {
        name: "Free",
        price: 0,
        scansPerDay: 10,
        businesses: 100,
        features: [
            "10 credits per day",
            "1 credit = 1 scan",
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
        scansPerDay: 300,
        businesses: 300,
        features: [
            "300 credits per month",
            "Up to 300 businesses per scan",
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
        scansPerDay: 1000,
        businesses: 500,
        features: [
            "1000 credits per month",
            "Up to 500 businesses per scan",
            "AI outreach generator",
            "Lead CRM",
            "Full analytics"
        ],
        description: "For established lead gen agencies.",
        buttonText: "Join Agency Plan",
        icon: "🏢"
    }
];
