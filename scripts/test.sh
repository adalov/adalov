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
  test_source="$(find "$package_dir/tests" -type f -name '*.test.ts' -print -quit)"

  if [[ -z "$test_source" ]]; then
    continue
  fi

  rm -rf "$package_test_build_dir"

  npm run tsc -- --project "$package_dir/tsconfig.tests.json"

  test_files=()
  while IFS= read -r -d '' test_file; do
    test_files+=("$test_file")
  done < <(find "$package_test_build_dir" -type f -name '*.test.js' -print0)

  node --test "${test_files[@]}"
done
