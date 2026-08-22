#!/bin/bash

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/shared/packages.sh"
source "$SCRIPT_DIR/shared/paths.sh"

# Clear package outputs
for package in "${PACKAGES[@]}"; do
  package_dir="$(PACKAGE_DIR "$package")"
  package_build_dir="$(BUILD_DIR "$package")"
  package_test_build_dir="$(TEST_BUILD_DIR "$package")"
  package_coverage_dir="$(COVERAGE_DIR "$package")"

  rm -rf "$package_build_dir"
  rm -rf "$package_test_build_dir"
  rm -rf "$package_coverage_dir"
  rm -rf "$package_dir/.tsbuildinfo"
done

# Clear Playground outputs
rm -rf "$PLAYGROUND_BUILD_DIR"
rm -rf "$PLAYGROUND_DIR/.tsbuildinfo"

# Clear distribution output
rm -rf "$DIST_DIR"
