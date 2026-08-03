#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Sync this fork's main branch with upstream/main.

Usage:
  scripts/sync-upstream.sh [--rebase-personal]

Options:
  --rebase-personal  After syncing main, rebase the personal branch onto main
                     and push it to origin.
  -h, --help         Show this help message.

Requires a git remote named "upstream" pointing at the source repository:
  git remote add upstream https://github.com/yoshiko-pg/difit.git
EOF
}

rebase_personal=false

for arg in "$@"; do
  case "$arg" in
    --rebase-personal)
      rebase_personal=true
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      echo "error: unknown option: $arg" >&2
      usage >&2
      exit 1
      ;;
  esac
done

cd "$(git rev-parse --show-toplevel)"

if ! git remote get-url upstream >/dev/null 2>&1; then
  echo "error: upstream remote is not configured" >&2
  echo '  git remote add upstream https://github.com/yoshiko-pg/difit.git' >&2
  exit 1
fi

current_branch=$(git branch --show-current)

echo "Fetching upstream and origin..."
git fetch upstream
git fetch origin

echo "Syncing main with upstream/main..."
git switch main
before=$(git rev-parse HEAD)
git reset --hard upstream/main
after=$(git rev-parse HEAD)

if [[ "$before" == "$after" ]]; then
  echo "main is already up to date with upstream/main ($after)"
else
  echo "main updated: $before -> $after"
fi

echo "Pushing main to origin..."
git push --force-with-lease origin main

if [[ "$rebase_personal" == true ]]; then
  if ! git show-ref --verify --quiet refs/heads/personal; then
    echo "error: --rebase-personal requires a local personal branch" >&2
    exit 1
  fi

  echo "Rebasing personal onto main..."
  git switch personal
  git rebase main
  echo "Pushing personal to origin..."
  git push --force-with-lease origin personal
fi

if [[ -n "$current_branch" && "$current_branch" != "$(git branch --show-current)" ]]; then
  echo "Returning to $current_branch..."
  git switch "$current_branch"
fi

echo "Done."
