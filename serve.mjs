import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { existsSync } from "node:fs";

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".xml": "application/xml",
  ".txt": "text/plain",
};

const ROOT = process.argv[2] || "./build";
const PORT = parseInt(process.argv[3] || "3000", 10);

const server = createServer(async (req, res) => {
  const headers = {
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Access-Control-Allow-Origin": "*",
  };

  let urlPath = new URL(req.url, `http://localhost:${PORT}`).pathname;
  if (urlPath.endsWith("/")) urlPath += "index.html";

  let filePath = join(ROOT, urlPath);

  // SPA fallback: serve index.html for non-file paths
  if (!extname(filePath) && !existsSync(filePath)) {
    filePath = join(ROOT, "index.html");
  }

  try {
    const data = await readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType, ...headers });
    res.end(data);
  } catch {
    // Fallback to index.html for SPA routing
    try {
      const data = await readFile(join(ROOT, "index.html"));
      res.writeHead(200, { "Content-Type": "text/html", ...headers });
      res.end(data);
    } catch {
      res.writeHead(404, headers);
      res.end("Not Found");
    }
  }
});

server.listen(PORT, () => {
  console.log(`Serving ${ROOT} on http://localhost:${PORT}`);
});
