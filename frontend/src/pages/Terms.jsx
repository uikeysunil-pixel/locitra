import React, { useEffect } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingFooter from "../components/landing/LandingFooter";

export default function Terms() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="font-sans antialiased bg-white text-slate-900 min-h-screen">
            <LandingNavbar />
            
            <main className="py-24 px-6">
                <div className="max-w-3xl mx-auto prose prose-slate">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-8 font-display">Terms of Service</h1>
                    
                    <p className="text-slate-500 font-medium mb-8 italic">Last Updated: March 19, 2026</p>
                    
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-slate-600 leading-relaxed">
                            By accessing or using Locitra, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Use of Service</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            You agree to use Locitra only for lawful purposes and in accordance with these Terms. You are responsible for maintaining the confidentiality of your account credentials.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Scaling & Compliance</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Users are responsible for how they use the data obtained through Locitra. We do not endorse or authorize spanming or any illegal outreach activities.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Limitation of Liability</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Locitra shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Modifications to Terms</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We reserve the right to modify these terms at any time. We will notify users of any significant changes by posting the new terms on this page.
                        </p>
                    </section>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
