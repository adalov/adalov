#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/shared/branches.sh"
source "$SCRIPT_DIR/shared/paths.sh"

readonly COMMITLINT_CONFIG="$ROOT_DIR/commitlint.config.mjs"

readonly VALID_TYPES="$(
  node --input-type=module - "$COMMITLINT_CONFIG" <<'NODE'
import { pathToFileURL } from 'node:url';

const configPath = process.argv[2];
const { default: config } = await import(pathToFileURL(configPath).href);
const typeRule = config.rules?.['type-enum'];
const types = typeRule?.[2];

if (!Array.isArray(types) || types.length === 0) {
  console.error('Unable to read commit types from commitlint configuration.');
  process.exit(1);
}

process.stdout.write(types.join('|'));
NODE
)"

is_permanent_branch() {
  local branch_name="$1"
  local permanent_branch

  for permanent_branch in "${PERMANENT_BRANCHES[@]}"; do
    if [[ "$branch_name" == "$permanent_branch" ]]; then
      return 0
    fi
  done

  return 1
}

validate_branch_name() {
  local branch_name="$1"
  local branch_pattern="^(${VALID_TYPES})/[a-z0-9]+(-[a-z0-9]+)*$"

  if is_permanent_branch "$branch_name"; then
    return 0
  fi

  if [[ "$branch_name" =~ $branch_pattern ]]; then
    return 0
  fi

  echo "Invalid branch name: $branch_name" >&2
  echo "Expected: <type>/<kebab-case-description>" >&2
  echo "Allowed types: ${VALID_TYPES//|/, }" >&2
  echo "Permanent branches: ${PERMANENT_BRANCHES[*]}" >&2
  return 1
}

validate_current_branch() {
  local current_branch
  current_branch="$(git branch --show-current)"

  if [[ -z "$current_branch" ]]; then
    echo 'Unable to determine the current branch.' >&2
    return 1
  fi

  validate_branch_name "$current_branch"
}

if [[ -t 0 ]]; then
  validate_current_branch
  exit 0
fi

validated_branch=false

while read -r local_ref _ remote_ref _; do
  if [[ "$local_ref" != refs/heads/* ]]; then
    continue
  fi

  branch_name="${local_ref#refs/heads/}"
  validate_branch_name "$branch_name"
  validated_branch=true
done

if [[ "$validated_branch" == false ]]; then
  validate_current_branch
fi
