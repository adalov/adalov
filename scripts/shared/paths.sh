#!/bin/bash

readonly ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
readonly SCRIPTS_DIR="$ROOT_DIR/scripts"
readonly PACKAGES_DIR="$ROOT_DIR/packages"
readonly DIST_DIR="$ROOT_DIR/dist"

PACKAGE_DIR() {
  local package_name="$1"

  echo "$PACKAGES_DIR/$package_name"
}

BUILD_DIR() {
  local package_name="$1"

  echo "$(PACKAGE_DIR "$package_name")/build"
}
