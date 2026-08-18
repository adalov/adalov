# Adalov Playground

> [!WARNING]
> ☣️ **This is an MVP under active development. Anything may change at any time. We do not recommend using this framework in production-level projects.**

The Playground is a local development application used to exercise Adalov through its public package APIs.

It intentionally lives outside `packages/` because it is not a publishable framework package. It is registered as a private npm workspace only so local `@adalov/*` packages are linked through the repository workspace installation.

## Development

Install repository dependencies from the root:

```bash
npm install
```

Start the Playground development loop with:

```bash
npm run playground
```

The development loop builds the framework packages and Playground once, then keeps both TypeScript compilation layers in watch mode while Node.js watches the compiled Playground entrypoint and its imported modules.

This local workflow is intentionally separate from final package validation. Tests against packed `.tgz` artifacts or npm-published packages should be performed from an external consumer project.
