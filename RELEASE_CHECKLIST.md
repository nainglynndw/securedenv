# Release Checklist

## Pre-Release Setup (One-time)

### 1. NPM Token Setup
- [ ] Go to [npmjs.com](https://npmjs.com) → Profile → Access Tokens
- [ ] Generate "Automation" token (starts with `npm_`)
- [ ] Add to GitHub: Repo → Settings → Secrets → `NPM_TOKEN`

### 2. Repository Permissions
- [ ] Ensure you have admin access to the GitHub repository
- [ ] Verify GitHub Actions are enabled in repo settings

## Release Process

### Option A: GitHub Actions (Recommended)
1. [ ] Go to GitHub repo → Actions tab
2. [ ] Click "Release" workflow
3. [ ] Click "Run workflow"
4. [ ] Select version type: `patch` | `minor` | `major`
5. [ ] Click "Run workflow"
6. [ ] Wait for completion (creates GitHub release + NPM publish)

### Option B: Local Release
```bash
# Interactive release
npm run release

# Or specific version
npm run release:patch   # 1.1.0 → 1.1.1
npm run release:minor   # 1.1.0 → 1.2.0  
npm run release:major   # 1.1.0 → 2.0.0
```


## What Happens During Release

1. **Tests Run**: Cross-platform testing (Ubuntu, Windows, macOS)
2. **Version Bump**: Updates package.json version
3. **Changelog Update**: Updates CHANGELOG.md with new entries
4. **Git Tag**: Creates git tag (e.g., v1.1.0)
5. **GitHub Release**: Creates GitHub release with notes
6. **NPM Publish**: Publishes package to NPM registry

## Verification Steps

After release, verify:
- [ ] GitHub release created: `https://github.com/nainglynndw/securedenv/releases`
- [ ] NPM package updated: `https://www.npmjs.com/package/securedenv`
- [ ] Version numbers match across GitHub and NPM
- [ ] CHANGELOG.md updated with release notes

## Troubleshooting

**NPM Token Issues:**
- Token expired? Generate new one
- Wrong scope? Use "Automation" token
- Test locally: `npm whoami`

**Workflow Failures:**
- Check Actions tab for error details
- Verify NPM_TOKEN secret exists
- Ensure tests pass locally first

**Version Conflicts:**
- Current version: Check package.json
- NPM version: `npm view securedenv version`
- Manually sync if needed

## Current Status

**Latest Version**: `1.1.0`
**Features Ready**: ✅ GitHub cloud backup integration
**Tests Passing**: ✅ All tests green
**Ready to Release**: ✅ Yes

## Next Release Planning

**v1.1.1** (Patch):
- Bug fixes
- Documentation updates
- Security patches

**v1.2.0** (Minor):
- New features
- Non-breaking changes
- Additional cloud providers

**v2.0.0** (Major):
- Breaking changes
- Major architecture updates
- API changes