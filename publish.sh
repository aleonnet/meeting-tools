#!/bin/bash
set -e

# Meeting Tools — Script para publicar no GitHub
# Uso: ./publish.sh
# Requisitos: gh CLI autenticada, npm, node

PLUGIN_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_NAME="obsidian-meeting-tools"
GITHUB_USER="aleonnet"

cd "$PLUGIN_DIR"

# 1. Build
echo "Building plugin..."
npm run build

VERSION=$(node -e "console.log(require('./manifest.json').version)")
echo "Version: $VERSION"

# 2. Criar repo se não existe
if ! gh repo view "$GITHUB_USER/$REPO_NAME" &>/dev/null; then
  echo "Creating GitHub repo: $GITHUB_USER/$REPO_NAME"
  gh repo create "$REPO_NAME" --public --description "Obsidian plugin: complete meeting workflow with recording, transcription, AI summarization, task management, Kanban, Gantt"

  # Init git e push
  git init
  echo "node_modules/" > .gitignore
  echo "data.json" >> .gitignore
  git add .gitignore manifest.json main.js styles.css versions.json LICENSE README.md package.json package-lock.json tsconfig.json esbuild.config.mjs src/
  git commit -m "Initial release v$VERSION"
  git branch -M main
  git remote add origin "git@github.com:$GITHUB_USER/$REPO_NAME.git"
  git push -u origin main
else
  echo "Repo exists. Pushing changes..."
  git add .gitignore manifest.json main.js styles.css versions.json LICENSE README.md package.json package-lock.json tsconfig.json esbuild.config.mjs src/
  git commit -m "Release v$VERSION" || echo "Nothing to commit"
  git push
fi

# 3. Criar release com os arquivos que o Obsidian precisa
echo "Creating GitHub release v$VERSION..."
gh release create "$VERSION" \
  --repo "$GITHUB_USER/$REPO_NAME" \
  --title "v$VERSION" \
  --notes "Meeting Tools v$VERSION" \
  main.js manifest.json styles.css

echo ""
echo "✅ Release v$VERSION published!"
echo ""
echo "Para instalar via BRAT: $GITHUB_USER/$REPO_NAME"
echo "Para submeter ao diretório oficial:"
echo "  1. Fork https://github.com/obsidianmd/obsidian-releases"
echo "  2. Adicionar ao community-plugins.json:"
echo "     {\"id\": \"meeting-tools\", \"name\": \"Meeting Tools\", \"author\": \"Alessandro Barbosa\", \"description\": \"Complete meeting workflow...\", \"repo\": \"$GITHUB_USER/$REPO_NAME\"}"
echo "  3. Abrir PR"
