import type { Metadata } from "next";
import "@/styles/global.scss";
import { SITE_URL, SITE_NAME } from "@/lib/config";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "FindFanz – Free OnlyFans Search Engine | 50,000+ Creators",
  description:
    "Free OnlyFans search engine. Search 50,000+ creators by description, category, price, or location. Compare creators side by side. Take our quiz to find your perfect match. No login required.",
  keywords: "OnlyFans search, OnlyFans finder, find OnlyFans creators, OnlyFans search engine, free OnlyFans search, OnlyFans models, search OnlyFans without account, OnlyFans discovery, creator finder, OnlyFans compare, OnlyFans quiz",
  verification: { google: "QBKPRnvZEk1f1gpG0CYbyVdSDgf74SJKRDBtd6bfVww" },
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "FindFanz – Free OnlyFans Search Engine | 50,000+ Creators",
    description: "Search 50,000+ OnlyFans creators instantly. No login required. Browse by category, compare stats, or take our quiz to find your perfect match.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FindFanz – Free OnlyFans Search Engine",
    description: "Search 50,000+ OnlyFans creators. Compare stats. Take the quiz. Free, no login.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    alternateName: ["FindFanz", "Find Fanz", "OnlyFans Search"],
    url: SITE_URL,
    description: "Free OnlyFans search engine with 50,000+ creators. Search by category, appearance, price, or location. Compare creators side by side. Take our quiz for personalised recommendations. No login required.",
    applicationCategory: "SearchApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    featureList: [
      "50,000+ OnlyFans creators database",
      "Search by category and appearance",
      "Compare two creators side by side",
      "Interactive quiz for personalised recommendations",
      "Filter by price and content type",
      "Browse by country/location",
      "Real stats updated weekly",
      "No login or account required",
      "Completely free to use",
    ],
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
    creator: {
      "@type": "Organization",
      name: "FindFanz",
      url: SITE_URL,
    },
    inLanguage: "en-US",
    isAccessibleForFree: true,
    isFamilyFriendly: false,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is FindFanz?",
        acceptedAnswer: { "@type": "Answer", text: "FindFanz is a free search engine for OnlyFans creators. Search 50,000+ verified profiles by category, appearance, price, or location. No login required." },
      },
      {
        "@type": "Question",
        name: "Can I search OnlyFans without an account?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. FindFanz lets you search, browse, and compare all 50,000+ OnlyFans creators without creating any account. No payment method required." },
      },
      {
        "@type": "Question",
        name: "Is there an OnlyFans search engine?",
        acceptedAnswer: { "@type": "Answer", text: "OnlyFans has no built-in search or discovery features. FindFanz is the free alternative — a dedicated search engine that indexes 50,000+ creator profiles with real stats, pricing, and category filters." },
      },
      {
        "@type": "Question",
        name: "How do I find the best OnlyFans creators?",
        acceptedAnswer: { "@type": "Answer", text: "Use our Creator Quiz for personalised recommendations, the Compare Tool to evaluate two creators side by side, or the Value Rankings to find who delivers the most content per dollar. All tools are free." },
      },
      {
        "@type": "Question",
        name: "How much does OnlyFans cost?",
        acceptedAnswer: { "@type": "Answer", text: "OnlyFans subscription prices range from free to $50/month per creator. Most accounts charge between $5 and $15 per month. FindFanz shows exact pricing on every creator card." },
      },
      {
        "@type": "Question",
        name: "Can I compare two OnlyFans creators?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. Our Compare Tool lets you put two creators side by side and see who has more content, better pricing, and higher engagement. Just enter two usernames and get an instant comparison." },
      },
      {
        "@type": "Question",
        name: "What free OnlyFans tools does FindFanz offer?",
        acceptedAnswer: { "@type": "Answer", text: "Six free tools: Creator Quiz, Compare Tool, Budget Calculator, Value Rankings, Watchlist, and Random Discovery. All work instantly in your browser with no login required." },
      },
      {
        "@type": "Question",
        name: "How often is the data updated?",
        acceptedAnswer: { "@type": "Answer", text: "All creator stats — subscriber counts, media uploads, pricing — are refreshed weekly from the OnlyFans platform. New creators are added continuously." },
      },
      {
        "@type": "Question",
        name: "How do I find OnlyFans creators near me?",
        acceptedAnswer: { "@type": "Answer", text: "Use our location-based search to browse OnlyFans creators by country. We support over 30 countries including the US, UK, Canada, and Australia." },
      },
      {
        "@type": "Question",
        name: "What are the best free OnlyFans accounts?",
        acceptedAnswer: { "@type": "Answer", text: "Our free category lists every verified creator who charges $0/month. Many top-earning creators offer free subscriptions and monetise through tips and PPV content instead." },
      },
    ],
  };

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <header className="site-header">
          <div className="site-header-inner">
            <a href="/" className="logo">
              Find<span className="logo-highlight">Fanz</span>
            </a>
            <nav className="nav-links">
              <a href="/categories" className="nav-link">Categories</a>
              <a href="/onlyfans/free" className="nav-link">Free</a>
              <div className="nav-dropdown">
                <a href="/tools" className="nav-link nav-link-dropdown">Tools <span className="nav-arrow">▾</span></a>
                <div className="nav-dropdown-menu">
                  <a href="/tools#quiz" className="nav-dropdown-item"><span>🎯</span> Creator Quiz</a>
                  <a href="/tools#compare" className="nav-dropdown-item"><span>⚖️</span> Compare Tool</a>
                  <a href="/tools#budget" className="nav-dropdown-item"><span>💰</span> Budget Calculator</a>
                  <a href="/tools#value" className="nav-dropdown-item"><span>📊</span> Value Rankings</a>
                  <a href="/tools#watchlist" className="nav-dropdown-item"><span>⭐</span> My Watchlist</a>
                  <a href="/tools#random" className="nav-dropdown-item"><span>🎰</span> Random Discovery</a>
                </div>
              </div>
              <a href="/onlyfans/near-me" className="nav-link">Near Me</a>
              <a href="/about" className="nav-link">About</a>
            </nav>
            <MobileNav />
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
