# GitHub Actions Setup Guide

This repository uses GitHub Actions for automated CI/CD, including NPM publishing and GitHub releases.

## Required Secrets

You need to set up the following secrets in your GitHub repository:

### 1. NPM_TOKEN

1. Go to [npmjs.com](https://npmjs.com) and log in
2. Click your profile → "Access Tokens"
3. Click "Generate New Token" → "Classic Token"
4. Select "Automation" (publish access)
5. Copy the token (starts with `npm_`)

**Add to GitHub:**
1. Go to your repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `NPM_TOKEN`
4. Value: Your NPM token

### 2. GITHUB_TOKEN

This is automatically provided by GitHub Actions - no setup needed.

## Workflows

### 🚀 Release Workflow (`.github/workflows/release.yml`)

**Manual Release:**
1. Go to Actions tab in your GitHub repo
2. Click "Release" workflow
3. Click "Run workflow"
4. Choose release type: patch/minor/major
5. Click "Run workflow"

**Manual Release Only:**
- All releases must be manually triggered via GitHub Actions
- No automatic releases on push

### 🧪 CI Workflow (`.github/workflows/ci.yml`)

**Runs on:**
- Every push to `main` or `develop`
- Every pull request to `main`

**Tests:**
- Cross-platform testing (Ubuntu, Windows, macOS)
- Multiple Node.js versions (16, 18, 20)
- Security audit
- CLI functionality tests

## Release Process

### Option 1: Manual GitHub Release
1. Go to GitHub repo → Actions → Release workflow
2. Run workflow with desired version type
3. GitHub Actions will:
   - Run tests
   - Update version in package.json
   - Create git tag
   - Create GitHub release
   - Publish to NPM

### Option 2: Local Release (if needed)
```bash
npm run release          # Interactive
npm run release:patch    # Patch version
npm run release:minor    # Minor version
npm run release:major    # Major version
```

## What Gets Published

- NPM package includes: `bin/`, `src/`, `index.js`, `index.d.ts`, `examples/`, `README.md`, `CHANGELOG.md`, `LICENSE`
- GitHub release includes: Source code + release notes
- CHANGELOG.md is automatically updated

## Troubleshooting

### NPM Token Issues
- Make sure token has "Automation" scope
- Token must not be expired
- Check token in npm with: `npm whoami`

### GitHub Token Issues
- GITHUB_TOKEN is automatic - no setup needed
- Check repository permissions if workflow fails

### Version Conflicts
- If version in package.json doesn't match NPM, release-it will warn
- Manually sync versions if needed: `npm version 1.x.x`