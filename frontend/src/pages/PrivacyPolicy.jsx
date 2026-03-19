import React, { useEffect } from "react";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingFooter from "../components/landing/LandingFooter";

export default function PrivacyPolicy() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="font-sans antialiased bg-white text-slate-900 min-h-screen">
            <LandingNavbar />
            
            <main className="py-24 px-6">
                <div className="max-w-3xl mx-auto prose prose-slate">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-8 font-display">Privacy Policy</h1>
                    
                    <p className="text-slate-500 font-medium mb-8 italic">Last Updated: March 19, 2026</p>
                    
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We collect information you provide directly to us, such as when you create an account, scan a market, or contact support. This may include your email address, company name, and search queries.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">2. How We Use Information</h2>
                        <p className="text-slate-600 leading-relaxed mb-4">
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc pl-6 text-slate-600 space-y-2">
                            <li>Provide, maintain, and improve our services.</li>
                            <li>Develop new products and features.</li>
                            <li>Send you technical notices, updates, and support messages.</li>
                            <li>Communicate with you about products, services, and events.</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Data Security</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We use industry-standard security measures to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Cookies</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We use cookies to enhance your experience, analyze site traffic, and for personalization. You can manage your cookie preferences through your browser settings.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Contact Us</h2>
                        <p className="text-slate-600 leading-relaxed">
                            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@locitra.com" className="text-blue-600 hover:underline">privacy@locitra.com</a>.
                        </p>
                    </section>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}
