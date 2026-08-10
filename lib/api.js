/* lib/api.js */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function apiFetch(path, options = {}) {
  const fullPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${fullPath}`;

  const res = await fetch(url, {
    ...options,
    cache: "no-store", // Never let Next's fetch cache serve stale API data
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request to ${path} failed`);
  }

  return res.json();
}
