# UI Redesign Prompt (Claude)

You are redesigning the UI across the entire application (all pages, including admin dashboard) without changing any backend logic or functionality. Only edit UI, layout, styling, and front-end presentation. Do not change any API routes, business rules, data models, authentication logic, or core functionality.

## Scope
- Redesign every page in the project, including:
  - Public pages (home, categories, product listings, etc.)
  - Auth pages (login, signup)
  - Account pages (profile, referrals, orders, notifications, wishlist, etc.)
  - Checkout flow
  - Admin dashboard

## Constraints (Must Follow)
- Keep all existing functionality working exactly as it does now.
- Do not modify API routes, data logic, or backend services.
- Do not remove required fields or validations.
- Do not break routing or navigation paths.
- Keep the referral and voucher flows unchanged in logic.
- Preserve accessibility: readable contrast, keyboard focus, and clear labels.
- Keep mobile responsiveness for all pages.

## Visual Direction
- Create a more premium, intentional design (not generic).
- Introduce a clear visual system: typography, spacing scale, color palette, and components.
- Avoid default system font stacks; use expressive, purposeful fonts.
- Use CSS variables for theme tokens where possible.
- Add subtle but meaningful motion (page load, section reveal, or hover transitions).
- Use more atmospheric backgrounds (gradients, textures, or shapes), not flat single-color.
- Avoid purple-on-white and dark-mode bias unless the existing site already uses it.

## Output Expectations
- Keep the codebase structure intact.
- Update only front-end files (React components, CSS/Tailwind classes, global styles).
- Ensure pages render correctly on both desktop and mobile.
- Avoid breaking changes to data fetching or state management.

## Step-by-Step Execution
Work page-by-page:
1) Identify the target page and its current layout.
2) Redesign the UI while keeping existing props/state and logic untouched.
3) Check for mobile responsiveness.
4) Move on to the next page.

## Priority Order
Start with:
1) Home page
2) Product/category pages
3) Signup/Login
4) Account pages
5) Checkout
6) Admin dashboard

Deliver redesigned UI for each page in sequence.
