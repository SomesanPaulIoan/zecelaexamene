import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { buildGoogleAuthUrl } from "@/lib/google-oauth";
import { getSiteOrigin } from "@/lib/site-url";

export async function GET() {
  const origin = getSiteOrigin();
  const state = crypto.randomBytes(16).toString("hex");
  const authUrl = buildGoogleAuthUrl(state);

  if (!authUrl) {
    return NextResponse.redirect(`${origin}/login?error=google_not_configured`, 303);
  }

  const cookieStore = await cookies();
  cookieStore.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });

  return NextResponse.redirect(authUrl, 303);
}
