#!/bin/bash

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/shared/packages.sh"
source "$SCRIPT_DIR/shared/paths.sh"

# Clear Builds outputs
for package in "${PACKAGES[@]}"; do
  package_build_dir="$(BUILD_DIR "$package")"

  rm -rf "$package_build_dir"
done

# Clear Dist output
rm -rf "$DIST_DIR"
