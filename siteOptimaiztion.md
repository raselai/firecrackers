 - Performance 56
  - FCP 4.9s, LCP 11.0s, TBT 260ms, CLS 0
  - Render‑blocking CSS/Fonts (savings ~980ms)
  - Improve image delivery (savings ~1,920 KiB)
  - Avoid enormous network payloads (~22,716 KiB)
  - Reduce unused JS (126 KiB), minify JS (31 KiB), reduce unused CSS (10 KiB)
  - Minimize main‑thread work (4.6s), long tasks present
  - Non‑composited animations noted

  Here’s a prioritized TODO list mapped to those issues:

  P0 — Biggest wins (LCP + payload)

  - Replace/optimize hero video (public/images/hero/Video.mp4), add poster, avoid auto-load on mobile.
  - Compress and resize large category images in public/images/categories/*.
  - Re‑enable Next Image optimization and configure Firebase Storage domains.
  - Add explicit sizes for all <Image> components to reduce transfer size.

  P1 — Rendering / blocking

  - Reduce Google Fonts usage: limit weights, remove unused families, ensure preconnect.
  - Inline critical CSS or reduce unused global styles.

  P2 — JS + main‑thread

  - Convert homepage to server‑rendered data (remove client fetch + no-store).
  - Trim client components that don’t need to be client-only.
  - Remove extra console logging in production paths.

  P3 — Caching

  - Add cache headers for static assets (Nginx/VPS) and Firebase Storage.
  - Use ISR (revalidate) for products to reduce server work.