// Dev reverse proxy — lets a single ngrok tunnel serve both apps:
//   /api/* and /webhooks/*  →  Express API  (:4000)
//   everything else         →  Next.js dev   (:3000)
//
// Run: node dev-proxy.js  (or npm run dev:proxy)
// Point ngrok at http://localhost:3001, then set SHOP_URL and
// NEXT_PUBLIC_API_URL to the ngrok URL so the post-payment redirect and
// browser API calls work from any device.
import http from "node:http";

const API_PORT = parseInt(process.env.API_PORT, 10) || 4000;
const WEB_PORT = parseInt(process.env.WEB_PORT, 10) || 3000;
const PROXY_PORT = parseInt(process.env.PROXY_PORT, 10) || 3001;

const server = http.createServer((req, res) => {
  const isApi =
    req.url.startsWith("/api/") || req.url.startsWith("/webhooks/");
  const target = isApi ? API_PORT : WEB_PORT;

  const proxy = http.request(
    {
      host: "localhost",
      port: target,
      path: req.url,
      method: req.method,
      headers: req.headers,
    },
    (upstream) => {
      res.writeHead(upstream.statusCode, upstream.headers);
      upstream.pipe(res);
    },
  );

  proxy.on("error", (err) => {
    console.error(`Proxy error to :${target}:`, err.message);
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Upstream unavailable" }));
  });

  req.pipe(proxy);
});

server.listen(PROXY_PORT, () => {
  console.log(
    `Dev proxy listening on http://localhost:${PROXY_PORT}` +
      ` (api → :${API_PORT}, web → :${WEB_PORT})`,
  );
});
