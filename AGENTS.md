# Repository Guidelines

## Project Structure & Module Organization

This Next.js 14 app uses the App Router under `src/app`, with feature routes such as `post-csr`, `post-pdf`, and `api` handlers for export utilities. Rich-text features live in `src/components/TiptapEditor`, while source mode and media tools sit in `src/components/SourceEditor` and `src/components/MediaLibrary`. Shared hooks (`src/hooks`), services (`src/services/post.ts`), and static data (`src/data`) keep cross-cutting logic isolated. Global styles (`src/styles/globals.scss`) and Tailwind tokens (`tailwind.config.js`) control theming, and static files belong in `public/`.

## Build, Test, and Development Commands 

Install dependencies with `npm install`. Use:

- `npm run dev` to launch the local server at `http://localhost:3000`.
- `npm run build` to compile production assets; this also triggers sitemap generation via `postbuild`.
- `npm run start` to serve the optimized build.
- `npm run lint` to run the Next.js ESLint suite; fix all issues before pushing.

## Coding Style & Naming Conventions

Follow Prettier defaults (2-space indentation, double quotes, semicolons) and keep code TypeScript-first. Organize components in feature folders with PascalCase file names (`TiptapProvider.tsx`), hooks with camelCase `use` prefixes, and config objects in `src/data`. Tailwind utility classes should stay close to markup; extract shared styling into SCSS modules within the relevant feature folder. Avoid introducing explicit `any` unless matching existing patterns and include descriptive prop and function names.

## Testing Guidelines

The project currently relies on manual verification plus linting. When adding automated coverage, prefer Jest or Vitest colocated in `src/__tests__`, naming files `<feature>.test.ts(x)`. Ensure new editor behaviors are exercised against both rich-text and source modes, and document manual QA steps in the PR when automated coverage is not feasible.

## Commit & Pull Request Guidelines

Follow the Conventional Commit style already in history (`feat:`, `fix:`, `chore:`). Group related changes into a single commit and reference issues where applicable. Pull requests should describe the editor scenarios affected, list test evidence (command output or screenshots), and call out configuration steps (e.g., new env vars) so reviewers can reproduce.

## Security & Configuration Tips

Copy `.env.example` to `.env.local` and provide Cloudinary credentials for asset uploads; never commit populated secrets. Sanitize user content before exporting through new endpoints, and review API route changes for unnecessary data exposure.
