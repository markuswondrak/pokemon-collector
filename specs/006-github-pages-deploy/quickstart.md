# Quickstart: GitHub Pages Deployment

**Feature**: GitHub Pages Deployment with Automatic Updates  
**Status**: Implementation Guide  
**Target Audience**: Developers and DevOps engineers

## Overview

This guide walks through the setup and verification of automatic GitHub Pages deployment for the Pokemon Collector application.

## Prerequisites

- Repository owner with admin access to `pokemon-collector` repository
- GitHub account with GitHub Pages enabled
- Local checkout of the `006-github-pages-deploy` branch
- `pnpm` v8+ and Node.js 18+ installed locally
- Familiarity with GitHub Actions and Vite configuration

## Quick Start: 5-Minute Setup

### Step 1: Configure Repository Settings (2 minutes)

1. Navigate to repository **Settings** → **Pages**
2. Under "Build and deployment":
   - Select **Source**: "GitHub Actions"
   - (The `gh-pages` branch will be auto-managed by the workflow)
3. Under "Custom domain": Leave empty (not in scope)
4. Under "HTTPS": Ensure enabled (GitHub Pages default)
5. Click **Save**

**Expected result**: GitHub Pages ready to receive deployments from GitHub Actions

### Step 2: Update Vite Configuration (1 minute)

1. Open `vite.config.js`
2. Add `base: '/pokemon-collector/'` to the Vite config export:

```javascript
export default {
  base: '/pokemon-collector/',
  // ... rest of configuration
}
```

3. Save the file

**Expected result**: Vite builds with correct asset paths for subdirectory deployment

### Step 3: Create GitHub Actions Workflow (2 minutes)

1. Create directory: `.github/workflows/` (if not exists)
2. Create file: `.github/workflows/deploy.yml`
3. Copy the workflow content from the implementation section below
4. Save the file

**Expected result**: Workflow file ready for commits to trigger deployments

### Step 4: Test Locally

```bash
# Install dependencies
pnpm install

# Build the application
pnpm build

# Run tests
pnpm test --run

# Verify build output
ls dist/
```

**Expected result**: Build completes in < 5 minutes, tests pass, artifacts in `dist/` directory

### Step 5: Verify Deployment

1. Commit and push changes to `main` branch:
```bash
git add .github/workflows/deploy.yml vite.config.js
git commit -m "feat: configure github pages automatic deployment"
git push origin 006-github-pages-deploy  # or merge to main
```

2. Navigate to repository **Actions** tab
3. Watch the deployment workflow run
4. After workflow completes, visit: `https://markuswondrak.github.io/pokemon-collector/`

**Expected result**: Application accessible at GitHub Pages URL, workflow shows success status

---

## Workflow Implementation

### GitHub Actions Workflow File: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  # Optional: Allow manual trigger
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Build application
        run: pnpm build

      - name: Run tests
        run: pnpm test --run --threads --maxThreads=4

      - name: Upload build artifacts
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Key Workflow Features

| Feature | Implementation | Purpose |
|---------|----------------|---------|
| **Trigger** | `push` on `main` branch | Auto-deploy on commits to main |
| **Build Job** | Checkout → Node.js setup → Install → Build → Test → Upload artifacts | Standard build pipeline |
| **Permissions** | `contents: read`, `pages: write`, `id-token: write` | Minimal permissions for deployment |
| **Concurrency** | Group by "pages", cancel-in-progress | Prevent concurrent deployments |
| **Node.js Version** | 18 (matches constitution) | Consistency with development environment |
| **Package Manager** | pnpm 8+ | Repository standard |
| **Test Configuration** | `--run --threads --maxThreads=4` | Follows constitution (4 worker threads, no watch mode) |
| **Artifacts** | Upload `dist/` directory | GitHub Pages receives built application |
| **Deployment Environment** | `github-pages` (deployment environment) | Modern GitHub approach, provides deployment status |

---

## Vite Configuration Update

### Before

```javascript
export default {
  // base path not set (defaults to '/')
  plugins: [react()],
  // ... rest
}
```

### After

```javascript
export default {
  base: '/pokemon-collector/',  // ← Add this line
  plugins: [react()],
  // ... rest
}
```

### What This Does

- Instructs Vite to prefix all asset paths with `/pokemon-collector/`
- Ensures CSS, JavaScript, and image imports work correctly when deployed to subdirectory
- Example: `<img src="logo.png" />` becomes `/pokemon-collector/logo.png` in HTML output

---

## Verification Checklist

### Local Development

- [ ] `pnpm install` completes successfully
- [ ] `pnpm build` completes in < 5 minutes
- [ ] `pnpm test --run` passes 100% of tests
- [ ] `dist/` directory exists with `index.html` and assets
- [ ] `vite.config.js` has `base: '/pokemon-collector/'`

