import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * Rebuild of the legacy `api/export-user-courses.php` — zecelainfo.ro calls this to pull a
 * user's course access when they log in there, so progress/access "transfers" across sites.
 * Same request/response contract as the legacy endpoint (same header, same JSON shape), so
 * zecelainfo.ro's existing integration code needs no changes.
 *
 * One deliberate behavior change: the legacy `cursuri_acces` table could grant access to a
 * single part of a course (PartID set) separately from the whole course (PartID NULL). This
 * app only ever grants whole-course access (see CourseAccess — no per-part access exists
 * here), so every course a user has access to is reported with ALL of its parts listed as
 * valid, using the same expiry as the course itself. `course_access` (the raw legacy-shaped
 * rows) reflects this too — every row has `partID: null`.
 *
 * `courseID` in the response is the *legacy* numeric id (Course.legacySourceId), not this
 * app's internal cuid, so zecelainfo.ro's existing courseID-based logic keeps working
 * unchanged. Only courses that existed in the legacy `cursuri` table are eligible (matches
 * the legacy endpoint, which only ever read from `cursuri`/`cursuri_acces` — never the older
 * `Courses`/`CourseAcces` tables).
 */

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(request: Request) {
  const apiKey = request.headers.get("x-api-key");
  const expected = process.env.EXPORT_USER_COURSES_API_KEY;
  if (!expected || !apiKey || apiKey !== expected) {
    return jsonResponse({ success: false, error: "unauthorized" }, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ success: false, error: "invalid_json" }, 400);
  }
  const { email, password } = (body ?? {}) as { email?: string; password?: string };
  if (!email || !password) {
    return jsonResponse({ success: false, error: "email_and_password_required" }, 400);
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim() } });
  if (!user || !user.passwordHash) return jsonResponse({ success: false, error: "invalid_credentials" }, 401);

  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) return jsonResponse({ success: false, error: "invalid_credentials" }, 401);

  const accessRows = await prisma.courseAccess.findMany({
    where: {
      userId: user.id,
      course: {
        legacySourceTable: { in: ["merged", "cursuri"] },
        legacySourceId: { not: null },
      },
    },
    include: {
      course: {
        include: { parts: { where: { legacyId: { not: null } }, orderBy: { sortOrder: "asc" } } },
      },
    },
    orderBy: { courseId: "asc" },
  });

  const now = new Date();
  const courses = accessRows.map((access) => {
    const isValidNow = !access.expiresAt || access.expiresAt > now;
    const expiresAt = access.expiresAt ? access.expiresAt.toISOString().slice(0, 19).replace("T", " ") : null;
    return {
      courseID: access.course.legacySourceId,
      title: access.course.title,
      access: { expiresAt, isValidNow },
      parts: access.course.parts.map((part) => ({
        partID: part.legacyId,
        courseID: access.course.legacySourceId,
        title: part.title,
        expiresAt,
        isValidNow,
      })),
    };
  });

  const courseAccessRows = accessRows.map((access) => ({
    courseID: access.course.legacySourceId,
    partID: null,
    expiresAt: access.expiresAt ? access.expiresAt.toISOString().slice(0, 19).replace("T", " ") : null,
    isValidNow: !access.expiresAt || access.expiresAt > now,
  }));

  return jsonResponse({
    success: true,
    user: {
      id: user.legacyId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    courses,
    course_access: courseAccessRows,
    meta: {
      courses_count: courses.length,
      parts_count: courses.reduce((sum, c) => sum + c.parts.length, 0),
      access_rows_count: courseAccessRows.length,
      exported_at: now.toISOString().slice(0, 19).replace("T", " "),
    },
  });
}
