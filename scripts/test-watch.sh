#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/shared/packages.sh"
source "$SCRIPT_DIR/shared/paths.sh"

WATCH_PIDS=()
TEST_PACKAGES=()

cleanup() {
  local pid

  for pid in "${WATCH_PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done

  if [[ ${#WATCH_PIDS[@]} -gt 0 ]]; then
    wait "${WATCH_PIDS[@]}" 2>/dev/null || true
  fi
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

cd "$ROOT_DIR"

npm run build:dev

for package in "${PACKAGES[@]}"; do
  package_dir="$(PACKAGE_DIR "$package")"
  package_test_build_dir="$(TEST_BUILD_DIR "$package")"

  if [[ ! -d "$package_dir/tests" ]]; then
    continue
  fi

  test_source="$(find "$package_dir/tests" -type f -name '*.test.ts' -print -quit)"

  if [[ -z "$test_source" ]]; then
    continue
  fi

  rm -rf "$package_test_build_dir"
  npm run tsc -- --project "$package_dir/tsconfig.tests.json"
  TEST_PACKAGES+=("$package")
done

npm run build:dev -- --watch &
WATCH_PIDS+=("$!")

for package in "${TEST_PACKAGES[@]}"; do
  package_dir="$(PACKAGE_DIR "$package")"

  npm run tsc -- --project "$package_dir/tsconfig.tests.json" --watch &
  WATCH_PIDS+=("$!")
done

node --test --watch "packages/*/.test-build/**/*.test.js"
