import { createHash, timingSafeEqual } from "node:crypto";

// POST { token } — verifies the admin token and sets the admin_token cookie
// (HttpOnly, same-site) that the Express API's requireAdmin middleware reads.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const presented = typeof body.token === "string" ? body.token : "";
  const expected = process.env.ADMIN_API_TOKEN;

  if (!expected) {
    return Response.json(
      { error: "Admin API is not configured" },
      { status: 503 },
    );
  }
  if (!presented) {
    return Response.json({ error: "Token is required" }, { status: 400 });
  }

  // Constant-time comparison (hash first — timingSafeEqual throws on
  // length mismatch, same approach as the Express middleware).
  const a = createHash("sha256").update(presented).digest();
  const b = createHash("sha256").update(expected).digest();
  if (!timingSafeEqual(a, b)) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  const res = Response.json({ ok: true });
  res.headers.append(
    "Set-Cookie",
    `admin_token=${encodeURIComponent(expected)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
  );
  return res;
}
