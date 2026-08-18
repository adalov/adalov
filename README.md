# Adalov

[English](./README.md) | [Español](./README.es.md)

Adalov is a Node.js & TypeScript framework for building microservices-oriented applications, designed around a **zero external runtime dependencies** goal.

> [!WARNING]
> ☣️ **This is an MVP under active development. Anything may change at any time. We do not recommend using this framework in production-level projects.**

## Zero External Runtime Dependencies

Adalov aims to provide framework functionality using Node.js and its standard APIs without pulling third-party runtime dependencies into consumer applications.

Packages may depend on other `@adalov/*` packages, while development tooling such as TypeScript, testing, linting, and repository automation is intentionally outside this constraint.

## Why Adalov?

The name **Adalov** is derived from [Ada Lovelace](https://en.wikipedia.org/wiki/Ada_Lovelace), the 19th-century mathematician whose work on [Charles Babbage's Analytical Engine](https://en.wikipedia.org/wiki/Analytical_Engine) is widely recognized as one of the earliest expressions of computer programming.

The name is intended as a small tribute not only to Lovelace, but to the people who laid the foundations of computing long before the technologies we use today became possible. Adalov is built with the same perspective in mind: most of what feels new stands on decades — and sometimes centuries — of ideas, experimentation, and work that came before it.

[Learn more about Ada Lovelace](https://en.wikipedia.org/wiki/Ada_Lovelace)

## Requirements

- Node.js 22 or newer
- npm 10 or newer

## Getting Started

Install the repository dependencies from the project root:

```bash
npm install
```

This framework is organized as an npm Workspaces monorepo, and packages live under `packages/`.

## Packages

| Package | Description |
| --- | --- |
| [`@adalov/cli`](./packages/cli/README.md) | Command-line tools for Adalov. |
| [`@adalov/common`](./packages/common/README.md) | Shared utilities and common contracts. |
| [`@adalov/core`](./packages/core/README.md) | Core framework APIs and runtime primitives. |
| [`@adalov/http`](./packages/http/README.md) | HTTP-related framework APIs and integrations. |
| [`@adalov/metadata`](./packages/metadata/README.md) | Metadata-related framework primitives and utilities. |

## Development

TypeScript compiler output is generated locally under `packages/<package>/build/`.
Distribution-ready package artifacts are prepared separately under `dist/<package>/`.

### Available Commands

| Command | Description |
| --- | --- |
| `npm run build:dev` | Builds all packages using the development TypeScript configuration. |
| `npm run build` | Builds all packages using the stricter build configuration. |
| `npm run clear` | Removes generated package builds, TypeScript incremental build state, and distribution artifacts. |
| `npm run prepare:packages` | Performs a clean build and prepares distribution artifacts under `dist/`. |
| `npm run tsc -- <args>` | Runs the repository-local TypeScript compiler with the provided arguments. |
| `npm run commitlint -- <args>` | Runs Commitlint with the provided arguments. |
| `npm run validate:branch` | Validates the current branch name against the repository branch naming convention. |
| `npm run prepare` | Installs the repository Husky Git hooks. This is normally invoked automatically by npm. |

## Documentation

Technical documentation is being expanded as the framework evolves:

- [Architecture](./docs/architecture.md)
- [Development](./docs/development.md)
- [Repository Conventions](./docs/conventions.md)

## License

Adalov is released under the [MIT License](./LICENSE).

**[El gran ensayo de encontrar la eternidad](https://www.youtube.com/watch?v=uL-08eRgf94)**
