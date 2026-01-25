/**
 * Application Routes
 * Centralized route definitions to avoid hardcoded path strings
 */

export const ROUTES = {
  HOME: "/",
  STATS: "/stats",
} as const;

export type RouteKey = keyof typeof ROUTES;
