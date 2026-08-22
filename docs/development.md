# Development

> [!WARNING]
> ☣️ **This is an MVP under active development. Anything may change at any time. We do not recommend using this framework in production-level projects.**

This document describes how the Adalov monorepo is organized for local development and how to add new framework packages.

**Adalov is still an MVP, so these decisions may evolve as the framework gains real implementations and usage.**

## Requirements

- Node.js 22.15.0 or newer
- npm 10 or newer

The repository includes `.nvmrc` with the current Node.js development baseline. When using NVM, switch manually with:

```bash
nvm use
```

Install or update dependencies from the repository root with:

```bash
npm install
```

When `package-lock.json` is already up to date and a reproducible clean dependency install is desired, use:

```bash
npm ci
```

`npm ci` removes the existing `node_modules` installation before installing exactly from the lockfile. It does not regenerate `package-lock.json`.

The repository uses npm Workspaces and TypeScript Project References. No additional monorepo build tool is required.

## Repository Structure

```text
adalov/
├── docs/
├── packages/
│   ├── cli/
│   ├── common/
│   ├── core/
│   ├── http/
│   └── metadata/
├── playground/
├── scripts/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── tsconfig.package.json
├── tsconfig.packages.json
├── tsconfig.packages.build.json
└── tsconfig.tests.json
```

Framework packages are npm workspaces under `packages/`. `playground/` is also a private workspace, but it is a local development consumer rather than a publishable framework package.

## TypeScript Configuration

TypeScript configuration is split by responsibility instead of duplicating compiler options in every package.

| Configuration | Responsibility |
| --- | --- |
| `tsconfig.json` | Repository-wide base configuration. Defines the common compiler behavior shared by development and build configurations, including strict type checking, native ESM/NodeNext resolution, declarations, decorators, and composite project support. |
| `tsconfig.build.json` | Extends the base configuration with stricter build-only checks and defines the build-specific TypeScript incremental state location. |
| `tsconfig.package.json` | Defines the common source layout for every package: package root as `rootDir`, `build/` as compiler output, `.tsbuildinfo/dev.tsbuildinfo` as development incremental state, and `index.ts` plus `lib/**/*.ts` as package sources. Individual package `tsconfig.json` files extend this configuration and normally contain only package-specific project references. |
| `tsconfig.packages.json` | Development project graph. References the development `tsconfig.json` of every package and is used by `npm run build:dev`. |
| `tsconfig.packages.build.json` | Strict build project graph. References the `tsconfig.build.json` of every package and is used by `npm run build`. |
| `tsconfig.tests.json` | Compiles package unit tests from `packages/*/tests/**/*.test.ts` into the temporary root `.test-build/` directory before they are executed by Node.js. |

### Native ESM and Relative Imports

Adalov targets native Node.js ESM. The base TypeScript configuration uses:

```json
{
  "module": "NodeNext",
  "moduleResolution": "NodeNext",
  "rewriteRelativeImportExtensions": true
}
```

Relative source imports and exports should point to the real TypeScript source file explicitly:

```ts
import { Foo } from './foo.ts';
export * from './lib/logger/index.ts';
```

Extensionless directory imports should not be used:

```ts
// Avoid
export * from './lib/logger';
```

Native Node.js ESM does not rely on the implicit extension and directory `index` resolution historically associated with CommonJS. Explicit source specifiers keep the source graph unambiguous.

`rewriteRelativeImportExtensions` rewrites relative TypeScript extensions during emit. For example:

```ts
import { Foo } from './foo.ts';
```

is emitted as a runtime-compatible JavaScript import referencing:

```js
import { Foo } from './foo.js';
```

Cross-package imports are different: they should use the package public API rather than relative filesystem paths.

```ts
import { Logger } from '@adalov/common';
```

No bundler or TypeScript `paths` mapping is required for this model.

### Package Project References

A package without internal dependencies can use a minimal development config:

