import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | OF Directory",
    description: "Read the OF Directory terms of service. Learn about acceptable use, content policies, and your rights when using our OnlyFans creator directory.",
    alternates: { canonical: "/terms" },
};

export default function TermsPage() {
    return (
        <main className="legal-page">
            <section className="legal-hero">
                <span className="legal-updated">Last updated: May 2026</span>
                <h1>Terms of Service</h1>
                <p className="legal-hero-sub">Please read these terms carefully before using OF Directory.</p>
            </section>

            <section className="legal-content">
                <div className="legal-card">
                    <h2>1. Acceptance of Terms</h2>
                    <p>By accessing or using OF Directory (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
                </div>

                <div className="legal-card">
                    <h2>2. Description of Service</h2>
                    <p>OF Directory is an independent third-party directory that allows users to discover OnlyFans creators. We are not affiliated with, endorsed by, or connected to OnlyFans in any way. We do not host, distribute, or control any content on OnlyFans.</p>
                </div>

                <div className="legal-card">
                    <h2>3. Age Requirement</h2>
                    <p>You must be at least 18 years old to use this Service. By using OF Directory, you confirm that you are at least 18 years of age.</p>
                </div>

                <div className="legal-card">
                    <h2>4. Content and Listings</h2>
                    <p>All creator listings on OF Directory are sourced from publicly available information on OnlyFans. We display usernames, profile images, subscription prices, and basic statistics. We do not host or redistribute any OnlyFans content.</p>
                </div>

                <div className="legal-card">
                    <h2>5. Prohibited Use</h2>
                    <p>You may not:</p>
                    <ul>
                        <li>Use the Service for any unlawful purpose</li>
                        <li>Scrape, crawl, or extract data from the Service without permission</li>
                        <li>Attempt to gain unauthorised access to any part of the Service</li>
                        <li>Use automated tools to access the Service at excessive rates</li>
                    </ul>
                </div>

                <div className="legal-card">
                    <h2>6. Intellectual Property</h2>
                    <p>All content on OF Directory, including text, design, and code, is the property of OF Directory. Creator profile images and names remain the property of their respective owners.</p>
                </div>

                <div className="legal-card">
                    <h2>7. Limitation of Liability</h2>
                    <p>The Service is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for any damages arising from your use of the Service, including but not limited to loss of data, revenue, or profits.</p>
                </div>

                <div className="legal-card">
                    <h2>8. Changes to Terms</h2>
                    <p>We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
                </div>

                <div className="legal-card">
                    <h2>9. Contact</h2>
                    <p>For questions about these Terms, please visit our <a href="/dmca">contact page</a>.</p>
                </div>
            </section>

            <footer className="site-footer">
                <div className="footer-inner">
                    <div className="footer-brand">
                        <a href="/" className="footer-logo">OF Directory</a>
                        <p className="footer-tagline">The best OnlyFans search engine for discovering creators.</p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-col">
                            <h4>Browse</h4>
                            <a href="/onlyfans/free">Free OnlyFans</a>
                            <a href="/onlyfans/near-me">Near Me</a>
                            <a href="/categories">All Categories</a>
                        </div>
                        <div className="footer-col">
                            <h4>Legal</h4>
                            <a href="/terms">Terms of Service</a>
                            <a href="/privacy">Privacy Policy</a>
                            <a href="/dmca">DMCA</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} OF Directory. Not affiliated with OnlyFans.</p>
                </div>
            </footer>
        </main>
    );
}
