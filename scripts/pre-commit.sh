#!/bin/bash
set -e

# Get staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR)

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

# Filter JS/TS files
JSTS_FILES=$(echo "$STAGED_FILES" | grep -E '\.(js|jsx|ts|tsx)$' || true)

# Filter JSON/MD/CSS files (excluding package-lock.json)
OTHER_FILES=$(echo "$STAGED_FILES" | grep -E '\.(json|md|css)$' | grep -v 'package-lock\.json' || true)

if [ -n "$JSTS_FILES" ]; then
  echo "Running lint and prettier on JS/TS files..."
  # Run next lint on specific files is tricky with next lint, so we run it on the whole project or use --file
  # For efficiency, we'll try to use --file for each
  for file in $JSTS_FILES; do
    echo "Linting $file..."
    npx next lint --fix --file "$file"
    npx prettier --write "$file"
    git add "$file"
  done
fi

if [ -n "$OTHER_FILES" ]; then
  echo "Running prettier on other files..."
  for file in $OTHER_FILES; do
    echo "Formatting $file..."
    npx prettier --write "$file"
    git add "$file"
  done
fi
