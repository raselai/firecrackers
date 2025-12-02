# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Light House E-commerce is a Next.js 14 e-commerce website for AL MESBAH ALABYAD LIGHTS TRADING L.L.C, a lighting products business. The site features product management with Firebase Firestore backend, Cloudinary image handling, and an admin dashboard.

## Commands

### Development
```bash
npm run dev     # Start development server on localhost:3000
npm run build   # Build for production
npm start       # Start production server
npm run lint    # Run ESLint
```

### Testing Changes
After making changes, always run `npm run build` to verify there are no build errors before committing.

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage + Cloudinary (hybrid approach)
- **Styling**: Tailwind CSS
- **UI Components**: Custom components in `src/components/`

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── api/               # API routes
│   │   ├── products/      # Product CRUD operations
│   │   ├── upload/        # Image upload endpoints
│   │   └── images/        # Image serving
│   ├── admin/             # Admin dashboard (login at /admin)
│   ├── categories/        # Category pages (indoor/outdoor lights)
│   ├── products/[slug]/   # Product detail pages
│   ├── data/              # Static data (categories, product seeds)
│   └── layout.tsx         # Root layout with Navbar and Footer
├── components/            # Reusable components
├── lib/                   # Core business logic
│   ├── firebase.ts        # Firebase initialization
│   ├── firestore.ts       # Firestore CRUD functions
│   ├── cloudinary.ts      # Cloudinary configuration
│   ├── productService.ts  # Product API client
│   └── storage.ts         # Firebase Storage operations
├── types/                 # TypeScript interfaces
└── hooks/                 # Custom React hooks
```

### Data Flow

**Product Management Architecture:**
1. Admin creates/edits product via forms in `src/components/AddProductForm.tsx` or `EditProductForm.tsx`
2. Images uploaded through `src/components/ImageUpload.tsx` to Firebase Storage
3. Product data with image URLs saved to Firestore via `/api/products` route
4. Frontend fetches products using `productService.ts` client functions
5. Products displayed via `ProductCard` components

**Multiple API Route Variants:**
- `/api/products` - Primary Firestore-based routes (USE THIS)
- `/api/products-hybrid` - Hybrid implementation (legacy)
- `/api/products-new` - Alternative implementation (legacy)
- `/api/products-vercel` - Vercel-specific (legacy)

When working with products, always use `/api/products` routes.

### Key Patterns

**Product Interface:**
The main Product type (`src/types/product.ts`) has dual fields for backward compatibility:
- `image` vs `mainImage` - Single product image
- `images` vs `galleryImages` - Multiple product images
- `featured` vs `isFeatured` - Featured product flag
- `seasonal` vs `isOnSale` - Sale/seasonal flag
- `offerPrice` - Sale price when `isOnSale: true`

Always populate both variants when creating/updating products.

**Image Handling:**
- Primary images stored in Firebase Storage
- Cloudinary used for optimized image delivery (see `src/lib/cloudinary.ts`)
- Images reference pattern: `firebasestorage.googleapis.com/...`
- Upload via `/api/upload` or `/api/upload-image` endpoints

**Category System:**
Categories are hierarchical:
- **Main categories**: indoor-lights, outdoor-lights, led-strip, spotlight
- **Subcategories**: chandeliers, ceiling-lights, wall-lamps, pendant-lights, garden-lights, street-lamps, flood-lights, wall-fixtures

Categories defined in `src/app/data/categories.ts`. Product filtering uses both `category` and `subcategory` fields.

### Firebase Configuration

Firebase credentials are hardcoded in `src/lib/firebase.ts` (production config). When adding environment variable support, move these to `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
```

**Warning**: Update admin credentials (`admin/password123`) before production deployment.

### State Management

No global state library - uses React local state and Server Components where possible:
- Client components marked with `'use client'` directive
- Server components fetch data directly from Firestore
- Admin forms use controlled component pattern with local state

### Styling Conventions

- Tailwind utility classes for styling
- Global styles in `src/app/globals.css`
- Footer and layout styles defined in layout component
- Custom CSS classes like `.footer`, `.container` in globals.css
- Responsive design using Tailwind breakpoints

### Known Issues & Workarounds

1. **Firestore Timestamp Handling**: Firestore returns Timestamp objects for dates. The `getAllProducts()` function in `firestore.ts` manually converts these to Date objects for sorting (lines 92-119).

2. **Image URL Format**: Some products use Firebase Storage URLs, others may use Cloudinary. The ImageGallery component handles both formats.

3. **Build Configuration**: `next.config.js` uses `output: 'standalone'` and `unoptimized: true` for images to support Hostinger deployment.

## Deployment

See `DEPLOYMENT.md` for full Hostinger deployment instructions. Key points:
- Node.js version: 18.x or 20.x
- Build command: `npm run build`
- Start command: `npm start`
- Admin access: `/admin` with credentials `admin/password123` (CHANGE IN PRODUCTION)

## Important Notes

- **Path Aliases**: Use `@/` prefix for imports from `src/` directory (configured in `tsconfig.json`)
- **Firebase Storage vs Cloudinary**: Project migrated from Cloudinary to Firebase Storage but retains Cloudinary utilities in `src/lib/cloudinary.ts` for potential optimization
- **Migration Scripts**: `scripts/` directory contains one-time migration scripts for moving products between storage systems
- **WhatsApp Integration**: Contact buttons link to WhatsApp for customer inquiries (see `src/components/WhatsAppIcon.tsx`)
