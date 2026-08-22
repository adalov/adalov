#!/bin/bash

set -e

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/shared/packages.sh"
source "$SCRIPT_DIR/shared/paths.sh"

for package in "${PACKAGES[@]}"; do
  package_dir="$(PACKAGE_DIR "$package")"
  package_build_dir="$(BUILD_DIR "$package")"
  package_bin_dir="$package_dir/bin"

  if [ ! -d "$package_bin_dir" ]; then
    continue
  fi

  mkdir -p "$package_build_dir/bin"
  cp -R "$package_bin_dir/." "$package_build_dir/bin/"
done
