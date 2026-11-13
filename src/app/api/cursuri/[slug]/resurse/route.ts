import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCourseAccess } from "@/lib/course-access";

const RESOURCES_DIR = path.join(process.cwd(), "resources");

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Trebuie să fii autentificat." }, { status: 401 });
  }

  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course || !course.resourceFileName) {
    return NextResponse.json({ error: "Resursa nu a fost găsită." }, { status: 404 });
  }

  const access = await getCourseAccess(user.id, course.id);
  const hasAccess = Boolean(access && (!access.expiresAt || access.expiresAt > new Date()));
  if (!hasAccess) {
    return NextResponse.json({ error: "Nu ai acces la acest curs." }, { status: 403 });
  }

  const filePath = path.join(RESOURCES_DIR, course.resourceFileName);
  if (path.dirname(filePath) !== RESOURCES_DIR) {
    return NextResponse.json({ error: "Resursa nu a fost găsită." }, { status: 404 });
  }

  let file: Buffer;
  try {
    file = await readFile(filePath);
  } catch {
    return NextResponse.json({ error: "Resursa nu a fost găsită." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${course.resourceFileName}"`,
      "Content-Length": String(file.length),
    },
  });
}
