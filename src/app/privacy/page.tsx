import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Lush Finder",
    description: "Lush Finder privacy policy. Learn how we collect, use, and protect your data including cookies, analytics, and third-party services.",
    alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
    return (
        <main className="legal-page">
            <section className="legal-hero">
                <span className="legal-updated">Last updated: May 2026</span>
                <h1>Privacy Policy</h1>
                <p className="legal-hero-sub">How we collect, use, and protect your information.</p>
            </section>

            <section className="legal-content">
                <div className="legal-card">
                    <h2>1. Information We Collect</h2>
                    <p>We collect minimal information when you use Lush Finder:</p>
                    <ul>
                        <li><strong>Usage data</strong> — pages visited, search queries, and clicks (anonymised)</li>
                        <li><strong>Technical data</strong> — IP address (hashed), browser type, and device type</li>
                    </ul>
                    <p>We do not require account creation to browse the directory.</p>
                </div>

                <div className="legal-card">
                    <h2>2. How We Use Your Information</h2>
                    <p>We use collected data to:</p>
                    <ul>
                        <li>Improve the Service and user experience</li>
                        <li>Monitor site performance and uptime</li>
                        <li>Prevent abuse and enforce rate limits</li>
                        <li>Generate anonymous usage statistics</li>
                    </ul>
                </div>

                <div className="legal-card">
                    <h2>3. Data Sharing</h2>
                    <p>We do not sell your personal information. We share data only with:</p>
                    <ul>
                        <li><strong>Hosting provider</strong> — for serving the website</li>
                        <li><strong>Database provider</strong> — for data storage</li>
                    </ul>
                    <p>All third parties are bound by their own privacy policies and data protection agreements.</p>
                </div>

                <div className="legal-card">
                    <h2>4. Cookies</h2>
                    <p>We use only essential cookies for admin authentication. We do not use third-party tracking cookies, advertising cookies, or analytics cookies that identify individual users.</p>
                </div>

                <div className="legal-card">
                    <h2>5. Data Retention</h2>
                    <p>Click data is retained in anonymised form (hashed IP addresses). We do not store personally identifiable information beyond what is necessary for site operation.</p>
                </div>

                <div className="legal-card">
                    <h2>6. Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li>Request information about data we hold</li>
                        <li>Request deletion of any personal data</li>
                        <li>Opt out of any non-essential data collection</li>
                    </ul>
                    <p><a href="/dmca">Contact us</a> to exercise these rights.</p>
                </div>

                <div className="legal-card">
                    <h2>7. Security</h2>
                    <p>We implement industry-standard security measures including encrypted connections (HTTPS), hashed IP addresses, and rate limiting to protect data integrity.</p>
                </div>

                <div className="legal-card">
                    <h2>8. Changes to This Policy</h2>
                    <p>We may update this Privacy Policy at any time. Changes will be reflected on this page with an updated date.</p>
                </div>

                <div className="legal-card">
                    <h2>9. Contact</h2>
                    <p>For privacy-related enquiries, please visit our <a href="/dmca">contact page</a>.</p>
                </div>
            </section>

            <footer className="site-footer">
                <div className="footer-inner">
                    <div className="footer-brand">
                        <a href="/" className="footer-logo">Lush Finder</a>
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
                    <p>&copy; {new Date().getFullYear()} Lush Finder. Not affiliated with OnlyFans.</p>
                </div>
            </footer>
        </main>
    );
}
