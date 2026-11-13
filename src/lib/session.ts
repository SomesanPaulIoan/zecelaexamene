import { cookies } from "next/headers";
import { getIronSession, type IronSession } from "iron-session";

export type CartItem = { bookId: string; qty: number };

export type SessionData = {
  userId?: string;
  cart?: CartItem[];
  discountCode?: string;
};

// Checked lazily (inside the function, not at module load) so `next build`'s static page
// analysis — which imports this module without real env vars present — doesn't crash.
function getSessionPassword(): string {
  const sessionPassword = process.env.SESSION_SECRET;
  if (!sessionPassword || sessionPassword.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters long");
  }
  return sessionPassword;
}

// `remember: false` produces a session cookie (cleared when the browser closes) instead of
// the normal 30-day persistent cookie — used for the "Ține-mă conectat" login checkbox.
// Only matters at the moment `session.save()` runs; reading an existing session elsewhere
// doesn't need to pass this.
export async function getSession(options?: { remember?: boolean }): Promise<IronSession<SessionData>> {
  const remember = options?.remember ?? true;
  return getIronSession<SessionData>(await cookies(), {
    password: getSessionPassword(),
    cookieName: "zle_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}), // 30 days, or a browser-session cookie
    },
  });
}
