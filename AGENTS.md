# Repository Guidelines

## Project Structure & Module Organization
- `src/app` uses the Next.js App Router for pages and layouts.
- `src/components`, `src/hooks`, `src/contexts`, `src/lib`, and `src/types` hold reusable UI, logic, and types.
- `public/` stores static assets served by Next.js; `data/` holds local data files.
- `scripts/` is for one-off utilities and migrations.

## Build, Test, and Development Commands
- `npm run dev`: start the local Next.js dev server at `http://localhost:3000`.
- `npm run build`: create the production build in `.next/`.
- `npm run start`: run the production server from the build output.
- `npm run lint`: run Next.js ESLint rules (`next/core-web-vitals`, `next/typescript`).

## Coding Style & Naming Conventions
- TypeScript-first codebase with strict type checking (`tsconfig.json`).
- Follow Next.js App Router conventions (route folders under `src/app`).
- Path alias `@/*` maps to `src/*` (example: `@/components/Button`).
- ESLint is the primary style gate; run `npm run lint` before submitting.

## Testing Guidelines
- No formal test framework is configured yet.
- Use `npm run lint` for CI-style checks.
- A standalone script exists at `test-cloudinary.js` for Cloudinary smoke testing (run with `node test-cloudinary.js` when credentials are available).

## Commit & Pull Request Guidelines
- Commit messages are short, imperative, and sentence case (examples: `Fix i18n translations map`, `Add payment settings and redesign admin dashboard`).
- Keep commits focused and descriptive; avoid combining unrelated changes.
- PRs should include: a brief summary, key UI screenshots for visual changes, and any relevant environment or data setup notes.

## Configuration & Secrets
- Local settings live in `.env.local`; avoid committing secrets or service-account JSON.
- Firebase and Cloudinary configuration are expected via environment variables or local config files.
