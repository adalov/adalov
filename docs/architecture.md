# Architecture

This document describes the current architectural direction of Adalov and the repository structure that supports it.

Adalov is still an MVP, so these decisions may evolve as the framework gains real implementations and usage.

## Design Goals

### Zero External Runtime Dependencies

A primary goal of Adalov is to provide framework functionality without introducing third-party runtime dependencies.

The framework should rely on Node.js and its standard APIs whenever practical. Adalov packages may depend on other `@adalov/*` packages, but published framework packages are intended not to pull external runtime dependencies into consumer applications.

Development tooling is intentionally excluded from this constraint. TypeScript, Commitlint, Husky, testing tools, linters, and similar packages may be used as development dependencies when they improve the repository workflow or code quality.

### Explicit Package Boundaries

Each package owns a clearly defined responsibility and exposes its public API through its root `index.ts` entry point. Implementation details live under `lib/` and should not be consumed directly from another package.

### Native Tooling First

The repository favors native Node.js, npm Workspaces, and TypeScript capabilities before introducing additional build or monorepo tooling.

### Scalable Monorepo Structure

Packages currently live in a single npm Workspaces monorepo and are released using a shared version. Package boundaries are intentionally kept independent enough to allow separate versioning or repository extraction in the future if the project requires it.

## Packages

| Package | Responsibility | Internal Dependencies |
| --- | --- | --- |
| [`@adalov/cli`](../packages/cli/README.md) | Command-line tooling for Adalov. | `@adalov/common` |
| [`@adalov/common`](../packages/common/README.md) | Shared utilities, types, constants, and common contracts. | None |
| [`@adalov/core`](../packages/core/README.md) | Core framework orchestration and high-level runtime primitives. | `@adalov/common`, `@adalov/metadata` |
| [`@adalov/http`](../packages/http/README.md) | HTTP-specific framework functionality and integrations. | `@adalov/common`, `@adalov/core`, `@adalov/metadata` |
| [`@adalov/metadata`](../packages/metadata/README.md) | Shared metadata definitions and related primitives. | None |

The current dependency graph is intentionally one-directional:

```text
cli
└──> common

core
├──> common
└──> metadata

http
├──> common
├──> core
└──> metadata
```

`core` does not depend on protocol-specific packages such as `http`. Protocol packages build on top of the core abstractions instead.

## Package Boundaries

A source package follows this general structure:

```text
packages/<package>/
├── lib/
├── tests/
├── README.md
├── index.ts
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

`index.ts` defines the package public API. Cross-package imports should use the package name, for example:

```ts
import { something } from '@adalov/common';
```

Imports into another package's internal `lib/` structure should not be used as part of the framework architecture.

## Workspace and Distribution Manifests

Source package manifests are workspace manifests rather than publishable artifacts. They use the following repository conventions:

- `private: true` prevents accidental publication of source workspaces.
- `version: 0.0.0` is a development placeholder.
- internal `@adalov/*` dependencies use the `0.0.0` placeholder.
- packages use ESM with `type: module`.

The root `package.json` owns the canonical Adalov version. During package preparation, publishable manifests are generated under `dist/<package>/` using that root version. Internal `@adalov/*` dependencies are rewritten to the same exact release version.

This currently gives Adalov lockstep releases while keeping each package structurally independent.

## Build and Distribution Layers

Compilation and distribution are separate concerns.

```text
packages/<package>/ source
        │
        │ TypeScript build
        ▼
packages/<package>/build/
        │
        │ package preparation
        ▼
dist/<package>/
        │
        │ npm pack / publish
        ▼
consumer
```

`packages/<package>/build/` contains local TypeScript compiler output used by the workspace during development.

`dist/<package>/` contains the prepared publishable artifact. The preparation step copies only the required compiled output and package files, and generates the distribution `package.json`.

TypeScript incremental state is stored separately under `packages/<package>/.tsbuildinfo/` and is never part of a distribution artifact.

For development workflows and TypeScript configuration details, see [Development](./development.md).
