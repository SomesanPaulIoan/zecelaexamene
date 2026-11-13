// Self-hosted behind Caddy, which doesn't get Next's `experimental.trustHostHeader`
// treatment (that only turns on automatically on Vercel) — so `new URL(request.url).origin`
// resolves to the app's own bind address (e.g. http://0.0.0.0:3000), not the public
// domain. Use SITE_URL for any absolute URL a route handler needs to build.
export function getSiteOrigin() {
  return process.env.SITE_URL ?? "http://localhost:3000";
}
