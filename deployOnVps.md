Great — here’s a concise deploy guide you can reuse.

  VPS Deploy Guide (Hostinger + systemd)

  - Project path: /var/www/firecrackers
  - Service name: firecrackers.service
  - Run as: www-data

  1) SSH and go to project

  cd /var/www/firecrackers

  2) Pull latest code

  git fetch origin
  git checkout main
  git pull origin main

  3) Build cleanly

  rm -rf .next
  npm install
  npm install sharp
  npm run build

  4) Prepare standalone runtime files

  mkdir -p .next/standalone/.next
  cp -r .next/static .next/standalone/.next/
  cp -r public .next/standalone/
  mkdir -p .next/standalone/.next/cache

  5) Fix permissions

  chown -R www-data:www-data /var/www/firecrackers

  6) Restart app

  systemctl restart firecrackers.service
  systemctl status firecrackers.service --no-pager

  7) Quick health checks

  curl -s http://127.0.0.1:3000/api/products | head -c 300
  journalctl -u firecrackers.service -n 80 --no-pager

  8) If frontend shows old chunks/404

  - Purge CDN cache (Cloudflare: Purge Everything)
  - Hard refresh browser (Ctrl+Shift+R) or use Incognito

  ———

  Common fixes

  - Port 3000 already in use: don’t start PM2; use systemd service only.
  - sharp missing error: npm install sharp then rebuild.
  - EACCES permission errors: run chown -R www-data:www-data /var/www/firecrackers.
  - Chunk/CSS/woff 404 after deploy: rebuild clean + copy standalone files + purge CDN cache.