# RankForge Development Rules & Lessons Learned

## 1. Case Sensitivity & Imports
- **Never rely on Windows' case-insensitive file system.** Netlify builds on Linux, which is strictly case-sensitive.
- All UI components in `src/components/ui/` MUST use PascalCase for filenames (e.g., `Button.tsx`, `Card.tsx`, `Badge.tsx`) and imports must match this exact casing (`import { Button } from '../../components/ui/Button'`).
- Repeating the `button.tsx` vs `Button.tsx` mismatch error is unacceptable.

## 2. Vite Config & PWA
- Do not duplicate keys inside `vite.config.ts` (e.g., `includeAssets`). Always merge arrays if the key already exists.
- The `VitePWA` plugin config must remain valid JSON/JS object structure without duplicate keys.

## 3. Database Updates & Schema
- When adding columns that affect core flows (like `quiz_attempts.is_correct`), ensure all interacting components (like `QuizWidget`) are updated to handle the new fields correctly so logic doesn't break.
- Always handle duplicate constraints gracefully (e.g., `23505` error codes) on the client side with user-friendly messages.

## 4. Deployments
- Run `npm run build` locally to verify TypeScript compilation and Rollup bundling before pushing.
- Only push to `origin main` when explicitly instructed by the user.

*Note: This document serves as persistent memory for the AI agent to prevent repeating past mistakes.*
