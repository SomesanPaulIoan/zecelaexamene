import "server-only";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_BYTES = 8 * 1024 * 1024;

// Saved under public/uploads/<subdir>/ — mounted as a persistent Docker volume in
// production (see docker-compose.prod.yml) so uploads survive image rebuilds/redeploys.
export async function saveUploadedImage(file: File | null | undefined, subdir: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_BYTES) throw new Error("Imaginea este prea mare (maxim 8MB).");
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error("Format de imagine neacceptat — folosește PNG, JPG, WEBP sau GIF.");

  const dir = path.join(process.cwd(), "public", "uploads", subdir);
  await mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${subdir}/${filename}`;
}
