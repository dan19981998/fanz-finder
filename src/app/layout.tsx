import type { Metadata } from "next";
import "@/styles/global.scss";

export const metadata: Metadata = {
  title: "Lush Finder – Best OnlyFans Search Engine | Find Top Creators",
  description:
    "Discover the best OnlyFans creators. Search by category, filter by price, and find exactly who you're looking for. Updated weekly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="announcement-bar">
          🎉 Welcome to Lush Finder — 100% free to browse. Discover 13,000+ creators.
        </div>
        <header className="site-header">
          <div className="site-header-inner">
            <a href="/" className="logo">
              Lush <span className="logo-highlight">Finder</span>
            </a>
            <nav className="nav-links">
              <a href="/categories" className="nav-link">Categories</a>
              <a href="/onlyfans/free" className="nav-link">Free</a>
              <a href="/onlyfans/near-me" className="nav-link">Near Me</a>
            </nav>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
