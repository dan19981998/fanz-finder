import type { Metadata } from "next";
import "@/styles/global.scss";
import { SITE_URL, SITE_NAME } from "@/lib/config";

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
        name: "How does the search work?",
        acceptedAnswer: { "@type": "Answer", text: "Type what you're looking for — a category like 'blonde', a price range like 'free', or a creator's name. Results show real stats including media counts, subscriber counts, and exact prices pulled directly from OnlyFans weekly." },
      },
      {
        "@type": "Question",
        name: "Do I need an OnlyFans account to use this?",
        acceptedAnswer: { "@type": "Answer", text: "No. FindFanz is completely free and doesn't require any account or login. You can search, browse, compare, and take the quiz without signing up for anything." },
      },
      {
        "@type": "Question",
        name: "What makes this different from searching on OnlyFans?",
        acceptedAnswer: { "@type": "Answer", text: "OnlyFans has no search or discovery features — you need to know a creator's exact username. FindFanz lets you search by category, compare creators side by side, filter by price, and get personalised recommendations through our quiz." },
      },
      {
        "@type": "Question",
        name: "How often is the data updated?",
        acceptedAnswer: { "@type": "Answer", text: "All creator stats — subscriber counts, media uploads, pricing — are refreshed weekly from the OnlyFans platform. New creators are added continuously." },
      },
      {
        "@type": "Question",
        name: "Can I compare two creators?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. Our Compare tool lets you put two creators side by side and see who has more content, better pricing, and higher engagement. Just enter two usernames and get an instant comparison." },
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
              <a href="/quiz" className="nav-link">Quiz</a>
              <a href="/compare" className="nav-link">Compare</a>
              <a href="/onlyfans/near-me" className="nav-link">Near Me</a>
            </nav>
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
