# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds SvelteKit code: routes in `src/routes`, shared utilities in `src/lib`, server-only helpers in `src/lib/server`, and global styles in `src/app.css`.
- Static assets belong in `static/`; Playwright suites live in `e2e/`; keep Vitest specs beside the code they cover (see `src/demo.spec.ts`).
- Key configuration files include `vite.config.ts`, `svelte.config.js`, `playwright.config.ts`, and `drizzle.config.ts` for database orchestration.

## Build, Test, and Development Commands
- `npm run dev` launches the Vite dev server (`-- --open` auto-opens a browser).
- `npm run build` compiles the production bundle; pair with `npm run preview` for a local smoke test before shipping.
- `npm run check` executes `svelte-check`; run it alongside `npm run lint` (Prettier check + ESLint) or `npm run format` when touching layout or styles.
- Testing shortcuts: `npm run test:unit` for Vitest, `npm run test:e2e` for Playwright, and `npm run test` to run both suites in CI order.

## Coding Style & Naming Conventions
- Prettier enforces two-space indentation, TypeScript single quotes, and Tailwind ordering; do not hand-format around those rules.
- Use PascalCase for Svelte components, camelCase for functions/variables, and SCREAMING_SNAKE_CASE for environment constants.
- Extract reusable helpers into `src/lib`; keep route files focused on transport logic and move secrets or adapters into server-only modules.

## Testing Guidelines
- Mirror production scenarios: favor small Vitest units near their modules and name them `*.spec.ts` or `*.test.ts`.
- Share mocks via `vitest-setup-client.ts`; import from it rather than redefining globals per test.
- Align Playwright filenames with the feature or route under test (e.g., `checkout-flow.test.ts`).

## Commit & Pull Request Guidelines
- With no shared history yet, follow Conventional Commits (e.g., `feat: add cashier closing flow`, `fix: handle session expiry`).
- Commits should bundle related code, migrations, and documentation while keeping diffs reviewable.
- PRs must explain intent, list the commands you ran (`npm run lint`, `npm run test`, etc.), link issues, and include screenshots for UI-visible changes; highlight breaking changes or config updates up front.

## Database & Environment Notes
- Copy `.env.example` when present, and keep credentials out of the repo; prefer local overrides via `.env.local`.
- Use `npm run db:start` (Docker Compose) to boot Postgres, then `npm run db:generate`, `db:push`, or `db:migrate` as appropriate; always review generated SQL before applying.
- Stop containers after testing to avoid port conflicts and stale credentials.
