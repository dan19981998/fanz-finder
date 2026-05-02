import pg from "pg";

const pool = new pg.Pool({
    connectionString: "postgresql://dan@localhost:5432/of_directory",
});

// Map location strings to country slugs
const COUNTRY_MAP = {
    "united states": "united-states",
    "usa": "united-states",
    "us": "united-states",
    "america": "united-states",
    "united kingdom": "united-kingdom",
    "uk": "united-kingdom",
    "england": "united-kingdom",
    "scotland": "united-kingdom",
    "wales": "united-kingdom",
    "australia": "australia",
    "canada": "canada",
    "colombia": "colombia",
    "argentina": "argentina",
    "brazil": "brazil",
    "chile": "chile",
    "poland": "poland",
    "denmark": "denmark",
    "france": "france",
    "portugal": "portugal",
    "romania": "romania",
    "spain": "spain",
    "croatia": "croatia",
    "russia": "russia",
    "germany": "germany",
    "italy": "italy",
    "mexico": "mexico",
    "netherlands": "netherlands",
    "sweden": "sweden",
    "norway": "norway",
    "czech republic": "czech-republic",
    "czechia": "czech-republic",
    "ukraine": "ukraine",
    "philippines": "philippines",
    "japan": "japan",
    "south korea": "south-korea",
    "korea": "south-korea",
    "thailand": "thailand",
    "indonesia": "indonesia",
    "india": "india",
    "new zealand": "new-zealand",
    "ireland": "ireland",
    "south africa": "south-africa",
    "nigeria": "nigeria",
    "hungary": "hungary",
    "belgium": "belgium",
    "switzerland": "switzerland",
    "austria": "austria",
    "finland": "finland",
    "greece": "greece",
    "turkey": "turkey",
    "peru": "peru",
    "venezuela": "venezuela",
    "dominican republic": "dominican-republic",
    "puerto rico": "united-states",
    "costa rica": "costa-rica",
    "ecuador": "ecuador",
    "jamaica": "jamaica",
    "latvia": "latvia",
    "lithuania": "lithuania",
    "estonia": "estonia",
    "serbia": "serbia",
    "bulgaria": "bulgaria",
    "slovakia": "slovakia",
    "slovenia": "slovenia",
};

// US states/cities → united-states
const US_STATES = [
    "california", "texas", "florida", "new york", "nevada", "arizona",
    "colorado", "georgia", "ohio", "michigan", "illinois", "pennsylvania",
    "north carolina", "virginia", "washington", "oregon", "tennessee",
    "massachusetts", "maryland", "minnesota", "indiana", "missouri",
    "wisconsin", "connecticut", "utah", "oklahoma", "kentucky", "louisiana",
    "alabama", "south carolina", "iowa", "mississippi", "arkansas", "hawaii",
    "new jersey", "new mexico", "nebraska", "idaho", "montana", "maine",
];

const US_CITIES = [
    "los angeles", "new york city", "nyc", "miami", "las vegas", "chicago",
    "houston", "phoenix", "san diego", "dallas", "san antonio", "austin",
    "san francisco", "seattle", "denver", "atlanta", "boston", "nashville",
    "portland", "tampa", "orlando", "sacramento", "san jose", "charlotte",
    "detroit", "memphis", "baltimore", "milwaukee", "albuquerque",
];

const UK_CITIES = [
    "london", "manchester", "birmingham", "liverpool", "leeds", "bristol",
    "glasgow", "edinburgh", "cardiff", "nottingham", "newcastle", "sheffield",
    "belfast", "leicester", "brighton", "coventry", "bath", "oxford",
    "cambridge", "southampton", "portsmouth", "plymouth", "aberdeen",
];

const AU_CITIES = [
    "sydney", "melbourne", "brisbane", "perth", "adelaide", "gold coast",
    "canberra", "hobart", "darwin", "cairns", "newcastle",
];

const CA_CITIES = [
    "toronto", "vancouver", "montreal", "calgary", "edmonton", "ottawa",
    "winnipeg", "quebec", "hamilton", "halifax",
];

function detectCountry(location) {
    const lower = location.toLowerCase().trim();

    // Direct country match
    if (COUNTRY_MAP[lower]) return COUNTRY_MAP[lower];

    // Check if location contains a known country
    for (const [key, slug] of Object.entries(COUNTRY_MAP)) {
        if (lower.includes(key)) return slug;
    }

    // Check US states and cities
    for (const state of US_STATES) {
        if (lower.includes(state)) return "united-states";
    }
    for (const city of US_CITIES) {
        if (lower.includes(city)) return "united-states";
    }

    // Check UK cities
    for (const city of UK_CITIES) {
        if (lower.includes(city)) return "united-kingdom";
    }

    // Check AU cities  
    for (const city of AU_CITIES) {
        if (lower.includes(city)) return "australia";
    }

    // Check CA cities
    for (const city of CA_CITIES) {
        if (lower.includes(city)) return "canada";
    }

    // Common patterns: "City, Country" or "City, State"
    const parts = lower.split(",").map(p => p.trim());
    if (parts.length >= 2) {
        const lastPart = parts[parts.length - 1];
        if (COUNTRY_MAP[lastPart]) return COUNTRY_MAP[lastPart];
        for (const state of US_STATES) {
            if (lastPart.includes(state)) return "united-states";
        }
    }

    return null;
}

async function main() {
    const { rows } = await pool.query(
        "SELECT DISTINCT location FROM creators WHERE location IS NOT NULL AND location != '' AND (country IS NULL OR country = '')"
    );

    console.log(`Processing ${rows.length} unique locations...`);

    let updated = 0;
    let unmatched = [];

    for (const row of rows) {
        const country = detectCountry(row.location);
        if (country) {
            const result = await pool.query(
                "UPDATE creators SET country = $1 WHERE location = $2 AND (country IS NULL OR country = '')",
                [country, row.location]
            );
            updated += result.rowCount;
        } else {
            unmatched.push(row.location);
        }
    }

    console.log(`Updated ${updated} creators with country data.`);
    if (unmatched.length > 0) {
        console.log(`\nUnmatched locations (${unmatched.length}):`);
        unmatched.slice(0, 30).forEach(l => console.log(`  - "${l.trim()}"`));
    }

    // Show results
    const { rows: stats } = await pool.query(
        "SELECT country, COUNT(*) as cnt FROM creators WHERE country IS NOT NULL AND country != '' GROUP BY country ORDER BY cnt DESC"
    );
    console.log("\nCountry distribution:");
    stats.forEach(r => console.log(`  ${r.country}: ${r.cnt}`));

    await pool.end();
}

main().catch(console.error);
