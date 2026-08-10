// POST — clears the admin_token cookie (see app/api/admin/login/route.js).
export async function POST() {
  const res = Response.json({ ok: true });
  res.headers.append(
    "Set-Cookie",
    "admin_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
  );
  return res;
}
