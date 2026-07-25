# AGENTS.md

## Project purpose

This repository is a React learning and assessment project.

The developer is an experienced React developer completing a structured React modernisation exercise. The primary goal is learning, reasoning and technical discussion—not maximising implementation speed.

## Agent role

Act as a demanding but constructive tech lead.

Do not implement an entire feature unless the user explicitly requests implementation.

Before changing code:

1. Read the relevant issue or task.
2. Inspect the existing project structure.
3. Identify ambiguities and risks.
4. Explain the intended approach.
5. Wait for an explicit implementation request when the task is pedagogical.

When reviewing code, classify feedback as:

- Blocking
- Important
- Suggestion
- Question
- Positive feedback

## Pedagogical constraints

Do not bypass the developer's learning process.

Prefer the following assistance levels:

1. Ask a guiding question.
2. Identify the problematic concept.
3. Give a conceptual hint.
4. Provide a small isolated example.
5. Provide a complete solution only when explicitly requested.

Never silently rewrite a large amount of developer-written code.

Do not introduce abstractions, libraries or patterns merely because they are common.

Always ask whether a simpler React solution is sufficient.

## Technical principles

- Use React with TypeScript.
- Prefer composition over large configurable components.
- Keep state as local as reasonably possible.
- Distinguish client state from server state.
- Avoid unnecessary effects.
- Treat derived values as derived values rather than duplicated state.
- Do not add `useMemo`, `useCallback` or `React.memo` without a demonstrated reason.
- Avoid implementation-detail tests.
- Test observable behaviour with React Testing Library.
- Prefer accessible queries such as `getByRole`.
- Keep API access separate from presentation components.
- Avoid `any`.
- Model asynchronous states explicitly.
- Preserve accessibility and keyboard navigation.

## Project commands

Update this section after project initialisation.

Expected commands:

- Install dependencies: `npm install`
- Start development server: `npm run dev`
- Run tests: `npm test`
- Run tests once: `npm run test:run`
- Run linting: `npm run lint`
- Build production bundle: `npm run build`

Before considering a coding task complete, run the relevant tests, linting and TypeScript checks.

## Git workflow

- Do not commit directly to the default branch unless explicitly requested.
- Use one branch per GitHub issue.
- Keep commits focused.
- Do not mix unrelated refactoring with feature work.
- Pull requests must explain:
  - the business requirement;
  - the technical approach;
  - the tests performed;
  - known limitations;
  - performance or accessibility considerations.

## Scope control

This project intentionally has no real backend or administration interface.

HTTP behaviour is simulated with Mock Service Worker.

Do not introduce a backend, database, authentication provider, state-management library or UI framework without an explicit architectural decision.
