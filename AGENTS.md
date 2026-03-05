# Repository Notes (OpenHands)

## Commands
```bash
npm install
npm run dev
npm run lint
npm run build
```

## Required environment
Create `.env.local`:
- `MONGODB_URI=...`
- `NEXTAUTH_SECRET=...`
- `NEXTAUTH_URL=http://localhost:3000`

## Architecture
- App Router route group `(main)` is wrapped in `lib/scroll/LenisProvider.tsx` (GSAP ticker drives Lenis RAF; ScrollTrigger routed through Lenis).
- Auth: NextAuth Credentials provider (`lib/auth.ts`) + `middleware.ts` protects `/dashboard`, `/docs` and API routes.
- API docs: Swagger JSDoc via `next-swagger-doc`; OpenAPI JSON at `/api/docs`, UI at `/docs` (production gated to admin).
