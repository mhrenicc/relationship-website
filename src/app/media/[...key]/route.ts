import { get } from "@vercel/blob";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "@/lib/auth";

/**
 * Serves photographs out of the private blob store.
 *
 * Private blobs cannot be fetched by URL, so nothing can point an <img> at one.
 * This checks the session first and only then streams the bytes, which means a
 * photograph's address is worthless to anyone who has not unlocked the site —
 * unlike a public store, where a leaked link works forever on its own.
 *
 * `proxy.ts` already gates this path, but Route Handlers are reachable
 * directly, so the check is repeated here rather than assumed.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const cookieStore = await cookies();
  if (!isValidSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value)) {
    return new Response("Locked", { status: 401 });
  }

  const { key } = await params;
  const pathname = key.map(decodeURIComponent).join("/");

  // The path is rebuilt from segments, so ".." cannot climb out, but a stored
  // key is always under photos/ and anything else is a request we did not write.
  if (!pathname.startsWith("photos/")) {
    return new Response("Not found", { status: 404 });
  }

  const result = await get(pathname, { access: "private" });
  if (!result) return new Response("Not found", { status: 404 });

  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType ?? "application/octet-stream",
      // Immutable: keys are UUIDs and a variant is never rewritten, so the
      // browser can hold onto it. Private, because this is one person's photo
      // and it must not sit in a shared cache.
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
