#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/shared/paths.sh"

WATCH_PIDS=()

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
npm run playground:build

npm run build:dev -- --watch &
WATCH_PIDS+=("$!")

npm run playground:watch &
WATCH_PIDS+=("$!")

npm run playground:start
