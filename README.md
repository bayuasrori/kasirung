# Kasirung POS

Kasirung is a point-of-sale web application built with **SvelteKit**, **Lucia Auth**, **Drizzle ORM**, **PostgreSQL**, and **TailwindCSS/shadcn** components. This guide walks you through the initial setup required to get the project running locally.

## Prerequisites

- Node.js 18+ (or Bun 1.0+, though the project uses npm scripts)
- npm 9+ (or pnpm/yarn if you prefer)
- Docker + Docker Compose (for running PostgreSQL)

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment Variables

Copy the example environment file and adjust values as needed (database URL, Lucia secrets, etc.).

```bash
cp .env.example .env
```

## 3. Start the Database

Use the provided Docker Compose setup to launch PostgreSQL locally.

```bash
npm run db:start
```

## 4. Generate & Apply Drizzle Schema

Create the latest SQL artifacts and push the schema to the running database.

```bash
npm run db:generate
npm run db:push
```

## 5. Seed Initial Data (Optional)

Populate the database with default roles, an admin account, sample products, and transactions.

```bash
npm run db:seed
```

## 6. Run the Development Server

```bash
npm run dev -- --open
```

The app will be available at [http://localhost:5173](http://localhost:5173).

## 7. Useful Scripts

| Command | Description |
| --- | --- |
| `npm run lint` | Run Prettier and ESLint checks |
| `npm run check` | Run `svelte-check` type analysis |
| `npm run test` | Execute unit + e2e test suites |
| `npm run build` | Produce a production build |
| `npm run preview` | Preview the production build locally |

> Tip: Stop the database container with `npm run db:stop` when you're done developing.
