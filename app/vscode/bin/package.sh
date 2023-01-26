#!/bin/sh

echo "Cleaning dist folder..."
rm -rf dist

echo "Copying assets..."
cp -r asset dist

echo "Copying extension lib files..."
mkdir -p dist/extension/dist
cp dev/extension/dist/extension.js dist/extension/dist/extension.js

echo "Packaging extension..."
cd dist
pnpm vsce package --no-dependencies --no-rewrite-relative-links