```json
{
  "extends": "../../tsconfig.package.json"
}
```

A package that depends on other Adalov packages must reference those projects explicitly. For example:

```json
{
  "extends": "../../tsconfig.package.json",
  "references": [
    {
      "path": "../common/tsconfig.json"
    },
    {
      "path": "../metadata/tsconfig.json"
    }
  ]
}
```

The corresponding build configuration must declare build references as well:

```json
{
  "extends": [
    "./tsconfig.json",
    "../../tsconfig.build.json"
  ],
  "references": [
    {
      "path": "../common/tsconfig.build.json"
    },
    {
      "path": "../metadata/tsconfig.build.json"
    }
  ]
}
```

TypeScript `references` are not inherited through `extends`, so both development and build graphs must be declared explicitly when a package has internal dependencies.

## Unit Testing

Adalov uses the native Node.js test stack rather than an external test framework:

- `node:test` provides the test runner and built-in mock/spy APIs;
- `node:assert/strict` provides assertions;
- TypeScript compiles test sources before execution.

Tests live under each package's existing `tests/` directory and use the `*.test.ts` suffix:

```text
packages/<package>/tests/**/*.test.ts
```

Unit tests should consume package public APIs when practical, for example:

```ts
import { Logger } from '@adalov/common';
```

Run the complete unit test workflow with:

```bash
npm test
```

The command performs the following steps:

```text
build framework packages
        ↓
compile *.test.ts with TypeScript
        ↓
.test-build/**/*.test.js
        ↓
node --test
```

The package build runs first so test compilation and runtime package imports resolve through the same workspace public APIs used during normal development. Test compiler output is temporary, ignored by Git, and removed by `npm run clear`.

Tests are intentionally compiled with the repository TypeScript compiler instead of relying on Node.js runtime type stripping. Runtime type stripping does not read `tsconfig.json`, and TypeScript syntax that requires transformation — including decorators — is not handled by the lightweight stripping path. Compiling first keeps unit tests compatible with the same TypeScript semantics as the framework itself.

The current Node.js minimum version already provides the stable test runner and function/method mocking APIs needed by this setup, so unit testing does not currently require increasing the Node.js baseline. Native test coverage remains intentionally deferred while the Node.js coverage interface is experimental.

## Repository Lifecycle Commands

Root npm scripts are the primary developer interface. Bash files under `scripts/` implement or orchestrate repository workflows behind those commands.

| Command | Purpose |
| --- | --- |
| `npm install` | Installs dependencies, refreshes workspace links, and updates `package-lock.json` when dependency metadata changes. |
| `npm ci` | Performs a clean dependency installation from the existing lockfile. Existing `node_modules` is removed automatically. |
| `npm run clear` | Removes generated package builds, TypeScript incremental state, Playground build state, unit test build state, and distribution artifacts. It does not remove dependencies or the lockfile. |
| `npm run build:dev` | Builds all framework packages through the development TypeScript project graph. |
| `npm run build` | Builds all framework packages through the stricter build project graph. |
| `npm run prepare:packages` | Clears previous generated outputs, performs a strict build, and prepares distribution artifacts under `dist/`. |
| `npm run playground` | Starts the local Playground development server, including TypeScript watch processes and Node.js watch mode. |
| `npm test` | Builds framework packages, compiles package unit tests, and executes the emitted tests with `node --test`. |
| `npm run validate:branch` | Validates the current branch name when run manually. The same validator is used by the `pre-push` hook. |
| `npm run commitlint -- <args>` | Runs the repository-local Commitlint configuration. |
| `npm run tsc -- <args>` | Runs the repository-local TypeScript compiler directly. |

The repository does not currently provide a command that removes `package-lock.json`. Lockfile regeneration should be an intentional dependency-management action rather than a side effect of normal cleanup.

The lower-level `playground:build`, `playground:watch`, and `playground:start` scripts support `npm run playground` and normally do not need to be invoked individually.

