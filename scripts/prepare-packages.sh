#!/bin/bash

set -e

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/shared/packages.sh"
source "$SCRIPT_DIR/shared/paths.sh"

# Clear previous outputs
cd "$ROOT_DIR"
npm run clear

# Build packages
npm run build

# Create dist directory
mkdir -p "$DIST_DIR"

# Prepare packages
for package in "${PACKAGES[@]}"; do
  package_dir="$(PACKAGE_DIR "$package")"
  package_build_dir="$(BUILD_DIR "$package")"
  package_dist_dir="$DIST_DIR/$package"

  # Create package dist directory
  mkdir -p "$package_dist_dir"

  # Copy build output
  cp -R "$package_build_dir/." "$package_dist_dir/"

  # Copy README file
  cp "$package_dir/README.md" "$package_dist_dir/README.md"

  # Generate dist package.json file
  node "$SCRIPTS_DIR/prepare-package-json.js" \
    "$ROOT_DIR/package.json" \
    "$package_dir/package.json" \
    "$package_dist_dir/package.json" \
    "$package"

  # Copy Shared files
  cp "$ROOT_DIR/LICENSE" "$package_dist_dir/LICENSE"
done
