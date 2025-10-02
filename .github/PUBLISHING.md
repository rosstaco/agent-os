# NPM Publishing Workflow

This document explains how to publish new versions of @rosstaco/agent-os to npm.

## Prerequisites

1. **NPM Token**: You need an npm authentication token with publish permissions
   - Log in to [npmjs.com](https://www.npmjs.com)
   - Go to Access Tokens in your account settings
   - Generate a new "Automation" token
   - Copy the token (it starts with `npm_`)

2. **GitHub Secret**: Add the npm token as a repository secret
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm token
   - Click "Add secret"

## Publishing a New Version

### Step 1: Update Version

Update the version in `package.json`:

```json
{
  "version": "1.0.1"
}
```

Follow [semantic versioning](https://semver.org/):
- **Patch** (1.0.x): Bug fixes and minor changes
- **Minor** (1.x.0): New features, backwards compatible
- **Major** (x.0.0): Breaking changes

### Step 2: Commit Changes

```bash
git add package.json
git commit -m "Bump version to 1.0.1"
git push origin feat/npm-installer
```

### Step 3: Trigger GitHub Action

1. Go to the [Actions tab](https://github.com/rosstaco/agent-os/actions)
2. Select "Publish to npm" workflow
3. Click "Run workflow"
4. Select the branch (usually `main`)
5. Leave version input empty to use package.json version
6. Click "Run workflow"

The workflow will:
- ✅ Run all tests
- ✅ Publish to npm registry
- ✅ Create a git tag (v1.0.1)
- ✅ Create a GitHub release

## Manual Publishing (Alternative)

If you need to publish manually:

```bash
# Login to npm (one time)
npm login

# Publish
npm publish --access public
```

## Verifying Publication

Check that the package was published:

```bash
# View package info
npm info @rosstaco/agent-os

# Test installation
npx @rosstaco/agent-os@latest init --help
```

## Troubleshooting

### "You must be logged in to publish packages"
- Ensure NPM_TOKEN secret is set correctly in GitHub
- Token must have "Automation" or "Publish" permissions

### "Version already exists"
- Update version number in package.json
- Cannot republish the same version

### "Tag already exists"
- The workflow checks for existing tags
- If tag exists, it will skip tag creation but still publish

## Version History

Check published versions at: https://www.npmjs.com/package/@rosstaco/agent-os
