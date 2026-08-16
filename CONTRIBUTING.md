# Contributing

Thank you for contributing to React Reboot E-commerce.

## Prerequisites

- Node.js 24
- npm 11
- Git

The supported Node.js major version is declared in `.nvmrc` and `package.json`.

## Installation

```sh
npm ci
```

The npm `prepare` script configures the repository's Git hooks through Husky.

## Development workflow

This repository follows GitHub Flow:

1. Start from an up-to-date `master` branch.
2. Work from an issue with a clear scope and acceptance criteria.
3. When requested, describe the intended implementation in the issue before coding.
4. Create a focused branch.
5. Open a pull request targeting `master`.
6. Merge only after the required checks pass and the review is approved.

Use the following branch naming convention:

```text
<type>/<issue-number>-<short-description>
```

Examples:

```text
feature/6-shopping-cart
chore/8-add-husky
fix/12-cart-persistence
```

## Commit messages

Commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification:

```text
<type>(optional-scope): <description>
```

Examples:

```text
feat(cart): add quantity controls
fix(products): handle an empty catalogue
chore: add local Git quality hooks
ci: add pull request quality checks
docs: document repository quality gates
```

Commitlint validates each message through the `commit-msg` hook.

## Local quality gates

Husky runs the following checks:

| Git hook     | Check                                                        |
| ------------ | ------------------------------------------------------------ |
| `pre-commit` | Runs ESLint and Prettier on staged files through lint-staged |
| `commit-msg` | Validates the commit message with Commitlint                 |
| `pre-push`   | Runs the complete test suite once                            |

These checks provide fast local feedback. They do not replace continuous integration.

## Available commands

| Command                | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start the Vite development server        |
| `npm run format`       | Format supported project files           |
| `npm run format:check` | Check formatting without modifying files |
| `npm run lint`         | Run ESLint                               |
| `npm run test`         | Run Vitest in watch mode                 |
| `npm run test:run`     | Run the test suite once                  |
| `npm run build`        | Type-check and create a production build |

## Pull requests and continuous integration

Pull requests must:

- remain focused on their issue;
- explain the implemented approach;
- describe the verification performed;
- reference their issue with `Closes #<issue-number>`;
- pass all required GitHub Actions checks;
- receive approval before being merged.

The quality workflow validates commit messages, formatting, linting, tests, and the production build. The quality workflow is designed to be used as a required status check for `master`. When repository rules are enforced, changes cannot be merged while the check is failing.

Local hooks can be bypassed, but the required checks on GitHub remain authoritative.
