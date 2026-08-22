#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/shared/packages.sh"
source "$SCRIPT_DIR/shared/paths.sh"

cd "$ROOT_DIR"

npm run build:dev

for package in "${PACKAGES[@]}"; do
  package_dir="$(PACKAGE_DIR "$package")"
  package_test_build_dir="$(TEST_BUILD_DIR "$package")"
  package_coverage_dir="$(COVERAGE_DIR "$package")"

  if [[ ! -d "$package_dir/tests" ]]; then
    continue
  fi

  test_source="$(find "$package_dir/tests" -type f -name '*.test.ts' -print -quit)"

  if [[ -z "$test_source" ]]; then
    continue
  fi

  rm -rf "$package_test_build_dir"
  rm -rf "$package_coverage_dir"

  npm run tsc -- --project "$package_dir/tsconfig.tests.json"
  mkdir -p "$package_coverage_dir"

  node --test \
    --experimental-test-coverage \
    --test-coverage-include="packages/$package/.build/**/*.js" \
    --test-reporter=spec \
    --test-reporter=lcov \
    --test-reporter-destination=stdout \
    --test-reporter-destination="$package_coverage_dir/lcov.info" \
    "packages/$package/.test-build/**/*.test.js"
done