### GitHub Configuration

- [ ] Repository Settings → Pages shows "GitHub Actions" as source
- [ ] `.github/workflows/deploy.yml` exists in repository
- [ ] Workflow file syntax is valid (GitHub Actions validates on commit)

### Deployment Verification

- [ ] Push to main branch triggers "Deploy to GitHub Pages" workflow
- [ ] Workflow runs "build" job and completes successfully
- [ ] Workflow runs "deploy" job and completes successfully
- [ ] GitHub Actions workflow tab shows green checkmark
- [ ] Application is accessible at `https://markuswondrak.github.io/pokemon-collector/`
- [ ] All application features function correctly on deployed site
- [ ] Images, styles, and scripts load without 404 errors

### Failure Scenarios (Test These)

- [ ] Intentionally break a test, push to main
  - Expected: Build succeeds, tests fail, workflow halts, deployment blocked
  - Deployed site remains unchanged (previous version still live)
  - Workflow tab shows red X
  
- [ ] Intentionally break the build (e.g., syntax error)
  - Expected: Build fails, workflow halts, no deployment
  - Workflow tab shows red X with error details

---

## Monitoring & Maintenance

### View Deployment History

1. Repository → **Actions** tab
2. Click on "Deploy to GitHub Pages" workflow
3. View list of all deployment attempts with:
   - Status (✅ success or ❌ failed)
   - Timestamp
   - Commit message and SHA
   - Duration

### Troubleshooting Deployment Failures

| Symptom | Common Cause | Resolution |
|---------|--------------|-----------|
| Build fails | Syntax error or missing dependency | Check build logs in Actions tab; fix and recommit |
| Tests fail | Breaking changes introduced | View test output; fix failing tests; recommit |
| Deployment fails | GitHub Pages misconfiguration | Verify Settings → Pages shows "GitHub Actions" source |
| App doesn't load | Incorrect `base` path in vite.config.js | Verify `base: '/pokemon-collector/'` is set |
| Assets 404 | Build produced empty `dist/` | Check build logs; verify no silent failures |
| Previous deployment stays live | Deployment blocked by failed tests | Intentional - protects live site from broken code |

### Enabling Email Notifications (Optional)

To receive email alerts on workflow failures:

1. GitHub Settings → **Notifications**
2. Enable "Email notifications" for "Workflow runs"
3. (Notifications will appear in GitHub Actions tab regardless)

---

## Next Steps After Deployment

### Once Deployment is Working

1. **Update documentation**: Add GitHub Pages URL to README.md
2. **Share the URL**: Developers and stakeholders can access live version
3. **Monitor deployments**: Check Actions tab after commits to main
4. **Performance testing**: Verify app performance on deployed version
5. **Feature iteration**: Continue normal development; deployments happen automatically

### Future Enhancements (Out of Scope for This Feature)

- Custom domain configuration
- Automated performance metrics collection
- Deployment status badge in README
- Automated deployment notifications via Slack/Discord
- Preview deployments for pull requests

---

## FAQ

**Q: What happens if I push a commit with failing tests?**  
A: The workflow runs the tests, they fail, and deployment is blocked. The previously deployed version remains live on GitHub Pages.

**Q: Can I manually trigger a deployment from a commit that didn't pass tests?**  
A: No - the workflow enforces the test gate. Tests must pass before deployment. (This is by design to protect the live site.)

**Q: What's the deployment SLA?**  
A: Target is 5 minutes from push to main to live deployment. Actual time depends on:
- Build time (typically < 2 minutes)
- Test time (varies with test suite size)
- GitHub Pages propagation (usually < 30 seconds)

**Q: Can I deploy to a different URL?**  
A: This feature deploys specifically to `https://markuswondrak.github.io/pokemon-collector/`. Custom domains are out of scope.

**Q: Where can I see deployment logs?**  
A: GitHub Actions workflow tab - click on the workflow run to see full logs for each step.

**Q: What if GitHub Pages has an outage?**  
A: Workflow will attempt deployment, but may fail. GitHub Pages status page shows current status. Manual retry available through workflow_dispatch once service recovers.

**Q: Can I deploy to multiple environments?**  
A: This feature deploys only to GitHub Pages. Additional environments (staging, production, etc.) are out of scope.

---

## Contact & Support

For issues with:
- **GitHub Actions workflow**: Check GitHub Actions documentation and workflow logs
- **Vite configuration**: Refer to Vite documentation
- **GitHub Pages setup**: Visit GitHub Pages help and settings
- **Test failures**: Review test output; refer to test framework documentation

---

**Document Version**: 1.0  
**Last Updated**: 4. December 2025  
**Status**: Ready for Implementation
