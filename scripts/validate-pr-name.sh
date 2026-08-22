#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/shared/paths.sh"

readonly COMMITLINT_BIN="$ROOT_DIR/node_modules/.bin/commitlint"
readonly COMMITLINT_CONFIG="$ROOT_DIR/commitlint.config.mjs"

if [[ "$#" -ne 1 || -z "$1" ]]; then
  echo 'Usage: validate-pr-name.sh "<pull-request-name>"' >&2
  exit 1
fi

readonly PR_NAME="$1"

if [[ ! -x "$COMMITLINT_BIN" ]]; then
  echo 'Commitlint is not installed. Run npm install first.' >&2
  exit 1
fi

printf '%s\n' "$PR_NAME" | "$COMMITLINT_BIN" --config "$COMMITLINT_CONFIG"
