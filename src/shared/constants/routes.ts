export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  DASHBOARD: "/dashboard",
} as const;

export type RouteKey = keyof typeof ROUTES;

export const getRoute = (route: RouteKey): string => ROUTES[route];
