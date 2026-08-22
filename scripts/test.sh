#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/shared/paths.sh"

cd "$ROOT_DIR"

rm -rf "$TEST_BUILD_DIR"

npm run build:dev
npm run tsc -- --project tsconfig.tests.json
node --test ".test-build/**/*.test.js"
