#!/bin/bash
set -euo pipefail

# Only run in remote Claude Code on the web sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Install dependencies based on what's present in the repo

if [ -f "$CLAUDE_PROJECT_DIR/package.json" ]; then
  echo "Installing Node.js dependencies..."
  cd "$CLAUDE_PROJECT_DIR"
  npm install
fi

if [ -f "$CLAUDE_PROJECT_DIR/requirements.txt" ]; then
  echo "Installing Python dependencies..."
  pip install -r "$CLAUDE_PROJECT_DIR/requirements.txt"
fi

if [ -f "$CLAUDE_PROJECT_DIR/pyproject.toml" ]; then
  echo "Installing Python project dependencies..."
  cd "$CLAUDE_PROJECT_DIR"
  pip install -e ".[dev]" 2>/dev/null || pip install -e . 2>/dev/null || true
fi

if [ -f "$CLAUDE_PROJECT_DIR/Gemfile" ]; then
  echo "Installing Ruby gems..."
  cd "$CLAUDE_PROJECT_DIR"
  bundle install
fi

if [ -f "$CLAUDE_PROJECT_DIR/go.mod" ]; then
  echo "Installing Go dependencies..."
  cd "$CLAUDE_PROJECT_DIR"
  go mod download
fi

if [ -f "$CLAUDE_PROJECT_DIR/Cargo.toml" ]; then
  echo "Fetching Rust dependencies..."
  cd "$CLAUDE_PROJECT_DIR"
  cargo fetch
fi

echo "Session setup complete."
