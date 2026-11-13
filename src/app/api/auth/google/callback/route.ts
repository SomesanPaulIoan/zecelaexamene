import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { exchangeGoogleCode } from "@/lib/google-oauth";
import { getSiteOrigin } from "@/lib/site-url";

export async function GET(request: Request) {
  const origin = getSiteOrigin();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("google_oauth_state")?.value;
  cookieStore.delete("google_oauth_state");

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${origin}/login?error=google_state`, 303);
  }

  let profile;
  try {
    profile = await exchangeGoogleCode(code);
  } catch (err) {
    console.error("[google-oauth] callback failed:", err);
    return NextResponse.redirect(`${origin}/login?error=google_failed`, 303);
  }

  if (!profile.email) {
    return NextResponse.redirect(`${origin}/login?error=google_no_email`, 303);
  }

  let user = await prisma.user.findUnique({ where: { googleId: profile.sub } });

  if (!user) {
    const existingByEmail = await prisma.user.findUnique({ where: { email: profile.email } });
    if (existingByEmail) {
      // Link the Google identity to the existing password-based account instead of
      // creating a duplicate — same email means same person.
      user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          googleId: profile.sub,
          emailConfirmed: existingByEmail.emailConfirmed || profile.email_verified,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          firstName: profile.given_name || profile.name || "Utilizator",
          lastName: profile.family_name || "",
          email: profile.email,
          googleId: profile.sub,
          emailConfirmed: profile.email_verified,
        },
      });
    }
  }

  const session = await getSession();
  session.userId = user.id;
  await session.save();

  return NextResponse.redirect(`${origin}/contul-meu`, 303);
}
