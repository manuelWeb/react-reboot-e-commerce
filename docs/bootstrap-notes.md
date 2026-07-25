# Bootstrap decisions

## Goal and priority

This project is a focused React modernisation exercise for an upcoming retail
interview. The immediate priority is to refresh useful React skills quickly:
components, state, hooks, Context, reducers, asynchronous UI, testing,
accessibility, performance, SEO trade-offs, and the ability to explain technical
choices.

The bootstrap must stay lightweight. Tooling and visual polish should save time,
not become a project of their own.

## Selected stack

- **Vite + React + TypeScript** for a fast, explicit React SPA setup.
- **Tailwind CSS v4** through the official Vite plugin.
- **shadcn/ui**, using **Base UI** and the **Nova** preset, for low-value visual
  boilerplate only.
- **React Router** for client-side routing.
- **Mock Service Worker (MSW)** for HTTP scenarios in development and tests.
- **Vitest + React Testing Library (RTL)** for behaviour-focused component and
  integration tests.

## API and back-office simulation

MSW is preferred over JSON Server. It lets the project exercise loading, empty,
slow, error, stock-change, and rejected-order scenarios without building or
running a real backend or administration interface. The application code should
still make normal HTTP requests and remain unaware that responses are mocked.

## Imports and aliases

- Use explicit modern Node.js imports such as `node:path`.
- Use `@/*` as an alias for `src/*`.
- The alias must be configured in both TypeScript (`tsconfig.app.json`) and Vite
  (`vite.config.ts`).
- This dual configuration fixes the shadcn initialization error that reported no
  valid import alias.

## Git workflow

Use **GitHub Flow**, not full Git Flow:

- keep the default branch releasable;
- create one focused branch per unit of work;
- open small pull requests for review;
- use modern, intention-revealing commands such as
  `git switch -c feature/bootstrap` rather than `git checkout -b`.

## Deliberately postponed

Do not add these during the interview-first phase unless a concrete requirement
justifies them:

- Redux or Zustand;
- TanStack Query;
- Storybook;
- Docker;
- a real backend or database;
- a complex CI/CD setup.

Next.js is a discussion and design topic first: SEO, SSR/SSG, caching,
revalidation, and Server/Client Component boundaries can be reviewed after the
React SPA fundamentals are refreshed.

## Copilot policy

Copilot may accelerate low-learning-value work:

- imports and repetitive JSX;
- Tailwind classes and UI boilerplate;
- straightforward TypeScript types;
- mock data and MSW setup;
- test scaffolding and configuration.

Copilot must not make the important learning decisions:

- where state belongs;
- whether Context, a reducer, or an effect is justified;
- component and hook boundaries;
- state modelling and business behaviour;
- the testing strategy;
- memoisation or other performance optimisations;
- SEO and rendering trade-offs.

Any generated code must be understood, reviewed, and explainable by the
developer.
