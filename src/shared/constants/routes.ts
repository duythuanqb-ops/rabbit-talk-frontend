export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  // Add more app routes here as needed
} as const;

export type RouteKey = keyof typeof ROUTES;

export const getRoute = (route: RouteKey): string => ROUTES[route];
