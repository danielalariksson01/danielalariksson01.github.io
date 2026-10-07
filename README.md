# danielalariksson01.github.io

## Preview locally

```
npm run dev
```

Then open http://localhost:8000. The page reloads automatically when you save a file. No `npm install` needed.

Use a different port with `node dev-server.js 3000`.

## Structure

- `index.html` – the page. CSS lives in `assets/css/style.css`, JS in `assets/js/main.js`
  (no inline scripts/styles, so the Content-Security-Policy in `<head>` can stay strict).
- `assets/img/` – portrait (AVIF/WebP/JPG), Open Graph image and app icon.
- `404.html`, `robots.txt`, `sitemap.xml`, `site.webmanifest`, `favicon.*`, `.well-known/security.txt`.
- `_config.yml` – keeps dev files (`dev-server.js`, `package.json`, this README) off the published site.

Update `lastmod` in `sitemap.xml` when the content changes, and renew `Expires` in
`security.txt` before 2027-10-07.
