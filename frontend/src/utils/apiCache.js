/**
 * apiCache.js
 * Simple localStorage-based caching utility for API responses.
 */

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Retrieves data from cache if it exists and hasn't expired.
 * @param {string} key - The cache key
 * @returns {any|null} - Cached data or null
 */
export function getCachedData(key) {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    try {
        const parsed = JSON.parse(cached);
        const now = Date.now();

        if (now - parsed.timestamp > CACHE_TTL) {
            console.log(`[Cache] Expired: ${key}`);
            localStorage.removeItem(key);
            return null;
        }

        return parsed.data;
    } catch (error) {
        console.error("[Cache] Parsing error:", error);
        localStorage.removeItem(key);
        return null;
    }
}

/**
 * Stores data in cache with a timestamp.
 * @param {string} key - The cache key
 * @param {any} data - The data to cache
 */
export function setCachedData(key, data) {
    try {
        localStorage.setItem(
            key,
            JSON.stringify({
                timestamp: Date.now(),
                data
            })
        );
    } catch (error) {
        console.warn("[Cache] Storage failed (likely quota reached):", error);
    }
}

/**
 * Clears specific cache entries or entire cache.
 */
export function clearApiCache() {
    // Only clear Locitra specific scan cache entries to avoid breaking other storage
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('scan_')) {
            localStorage.removeItem(key);
        }
    });
}
