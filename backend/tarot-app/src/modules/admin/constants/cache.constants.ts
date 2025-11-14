/**
 * Cache configuration constants for Admin Dashboard
 * TASK-029: Centralized cache TTL values
 */

/**
 * Admin Dashboard cache TTL: 15 minutes (900000 milliseconds)
 * Used for all admin dashboard endpoints to balance freshness and performance
 */
export const ADMIN_DASHBOARD_CACHE_TTL = 900000; // 15 minutes
