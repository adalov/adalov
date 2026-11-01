# Repository Conventions

> [!WARNING]
> ☣️ **This is an MVP under active development. Anything may change at any time. We do not recommend using this framework in production-level projects.**

This document describes the Git conventions currently enforced by the Adalov repository.

The goal is to keep branch names and commit history predictable enough to support future automation around releases, changelogs, and package-level changes.

**Adalov is still an MVP, so these decisions may evolve as the framework gains real implementations and usage.**

## Commit Messages

Adalov uses Conventional Commits through Commitlint.

Every commit must use the following structure:

```text
<type>(<scope>): <description>
```

The scope is required.

Example:

```text
feat(core): add application bootstrapper
```

### Allowed Commit Types

| Type | Intended Use |
| --- | --- |
| `build` | Changes to the build system or build-related configuration |
| `chore` | Repository maintenance that does not fit another type |
| `ci` | Continuous Integration configuration and automation |
| `docs` | Documentation-only changes |
| `feat` | New functionality |
| `fix` | Bug fixes |

### Allowed Commit Scopes

The current allowed scopes are:

```text
cli
common
core
http
metadata
repo
```

Package scopes represent changes owned by a specific Adalov package. Use `repo` for repository-wide tooling, configuration, documentation, or other changes that do not belong to a single package.

Scopes must be lower-case.

When a new package is added, its package name must also be added to `commitScopes` in `commitlint.config.mjs`. See [Adding a New Package](./development.md#adding-a-new-package).

### Breaking Changes

A breaking change is marked by placing `!` immediately after the type/scope portion of the commit header:

```text
feat(core)!: replace application bootstrap API
```

The marker is not limited to `feat` or to any particular package scope. Use it whenever a change is intentionally incompatible with the previous public contract, for example:

```text
fix(http)!: change request handler contract
chore(repo)!: change repository configuration contract
```

For now, the `!` header marker is the only breaking-change form documented by Adalov. Do not add a `BREAKING CHANGE:` footer as a second repository convention. Release and versioning automation may build on the `!` marker in the future.

### Valid and Invalid Examples

Valid commit messages:

```text
feat(core): add application bootstrapper
fix(http): handle empty request bodies
chore(repo): update development scripts
feat(common)!: change logger output contract
```

Invalid commit messages:

```text
feature(core): add application bootstrapper
feat: add application bootstrapper
feat(Core): add application bootstrapper
feat(unknown): add application bootstrapper
```

The examples above are invalid because the type is not allowed, the scope is missing, the scope casing is invalid, or the scope is not registered.

### Additional Commit Rules

The current Commitlint configuration also enforces:

- a maximum header length of 100 characters;
- a blank line before a commit body;
- a blank line before commit footers.

The exact source of truth is [`commitlint.config.mjs`](../commitlint.config.mjs).

## Branch Names

Feature branches must follow:

```text
<type>/<kebab-case-description>
```

The allowed branch types are read directly from the Commitlint `type-enum` rule, keeping branch and commit types aligned.

Valid examples:

```text
chore/initial-setup
feat/http-router
fix/core-bootstrap
```

Invalid examples:

```text
feature/http-router
feat/HTTP-router
feat/http_router
feat/http/router
```

Descriptions must contain lower-case alphanumeric words separated by hyphens.

Permanent branches are defined centrally in [`scripts/shared/branches.sh`](../scripts/shared/branches.sh) and are exempt from this rule. The only permanent branch is `main`. Feature and maintenance branches are created from `main` and proposed back to `main` through pull requests. There is no permanent `develop` branch.

The validation implementation lives in [`scripts/validate-branch-name.sh`](../scripts/validate-branch-name.sh). During `pre-push`, validation is applied to the remote branch ref that will exist in the repository, rather than only to the local branch name.

Run the validation manually with:

```bash
npm run validate:branch
```

## Pull Request Validation

Pull requests targeting `main` are validated by [GitHub Actions](../.github/workflows/ci.yml). The CI workflow runs when a pull request is opened, updated with new commits, reopened, or its metadata is edited.

The workflow performs the following checks:

1. Installs dependencies with `npm ci`.
2. Validates the source branch name using `npm run validate:branch`.
3. Validates the pull request title through `npm run validate:pr-name`, using the same Commitlint conventions as commit messages.
4. Validates every commit in the pull request using Commitlint.
5. Runs `npm run lint`, `npm run build`, and `npm test`.

CI checks complement the local Git hooks, which can be bypassed or unavailable in some environments. A successful workflow does not replace the repository's required review and merge process.

## Git Hooks

The repository uses Husky for local Git hooks.

| Hook | Path | Description |
| --- | --- | --- |
| `commit-msg` | `.husky/commit-msg` | Runs Commitlint against the commit message being created. Invalid commit types, scopes, formatting, or other configured Commitlint rules prevent the commit from completing. |
| `pre-push` | `.husky/pre-push` | Validates branch names before they are pushed. Branch validation checks pushed remote branch refs when available and falls back to the current branch when needed. |

Husky hooks are installed through the root npm `prepare` lifecycle script, which normally runs automatically after `npm install`.

## Manual Validation

Commitlint can be invoked directly through the root npm script:

```bash
npm run commitlint -- <args>
```

Branch validation can be invoked with:

```bash
npm run validate:branch
```

These commands use the same configuration as the Git hooks and should be preferred over duplicating validation rules elsewhere.

## More Documentation

- [Architecture](./architecture.md)
- [Development](./development.md)
