#!/bin/bash
# Howdy Nashville deploy script.
# Pushes local changes to GitHub, which triggers Vercel auto-deploy.
# Usage: ./deploy.sh "optional commit message"

set -e

PROJECT_DIR="/Users/dan/Documents/howdy-nashville"
REPO_URL="https://github.com/dcdcairbnb/howdynash.git"
BRANCH="main"

cd "$PROJECT_DIR"

# First-time setup if .git doesn't exist
if [ ! -d ".git" ]; then
  echo "First-time setup: initializing git repository..."
  git init
  git remote add origin "$REPO_URL"
  git branch -M "$BRANCH"
  echo "Staging local files first..."
  git add -A
  git commit -m "Initial local state" --allow-empty
  echo "Merging with GitHub history (keeping local versions on conflict)..."
  git pull origin "$BRANCH" --allow-unrelated-histories --strategy-option=ours --no-rebase || {
    echo ""
    echo "Pull failed. You may need to authenticate first."
    echo "Run: gh auth login"
    exit 1
  }
fi

# Make sure remote is correct
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [ "$CURRENT_REMOTE" != "$REPO_URL" ]; then
  echo "Setting remote to $REPO_URL"
  git remote remove origin 2>/dev/null || true
  git remote add origin "$REPO_URL"
fi

# Pull latest first to avoid conflicts
echo "Pulling latest from GitHub..."
git pull origin "$BRANCH" --no-rebase || {
  echo "Pull failed. Resolve conflicts or check authentication."
  exit 1
}

# Stage all changes
git add -A

# Check if there's anything to commit
if git diff --cached --quiet; then
  echo "No changes to deploy."
  exit 0
fi

# Build commit message
if [ -n "$1" ]; then
  COMMIT_MSG="$1"
else
  CHANGED=$(git diff --cached --name-only | head -3 | tr '\n' ', ' | sed 's/,$//')
  COMMIT_MSG="Update: $CHANGED ($(date '+%Y-%m-%d %H:%M'))"
fi

echo "Committing: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

echo "Pushing to GitHub..."
git push origin "$BRANCH"

echo ""
echo "Deploy initiated."
echo "Vercel will auto-deploy in 30 to 90 seconds."
echo "Live URL: https://howdynash.com"
echo ""
echo "Watch the deployment at:"
echo "  https://vercel.com/dashboard"
