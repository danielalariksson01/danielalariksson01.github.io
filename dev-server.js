// Local preview server with live reload. No dependencies.
// Usage: npm run dev   (or: node dev-server.js [port])

const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.argv[2] || process.env.PORT || 8000);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
};

// Served as an external file so it passes the page's Content-Security-Policy.
const reloadScript = '<script src="/__reload.js"></script>';
const reloadClient = "new EventSource('/__reload').onmessage = () => location.reload();";
const clients = new Set();

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);

  if (urlPath === '/__reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write('\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  if (urlPath === '/__reload.js') {
    res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' }).end(reloadClient);
    return;
  }

  let file = path.join(root, urlPath);
  if (!file.startsWith(root)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    file = path.join(file, 'index.html');
  }

  fs.readFile(file, (err, data) => {
    let status = 200;
    if (err) {
      // Mirror GitHub Pages: serve the custom 404 page if there is one.
      file = path.join(root, '404.html');
      try {
        data = fs.readFileSync(file);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404 Not Found');
        return;
      }
      status = 404;
    }
    res.statusCode = status;
    const ext = path.extname(file).toLowerCase();
    res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    if (ext === '.html') {
      const html = data.toString();
      res.end(html.includes('</body>') ? html.replace('</body>', reloadScript + '</body>') : html + reloadScript);
    } else {
      res.end(data);
    }
  });
});

let timer;
fs.watch(root, { recursive: true }, (_event, filename) => {
  if (!filename || filename.startsWith('.git') || filename.startsWith('node_modules')) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    console.log(`changed: ${filename} - reloading`);
    for (const client of clients) client.write('data: reload\n\n');
  }, 100);
});

server.listen(port, () => {
  console.log(`Serving ${root}`);
  console.log(`Open http://localhost:${port}  (Ctrl+C to stop)`);
});