## Adding a New Package

Adding a package requires creating the workspace and registering it in the repository-wide package/build configuration.

### 1. Create the Package Scaffold

Create the following repository-level structure:

```text
packages/<package-name>/
├── lib/
├── tests/
├── README.md
├── index.ts
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

`index.ts` is the package public API boundary. Implementation files belong under `lib/`, while package tests belong under `tests/`. The internal shape of `lib/` is responsibility-driven and is not required to follow a universal file or directory template.

### 2. Create the Workspace Manifest

A library package starts with a source manifest similar to:

```json
{
  "name": "@adalov/<package-name>",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./build/index.d.ts",
      "import": "./build/index.js"
    }
  }
}
```

The source manifest is intentionally private and uses `0.0.0` as a placeholder. Publishable versions are generated later from the root `package.json`.

If the package depends on another Adalov workspace, declare the dependency using the same placeholder:

```json
{
  "dependencies": {
    "@adalov/common": "0.0.0"
  }
}
```

Package preparation rewrites internal Adalov dependency versions to the canonical root release version.

Packages may expose `exports`, `bin`, or both depending on their responsibility. Distribution transformation for executable `bin` entries should be kept aligned with the package preparation pipeline.

### 3. Configure TypeScript

Create `packages/<package-name>/tsconfig.json` extending the shared package config:

```json
{
  "extends": "../../tsconfig.package.json"
}
```

Add `references` for every internal Adalov dependency.

Create `packages/<package-name>/tsconfig.build.json`:

```json
{
  "extends": [
    "./tsconfig.json",
    "../../tsconfig.build.json"
  ]
}
```

If the package has internal dependencies, add matching references to each dependency's `tsconfig.build.json`.

The npm dependency graph and the TypeScript project-reference graph should describe the same internal package relationships.

### 4. Register the Package

Add the package directory name to `PACKAGES` in:

```text
scripts/shared/packages.sh
```

Add its development config to `tsconfig.packages.json`:

```json
{
  "path": "./packages/<package-name>/tsconfig.json"
}
```

Add its build config to `tsconfig.packages.build.json`:

```json
{
  "path": "./packages/<package-name>/tsconfig.build.json"
}
```

### 5. Register the Commit Scope

Commit scopes are intentionally closed. Add the new package name to `commitScopes` in:

```text
commitlint.config.mjs
```

This allows commits such as:

```text
feat(<package-name>): add initial implementation
```

See [Conventions](./conventions.md) for the repository commit and branch rules.

### 6. Update Root Documentation

Add the package to the `Packages` table in the root [`README.md`](../README.md) and link to its package README.

### 7. Refresh Workspace Metadata

Run:

```bash
npm install
```

This refreshes npm workspace links and updates `package-lock.json` when necessary.

### 8. Validate the Package

At minimum, run:

```bash
npm run build:dev
npm run build
npm test
npm run prepare:packages
```

Verify that the package produces local compiler output under:

```text
packages/<package-name>/build/
```

and a distribution artifact under:

```text
dist/<package-name>/
```

## Build and Distribution

Development builds produce compiler output inside each workspace:

```text
packages/<package>/build/
```

Strict builds use the same package-local output location but enable the stricter compiler rules from `tsconfig.build.json`.

`npm run prepare:packages` performs a clean build and creates distribution-ready artifacts under:

```text
dist/<package>/
```

The distribution manifest is generated rather than copied directly from the source workspace. This is where source-only metadata such as `private: true` and placeholder versions are replaced with publishable values.

Incremental TypeScript build state is stored under:

```text
packages/<package>/.tsbuildinfo/
```

Unit test compiler output is stored separately under:

```text
.test-build/
```

Both are ignored by Git and removed by `npm run clear` together with compiler and distribution outputs.

## More Documentation

- [Architecture](./architecture.md)
- [Repository Conventions](./conventions.md)
