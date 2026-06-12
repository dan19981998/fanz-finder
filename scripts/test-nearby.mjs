import * as cheerio from 'cheerio';

// Check a profile page on NearbyOnly
const res = await fetch('https://nearbyonly.com/onlyfans/miadesign', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
});
const html = await res.text();
const $ = cheerio.load(html);

// Look for JSON-LD structured data
$('script[type="application/ld+json"]').each((i, el) => {
    const text = $(el).html();
    try {
        const data = JSON.parse(text);
        console.log(`JSON-LD #${i}:`, JSON.stringify(data, null, 2).slice(0, 1500));
        console.log('---');
    } catch { }
});

// Look for meta tags
console.log('\nMeta description:', $('meta[name="description"]').attr('content')?.slice(0, 200));
console.log('OG title:', $('meta[property="og:title"]').attr('content'));
console.log('OG image:', $('meta[property="og:image"]').attr('content'));

// Look for avatar image
const imgs = [];
$('img').each((_, el) => {
    const src = $(el).attr('src') || '';
    if (src.includes('avatar') || src.includes('cdn.nearbyonly')) {
        imgs.push(src);
    }
});
console.log('\nAvatar images:', imgs.slice(0, 3));

// Look for stats/numbers in the page text
const bodyText = $('body').text().replace(/\s+/g, ' ').slice(0, 3000);
console.log('\nBody text (first 3000):', bodyText);
