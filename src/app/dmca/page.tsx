import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "DMCA Policy | FindFanz",
    description: "FindFanz DMCA policy. Learn how to file a copyright infringement notice or request content removal from our OnlyFans creator directory.",
    alternates: { canonical: "/dmca" },
};

export default function DmcaPage() {
    return (
        <main className="legal-page">
            <section className="legal-hero">
                <span className="legal-updated">Last updated: May 2026</span>
                <h1>DMCA Policy</h1>
                <p className="legal-hero-sub">How we handle copyright infringement claims and content removal requests.</p>
            </section>

            <section className="legal-content">
                <div className="legal-card">
                    <h2>Overview</h2>
                    <p>FindFanz respects the intellectual property rights of others and responds to notices of alleged copyright infringement in accordance with the Digital Millennium Copyright Act (DMCA).</p>
                </div>

                <div className="legal-card">
                    <h2>What We Host</h2>
                    <p>FindFanz is a directory service. We do not host, store, or distribute OnlyFans content. Creator profiles in our directory contain only: usernames, profile images (sourced from OnlyFans), subscription prices, and basic statistics. All data is publicly available on OnlyFans.</p>
                </div>

                <div className="legal-card">
                    <h2>Filing a DMCA Takedown Notice</h2>
                    <p>If you believe that content on our site infringes your copyright, please send a written notice containing:</p>
                    <ul>
                        <li>Your physical or electronic signature</li>
                        <li>Identification of the copyrighted work you claim has been infringed</li>
                        <li>Identification of the material on our site that you claim is infringing, with enough detail for us to locate it</li>
                        <li>Your contact information (address, phone number, email)</li>
                        <li>A statement that you have a good faith belief that the use is not authorised by the copyright owner</li>
                        <li>A statement, under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorised to act on their behalf</li>
                    </ul>
                </div>

                <div className="legal-card">
                    <h2>Content Removal Requests</h2>
                    <p>If you are an OnlyFans creator and wish to have your profile removed from our directory, please contact us with your OnlyFans username and we will remove your listing within 48 hours.</p>
                </div>

                <div className="legal-card">
                    <h2>Counter-Notification</h2>
                    <p>If you believe your content was removed in error, you may file a counter-notification containing: your signature, identification of the removed material, a statement under penalty of perjury that removal was a mistake, and your consent to jurisdiction.</p>
                </div>

                <div className="legal-card">
                    <h2>Contact</h2>
                    <p>Send all DMCA notices and removal requests to:</p>
                    <p><strong>Email:</strong> dmca@ofdirectory.com</p>
                </div>

                <div className="legal-card">
                    <h2>Repeat Infringers</h2>
                    <p>We will remove listings of users who are identified as repeat infringers of copyright.</p>
                </div>
            </section>

            <footer className="site-footer">
                <div className="footer-inner">
                    <div className="footer-brand">
                        <a href="/" className="footer-logo">FindFanz</a>
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
                    <p>&copy; {new Date().getFullYear()} FindFanz. Not affiliated with OnlyFans.</p>
                </div>
            </footer>
        </main>
    );
}
