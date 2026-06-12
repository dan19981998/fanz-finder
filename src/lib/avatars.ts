const NEARBYONLY_CDN = "https://cdn.nearbyonly.com/";

export function proxyAvatarUrl(url: string | null | undefined): string {
    if (!url) return "";
    if (url.startsWith(NEARBYONLY_CDN)) {
        return "/img-proxy/" + url.slice(NEARBYONLY_CDN.length);
    }
    return url;
}
