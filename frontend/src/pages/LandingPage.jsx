import React, { useEffect } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import Hero from "../components/landing/Hero";
import ToolsHubSection from "../components/landing/ToolsHubSection";
import ProductProofSection from "../components/landing/ProductProofSection";
import HowItWorks from "../components/landing/HowItWorks";
import ProductScreens from "../components/landing/ProductScreens";
import ProgrammaticSEOSection from "../components/landing/ProgrammaticSEOSection";
import TrustSignal from "../components/landing/TrustSignal";
import FinalCTA from "../components/landing/FinalCTA";
import LandingFooter from "../components/landing/LandingFooter";

export default function LandingPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="font-sans antialiased bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
            <LandingNavbar />
            <main>
                <Hero />
                <ToolsHubSection />
                <ProductProofSection />
                <HowItWorks />
                <ProductScreens />
                <ProgrammaticSEOSection />
                <TrustSignal />
                <FinalCTA />
            </main>

            <LandingFooter />
        </div>
    );
}

