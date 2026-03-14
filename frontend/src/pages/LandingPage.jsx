import React from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import Hero from "../components/landing/Hero";
import OpportunityFeed from "../components/landing/OpportunityFeed";
import SocialProofSection from "../components/landing/SocialProofSection";
import ProblemSection from "../components/landing/ProblemSection";
import SolutionSection from "../components/landing/SolutionSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import ProductScreens from "../components/landing/ProductScreens";
import AudienceSection from "../components/landing/AudienceSection";
import BenefitsSection from "../components/landing/BenefitsSection";
import PricingPreview from "../components/landing/PricingPreview";
import FinalCTA from "../components/landing/FinalCTA";
import LandingFooter from "../components/landing/LandingFooter";

export default function LandingPage() {
    return (
        <div className="font-sans antialiased bg-slate-50 text-slate-900 selection:bg-blue-200">
            <LandingNavbar />
            
            <div className="bg-blue-600 text-white p-6 rounded-lg">
                Tailwind Working
            </div>

            <main>
                <Hero />
                <OpportunityFeed />
                <SocialProofSection />
                <ProblemSection />
                <SolutionSection />
                <FeaturesSection />
                <ProductScreens />
                <AudienceSection />
                <BenefitsSection />
                <PricingPreview />
                <FinalCTA />
            </main>

            <LandingFooter />
        </div>
    );
}
