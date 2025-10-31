## Purpose

Short, actionable guidance for automated coding agents working on E-Reseta — an **Electronic Prescription System** for doctors to easily generate prescriptions electronically.

Tech stack: React + TypeScript + Vite + Firebase + Tailwind CSS.

## Big picture (what to know first)

- **App entry**: `src/main.tsx` mounts React and renders `App`.
- **Routing & pages**: `src/App.tsx` declares routes. Key routes: `/login`, `/landing`, `/create-reseta-template`, `/generate-prescription`, `/view-prescriptions`.
- **Auth & data**: Firebase (modular SDK) backs auth and Firestore. Config at `src/firebase/config.ts` and app-wide auth is in `src/auth/AuthContext.tsx`.
- **UI**: Tailwind CSS utility classes across components (see `index.css` + `tailwind.config.cjs`). Reusable UI pieces live under `src/components/reusable`.

**Why structure exists**

- Single-page app with client-side routing to keep auth state client-managed and show modals (e.g., `CompleteProfileModal`) when profile fields are missing.
- Firebase used for auth and lightweight serverless data store; documents are created/merged from the client.

## Design system & color palette

Use the following colors consistently across the app (defined in `tailwind.config.cjs`):

- **Primary**: `#1D3557` (Structured Navy) — primary buttons, headers
- **Secondary**: `#457B9D` (Soft Steel Blue) — secondary actions, accents
- **Accent**: `#A8DADC` (Calm Sky Cyan) — highlights, hover states
- **Background**: `#F1FAEE` (Clinical White) — page backgrounds
- **Text**: `#0B0B0B` (Medical Black) — body text

When adding UI components, reference these colors via Tailwind config or use the hex values directly. Keep medical/clinical aesthetic professional and calm.

## Critical developer workflows (how to run & debug)

- Start dev server (Vite). Check `package.json` scripts for exact commands. Environment variables for Firebase are read from `import.meta.env.VITE_FIREBASE_*`.
- Build: use the project's build script in `package.json` (Vite build).
- Debugging notes: `AuthContext` logs extensively via `console.log`/`console.error` — use these messages; they indicate where auth/data fetching fails or permission issues occur.

## Project-specific conventions & patterns

- **Firebase modular API**: prefer `getDoc`/`setDoc` with `doc(db, 'users', uid)`. See `src/auth/AuthContext.tsx` for examples.
- **User document shape** (discoverable from `AuthContext`):
  - `uid`, `email`, `displayName`, `photoURL`, `licenseNo?`, `signature?`, `professionalTitle?`, `hasCompletedProfile` (boolean)
- **Protected routes**: components are wrapped in `ProtectedRoute` (`src/auth/ProtectedRoute.tsx`) inside `App.tsx` — use this pattern when adding pages that require auth.
- **Profile completeness**: UI flow depends on `userData.hasCompletedProfile`; the modal `CompleteProfileModal` enforces collection of `licenseNo` + `signature`.
- **Navigation**: prefer `react-router-dom` `useNavigate` for programmatic navigation (examples: `Login.tsx`, `LandingPage.tsx`).
- **Documentation**: All `.md` files (except README and this file) should be placed in the `docs/` folder for organization.

## Integration points & external deps

- Firebase: `src/firebase/config.ts` exports `auth`, `googleProvider`, and `db`. Ensure `VITE_FIREBASE_*` env vars are set in local `.env` for dev.
- Google sign-in flow: `signInWithPopup(auth, googleProvider)` — errors bubble to `AuthContext` and are surfaced to UI.

## When editing code, watch for these patterns

- Side effects in `AuthContext`: changes to auth state trigger Firestore reads (`onAuthStateChanged` -> `fetchUserData`). When changing auth or data shape, update `fetchUserData`, `updateUserProfile`, and any components that reference `userData.hasCompletedProfile`.
- Firestore writes use `setDoc(..., { merge: true })` when updating; be careful not to overwrite fields unintentionally.
- Components frequently rely on Tailwind classes; keep design changes consistent with existing utility usage.

## Concrete examples to reference

- Auth bootstrap & listener: `src/auth/AuthContext.tsx` (uses `onAuthStateChanged`, `getDoc`, `setDoc`).
- Firebase config / env vars: `src/firebase/config.ts` (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc.).
- Routes & guards: `src/App.tsx` (route examples with `ProtectedRoute`).
- Login flow: `src/auth/Login.tsx` — calls `signInWithGoogle()` from context and redirects to `/landing`.

## Best practices (execute tasks with these in mind)

- **Type safety**: Always use TypeScript interfaces/types; avoid `any` except when absolutely necessary.
- **Error handling**: Wrap Firebase calls in try-catch blocks; surface errors to users via UI feedback (toasts, error messages).
- **State management**: Use React hooks (`useState`, `useEffect`, `useContext`) appropriately; avoid prop drilling — leverage context when state is shared across many components.
- **Code organization**: Keep components small and focused; extract reusable logic into custom hooks.
- **Security**: Never expose Firebase config secrets; use env vars (`VITE_FIREBASE_*`). Validate user input before Firestore writes.
- **Accessibility**: Use semantic HTML; add ARIA labels where needed for screen readers.
- **Performance**: Use React lazy loading for routes if app grows; memoize expensive computations with `useMemo`/`useCallback`.
- **Testing**: (Aspirational) Add unit tests for utility functions and integration tests for critical flows (auth, prescription generation).

## Do this (actionable tasks for agents)

- **Adding a new protected page**: add route in `src/App.tsx` and wrap with `ProtectedRoute`.
- **Adding user fields**: update `UserData` shape in `src/auth/AuthContext.tsx`, update Firestore read/write in `fetchUserData`/`updateUserProfile`, and update UI components that show profile completeness.
- **Investigating auth/permission problems**: use existing console logs in `AuthContext`.
- **Proposing changes**: If a user requests something that violates best practices (e.g., hardcoding secrets, bypassing auth guards, using `any` everywhere), **flag it and suggest a better approach** before proceeding.

## Files to inspect first

- `src/auth/AuthContext.tsx` — auth, user shape, and Firestore interactions
- `src/firebase/config.ts` — how env vars are consumed
- `src/App.tsx` — routes and protected-route usage
- `src/components/reusable/*` — UI patterns and modal usage (e.g., `CompleteProfileModal.tsx`)

## Questions to ask a human reviewer (if uncertain)

- Are there server-side rules for Firestore (security rules) we should know about? Permission errors are handled locally in `AuthContext` but rules may block writes.
- Any required audit or compliance requirements for prescription data retention/encryption?

---

If any part of this summary is unclear or you want more detail about a particular area (routing, Firestore shape, or adding CI checks), tell me which section to expand and I will iterate.
