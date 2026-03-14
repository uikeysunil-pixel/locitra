/**
 * Storage cache to hold the latest scan results per user.
 * This ensures the report generator always matches the live Dashboard state exactly.
 */

const scanResultsCache = {};

module.exports = { scanResultsCache };
