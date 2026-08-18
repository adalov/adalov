# Development

> [!WARNING]
> ☣️ **This is an MVP under active development. Anything may change at any time. We do not recommend using this framework in production-level projects.**

This document describes how the Adalov monorepo is organized for local development and how to add new framework packages.

**Adalov is still an MVP, so these decisions may evolve as the framework gains real implementations and usage.**

## Requirements

- Node.js 22 or newer
- npm 10 or newer

Install dependencies from the repository root:

```bash
npm install
```

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
├── scripts/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── tsconfig.package.json
├── tsconfig.packages.json
└── tsconfig.packages.build.json
```

Each framework package is an npm workspace under `packages/`.

## TypeScript Configuration

TypeScript configuration is split by responsibility instead of duplicating compiler options in every package.

| Configuration | Responsibility |
| --- | --- |
| `tsconfig.json` | Repository-wide base configuration. Defines the common compiler behavior shared by development and build configurations, including strict type checking, ESM/NodeNext resolution, declarations, decorators, and composite project support. |
| `tsconfig.build.json` | Extends the base configuration with stricter build-only checks and defines the build-specific TypeScript incremental state location. |
| `tsconfig.package.json` | Defines the common source layout for every package: package root as `rootDir`, `build/` as compiler output, `.tsbuildinfo/dev.tsbuildinfo` as development incremental state, and `index.ts` plus `lib/**/*.ts` as package sources. Individual package `tsconfig.json` files extend this configuration and normally contain only package-specific project references. |
| `tsconfig.packages.json` | Development project graph. References the development `tsconfig.json` of every package and is used by `npm run build:dev`. |
| `tsconfig.packages.build.json` | Strict build project graph. References the `tsconfig.build.json` of every package and is used by `npm run build`. |

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

## Adding a New Package

Adding a package requires creating the workspace and registering it in the repository-wide package/build configuration.

### 1. Create the Package Scaffold

Create the following structure:

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

`index.ts` is the package public API boundary. Implementation files belong under `lib/`, while package tests belong under `tests/`.

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

This refreshes npm workspace links and updates `package-lock.json`.

### 8. Validate the Package

At minimum, run:

```bash
npm run build:dev
npm run build
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

It is ignored by Git and removed by `npm run clear` together with compiler and distribution outputs.

## More Documentation

- [Architecture](./architecture.md)
- [Repository Conventions](./conventions.md)
