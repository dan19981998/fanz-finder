export interface LocationConfig {
    slug: string;
    name: string;
    flag: string;
}

// Countries with enough creators to warrant their own page
export const LOCATIONS: LocationConfig[] = [
    { slug: "united-states", name: "United States", flag: "🇺🇸" },
    { slug: "united-kingdom", name: "United Kingdom", flag: "🇬🇧" },
    { slug: "canada", name: "Canada", flag: "🇨🇦" },
    { slug: "france", name: "France", flag: "🇫🇷" },
    { slug: "denmark", name: "Denmark", flag: "🇩🇰" },
    { slug: "colombia", name: "Colombia", flag: "🇨🇴" },
    { slug: "argentina", name: "Argentina", flag: "🇦🇷" },
    { slug: "brazil", name: "Brazil", flag: "🇧🇷" },
    { slug: "poland", name: "Poland", flag: "🇵🇱" },
    { slug: "chile", name: "Chile", flag: "🇨🇱" },
    { slug: "portugal", name: "Portugal", flag: "🇵🇹" },
    { slug: "romania", name: "Romania", flag: "🇷🇴" },
    { slug: "spain", name: "Spain", flag: "🇪🇸" },
    { slug: "croatia", name: "Croatia", flag: "🇭🇷" },
    { slug: "australia", name: "Australia", flag: "🇦🇺" },
    { slug: "mexico", name: "Mexico", flag: "🇲🇽" },
    { slug: "italy", name: "Italy", flag: "🇮🇹" },
    { slug: "sweden", name: "Sweden", flag: "🇸🇪" },
    { slug: "germany", name: "Germany", flag: "🇩🇪" },
    { slug: "thailand", name: "Thailand", flag: "🇹🇭" },
];
