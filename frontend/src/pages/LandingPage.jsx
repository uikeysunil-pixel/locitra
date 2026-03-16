import React from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import Hero from "../components/landing/Hero";
import FeaturesSection from "../components/landing/FeaturesSection";
import HowItWorks from "../components/landing/HowItWorks";
import ProductScreens from "../components/landing/ProductScreens";
import FinalCTA from "../components/landing/FinalCTA";
import LandingFooter from "../components/landing/LandingFooter";

export default function LandingPage() {
    return (
        <div className="font-sans antialiased bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
            <LandingNavbar />
            <main>
                <Hero />
                <FeaturesSection />
                <HowItWorks />
                <ProductScreens />
                <FinalCTA />
            </main>

            <LandingFooter />
        </div>
    );
}
