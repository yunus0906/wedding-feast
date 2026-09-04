# Repository Guidelines

## Project Structure & Module Organization

This is a Nuxt 4 / Vue 3 TypeScript app. Application code lives in `app/`: `pages/` for routes, `components/` for reusable UI, `layouts/` for page shells, `stores/` for Pinia state, `types/` for shared interfaces, `utils/` for helpers, and `assets/css/` for global styles. Root configuration is in `nuxt.config.ts`, `tsconfig.json`, `package.json`, and `pnpm-workspace.yaml`.

Project planning docs are in `doc/`. `example-project/` is a larger reference implementation with backend, tests, specs, and deployment docs; only edit it when a task explicitly targets it.

## Build, Test, and Development Commands

Use pnpm from the repository root:

- `pnpm install` installs dependencies and runs Nuxt preparation.
- `pnpm dev` starts the local Nuxt development server.
- `pnpm build` creates the production Nuxt build in `.output/`.
- `pnpm preview` serves the built app for local production checks.

For `example-project/`, run commands from that directory. It additionally supports `pnpm eslint`, `pnpm typelint`, `pnpm test:unit`, and `pnpm test:e2e`.

## Coding Style & Naming Conventions

Use TypeScript strict mode and Vue Composition API patterns. Prefer small, focused components and composables. Name Vue components in PascalCase, route files in Nuxt's file-based routing style such as `pages/guests.vue`, and utilities with concise camelCase or domain names such as `utils/seating.ts`.

Keep two-space indentation in Vue, TypeScript, JSON, and config files. Use path aliases and Nuxt auto-imports where available instead of deep relative imports.

## Testing Guidelines

The root app currently has no committed test runner or test directory. For non-trivial logic, add focused tests alongside an agreed test setup. At minimum, verify `pnpm build` before handoff.

When working in `example-project/`, use Vitest unit tests under `test/unit/` and Playwright E2E tests under `test/e2e/specs/` or `test/e2e/vibe/`. Test files follow `*.spec.ts`.

## Commit & Pull Request Guidelines

The root repository has no existing commit history to derive conventions from. Use Conventional Commit subjects for new work, for example `feat: add guest seating view` or `fix: preserve table assignment order`. Keep subjects imperative and under 72 characters.

Pull requests should include a concise description, changed areas, verification commands run, and screenshots or clips for UI changes. Link related issues or planning docs when applicable.

## Agent-Specific Instructions

Keep edits scoped. Do not modify generated directories such as `.nuxt/`, `.output/`, or `node_modules/`. Preserve user changes and avoid broad refactors unless required.
