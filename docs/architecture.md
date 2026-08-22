# Architecture

> [!WARNING]
> ☣️ **This is an MVP under active development. Anything may change at any time. We do not recommend using this framework in production-level projects.**

This document describes the current architectural direction of Adalov and the repository structure that supports it.

**Adalov is still an MVP, so these decisions may evolve as the framework gains real implementations and usage.**

## Architectural Principles

### Zero External Runtime Dependencies

A primary goal of Adalov is to provide framework functionality without introducing third-party runtime dependencies.

The framework should rely on Node.js and its standard APIs whenever practical; and packages may depend on other `@adalov/*` packages, but published framework packages are intended not to pull external runtime dependencies into consumer applications.

Development tooling is intentionally excluded from this constraint. TypeScript, Commitlint, Husky, testing tools, linters, and similar packages may be used as development dependencies when they improve the repository workflow or code quality.

### Explicit Responsibilities and Boundaries

Each package owns a clearly defined responsibility. Package responsibilities should be determined by the concepts and domains they represent rather than by how many other packages happen to reuse a piece of code.

Dependencies between packages should preserve those responsibilities and remain directional. Shared usage alone should not be treated as sufficient reason to move an abstraction into a more generic package.

Public contracts and implementation details should remain clearly separated so packages can evolve internally without creating accidental cross-package coupling.

### Standardize Contracts, Not Shapes

Adalov standardizes contracts, boundaries, and externally observable conventions rather than imposing a predefined internal structure on packages or modules.

Code structure should emerge from actual responsibilities. A module may consist of a single file or multiple cooperating files depending on its complexity, and different modules are not expected to share the same filesystem shape.

Internal structure should be descriptive rather than predictive. Files and directories should be introduced to represent responsibilities that already exist, not to anticipate hypothetical future complexity.

Files or directories such as `types`, `constants`, `utils`, or `interfaces` are organizational tools, not required structural slots.

Conventions should instead focus on naming, public APIs and exports, visibility, dependency boundaries, and package responsibilities.

**Structure follows responsibilities. Standardize contracts, not shapes.**

### Native Tooling First

The repository favors native Node.js, npm Workspaces, and TypeScript capabilities before introducing additional build or monorepo tooling.

Published framework packages target native Node.js ESM. A bundler is not required as part of the framework build or runtime model.

### Evolutionary Package Architecture

Packages currently live in a single npm Workspaces monorepo and are released using a shared version. Boundaries are intentionally kept independent enough to allow separate versioning or repository extraction in the future if the project requires it.

The architecture should solve current requirements without introducing structural complexity only for hypothetical future needs.

## Packages

| Package | Responsibility | Internal Dependencies |
| --- | --- | --- |
| [`@adalov/cli`](../packages/cli/README.md) | Command-line tooling for Adalov. | `@adalov/common` |
| [`@adalov/common`](../packages/common/README.md) | Shared utilities, types, constants, and common contracts. | -- |
| [`@adalov/core`](../packages/core/README.md) | Core framework orchestration and high-level runtime primitives. | `@adalov/common`, `@adalov/metadata` |
| [`@adalov/http`](../packages/http/README.md) | HTTP-specific framework functionality and integrations. | `@adalov/common`, `@adalov/core`, `@adalov/metadata` |
| [`@adalov/metadata`](../packages/metadata/README.md) | Shared metadata definitions and related primitives. | -- |

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

## Package Architecture

### Package Root Structure

A source package follows this general repository-level structure:

```text
packages/<package>/
├── lib/
├── tests/
├── README.md
├── index.ts
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── tsconfig.tests.json
```

This structure defines the integration points between a package and the repository, build, test, and distribution workflows. It does not prescribe the internal structure of `lib/` or `tests/`.

### Public API and Boundaries

Each package exposes its public API through its root `index.ts` entry point. Implementation details live under `lib/` and should not be consumed directly from another package.

Cross-package imports should use the package name, for example:

```ts
import { Logger } from '@adalov/common';
```

Imports into another package's internal `lib/` structure should not be used as part of the framework architecture.

This boundary allows a package to reorganize its internal implementation without turning its filesystem layout into an implicit public contract.

### Internal Organization

There is no predefined internal directory or file structure that every package or module must follow.

A module should remain as small as its responsibilities allow. When multiple responsibilities become independently meaningful, its structure may be split into additional files or directories. When that separation provides no meaningful boundary, additional structure should not be introduced only for consistency with other modules.

Different modules may therefore have intentionally different shapes. One may be represented by a single file, while another may contain its own implementation, types, constants, or supporting utilities.

Internal naming and grouping should describe what the code represents. Generic organizational buckets should be introduced only when they make an existing responsibility clearer.

## Workspace and Distribution Manifests

Source package manifests are workspace manifests rather than publishable artifacts. They use the following repository conventions:

- `private: true` prevents accidental publication of source workspaces.
- `version: 0.0.0` is a development placeholder.
- internal `@adalov/*` dependencies use the `0.0.0` placeholder.
- packages use ESM with `type: module`.

The root `package.json` owns the canonical Adalov version. During package preparation, publishable manifests are generated under `.dist/<package>/` using that root version. Internal `@adalov/*` dependencies are rewritten to the same exact release version.

This currently gives Adalov lockstep releases while keeping each package structurally independent.

## Build and Distribution Layers

Compilation and distribution are separate concerns.

```text
packages/<package>/ source
        │
        │ TypeScript build
        ▼
packages/<package>/.build/
        │
        │ package preparation
        ▼
.dist/<package>/
        │
        │ npm pack / publish
        ▼
consumer
```

`packages/<package>/.build/` contains local TypeScript compiler output used by the workspace during development.

`.dist/<package>/` contains the prepared publishable artifact. The preparation step copies only the required compiled output and package files, and generates the distribution `package.json`.

Generated compiler, test, and distribution directories use dot-prefixed names because they are repository-private outputs rather than source structure.

TypeScript incremental state is stored separately under `packages/<package>/.tsbuildinfo/` and is never part of a distribution artifact.

For development workflows and TypeScript configuration details, see [Development](./development.md).

## More Documentation

- [Development](./development.md)
- [Repository Conventions](./conventions.md)
