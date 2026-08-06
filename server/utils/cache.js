const cache = new Map();

/**
 * Get data from cache if it exists and hasn't expired.
 * @param {string} key - Cache key
 * @returns {any|null} - The cached data or null if expired/not found
 */
const getCache = (key) => {
  const item = cache.get(key);
  if (!item) return null;

  // Check if expired
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.data;
};

/**
 * Set data in cache.
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttlSeconds - Time to live in seconds (default 15 mins)
 */
const setCache = (key, data, ttlSeconds = 900) => {
  const expiry = Date.now() + ttlSeconds * 1000;
  cache.set(key, { data, expiry });
};

/**
 * Invalidate a specific cache key.
 * @param {string} key - Cache key to remove
 */
const invalidateCache = (key) => {
  cache.delete(key);
};

/**
 * Clear all cache.
 */
const clearCache = () => {
  cache.clear();
};

module.exports = {
  getCache,
  setCache,
  invalidateCache,
  clearCache
};
