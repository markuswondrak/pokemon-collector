# Data Model: GitHub Pages Deployment

**Feature**: GitHub Pages Deployment with Automatic Updates  
**Date**: 4. December 2025  
**Scope**: Infrastructure/DevOps (no application data model changes)

## Overview

This feature is a DevOps/infrastructure implementation that does not introduce new persistent data structures or application entities. Instead, it defines configuration and workflow entities that orchestrate the build and deployment process.

## Configuration Entities

### 1. Deployment Workflow Configuration

**Entity**: `DeploymentWorkflow`  
**Purpose**: GitHub Actions workflow that automates the build, test, and deployment process

**Properties**:
- `workflow_name`: "Deploy to GitHub Pages" (string)
- `trigger`: `push` on branch `main` (GitHub Actions trigger)
- `build_command`: `pnpm build` (string)
- `test_command`: `pnpm test --run` (string)
- `artifact_path`: `dist/` (directory path)
- `deployment_environment`: "github-pages" (GitHub deployment environment)
- `target_url`: `https://markuswondrak.github.io/pokemon-collector/` (string)

**Validation Rules**:
- Workflow must execute build before test before deployment
- Workflow must only deploy if build AND tests both pass
- GITHUB_TOKEN must be used for authentication (GitHub-managed secret)
- No credentials, secrets, or sensitive data in workflow YAML or logs

**State Transitions**:
```
[Trigger: push to main]
    ↓
[Build] → Success → [Test]  
    ↓
    → Failure → [Notify Developer, Block Deployment]
    
[Test] → Success → [Deploy to GitHub Pages]
    ↓
    → Failure → [Notify Developer, Block Deployment]
    
[Deploy] → Success → [Update live site, Log deployment history]
    ↓
    → Failure → [Preserve previous deployment, Log error]
```

---

### 2. Build Configuration

**Entity**: `BuildConfiguration`  
**Purpose**: Vite build settings for GitHub Pages subdirectory deployment

**Properties**:
- `build_tool`: "Vite 7+" (framework)
- `base_path`: "/pokemon-collector/" (string - must match GitHub Pages subdirectory)
- `output_directory`: "dist/" (directory)
- `entry_point`: "src/main.tsx" (file path)
- `target_environment`: "production" (enum: development, staging, production)
- `minify_enabled`: true (boolean)
- `source_maps_enabled`: true (boolean - for debugging)

**Validation Rules**:
- `base_path` must match the GitHub Pages subdirectory URL structure
- `output_directory` must be `dist/` (cannot change)
- `entry_point` must point to valid React entry file
- Build time must complete in under 5 minutes (performance constraint)

**Relationships**:
- Depends on `DeploymentWorkflow` (workflow executes build)
- Referenced by `DeploymentEnvironment` (deployment uses built artifacts)

---

### 3. Deployment Environment

**Entity**: `DeploymentEnvironment`  
**Purpose**: GitHub Pages hosting configuration for the built application

**Properties**:
- `environment_name`: "github-pages" (string)
- `repository_name`: "pokemon-collector" (string)
- `owner`: "markuswondrak" (string)
- `github_pages_url`: "https://markuswondrak.github.io/pokemon-collector/" (URL)
- `deployment_branch`: "gh-pages" (string - internal, managed by GitHub)
- `custom_domain`: null (string | null - optional, not configured)
- `enforce_https`: true (boolean - GitHub Pages default)
- `access_logs_enabled`: false (boolean)

**Validation Rules**:
- `github_pages_url` must be accessible and resolve correctly
- `deployment_branch` is managed by GitHub; workflow should not manually push
- HTTPS is enforced; custom domains not in scope for initial release

**Relationships**:
- Deployed to by `DeploymentWorkflow`
- Consumes artifacts from `BuildConfiguration`

---

### 4. Deployment History Record

**Entity**: `DeploymentHistoryEntry`  
**Purpose**: Audit trail of deployment attempts (visible in GitHub Actions workflow tab)

**Properties**:
- `deployment_id`: UUID (string)
- `commit_sha`: (string - full commit hash)
- `timestamp`: ISO 8601 (datetime)
- `status`: enum (pending | running | success | failure)
- `build_duration_seconds`: (number)
- `test_duration_seconds`: (number)
- `deployment_duration_seconds`: (number)
- `failure_reason`: string | null (reason if status = failure)
- `logs_url`: (URL - link to GitHub Actions workflow run)
- `deployed_url`: "https://markuswondrak.github.io/pokemon-collector/" (URL if success)

**Validation Rules**:
- `status` determines visibility: failures and successes both logged and visible
- `logs_url` must point to the specific GitHub Actions run
- Duration fields must be positive numbers or null
- `failure_reason` is required if `status` = failure

**Relationships**:
- Created by `DeploymentWorkflow` on every trigger
- Accessible via GitHub Actions UI (workflow tab, run history)

---

### 5. Test Suite Configuration

**Entity**: `TestSuiteConfiguration`  
**Purpose**: Test execution settings enforced before deployment

**Properties**:
- `test_framework`: "Vitest" (string)
- `test_command`: "pnpm test --run" (string)
- `coverage_minimum`: 80 (number - percent, from constitution)
- `test_timeout_seconds`: 300 (number)
- `worker_threads`: 4 (number - from constitution development standards)
- `fail_on_coverage_below_minimum`: true (boolean)

**Validation Rules**:
- Must run with `--run` flag (one-time execution, not watch mode)
- Must use exactly 4 worker threads during implementation
- Cannot proceed to deployment if coverage < 80%
- All tests must pass; no skipped or pending tests allowed

**Relationships**:
- Required step in `DeploymentWorkflow`
- Part of overall quality gate before deployment

---

## Relationships & Dependencies

```
DeploymentWorkflow
    ├── triggers: [push to main]
    ├── executes: BuildConfiguration
    ├── executes: TestSuiteConfiguration
    ├── deploys: DeploymentEnvironment
    ├── creates: DeploymentHistoryEntry
    └── uses: GITHUB_TOKEN (GitHub-managed secret)

BuildConfiguration
    ├── depends_on: Vite configuration (existing)
    └── produces_artifacts_for: DeploymentEnvironment

DeploymentEnvironment
    ├── consumes: artifacts from BuildConfiguration
    ├── serves_via: GitHub Pages (managed service)
    └── has_history: DeploymentHistoryEntry (many)

TestSuiteConfiguration
    └── gates: DeploymentWorkflow (must pass before deploy)
```

---

## Environment Variables & Configuration

### Required Environment Variables (GitHub Actions Context)

| Variable | Source | Purpose |
|----------|--------|---------|
| `GITHUB_TOKEN` | GitHub Actions (auto-injected) | Authentication for GitHub Pages deployment |
| `GITHUB_REF` | GitHub Actions (auto-injected) | Current branch reference |
| `GITHUB_SHA` | GitHub Actions (auto-injected) | Current commit SHA |

### Build-Time Environment Variables (Vite)

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_APP_BASE_PATH` | `/pokemon-collector/` | Base URL for all assets and links in deployed app |
| `NODE_ENV` | `production` | Build optimization level |

### Configuration Files

| File | Changes | Purpose |
|------|---------|---------|
| `vite.config.js` | Add `base: '/pokemon-collector/'` | Configure Vite build output for subdirectory deployment |
| `.github/workflows/deploy.yml` | New file | GitHub Actions workflow automation |
| Repository Settings (UI) | Enable GitHub Pages, select `gh-pages` branch | Configure GitHub Pages deployment target |

---

## No Changes Required To

- Application source code (`src/`)
- Existing test files (`tests/`)
- `package.json` (all dependencies already present)
- Other workflow files (`.github/workflows/`)
- Database or state persistence (no backend changes)
- Component library or styling (Chakra UI remains unchanged)

---

## Success Validation Checklist

- [ ] Workflow file passes GitHub Actions linting
- [ ] `vite.config.js` modification validated: app loads correctly with new base path
- [ ] Build completes in < 5 minutes
- [ ] All tests pass with 4-worker configuration
- [ ] Artifacts generated in `dist/` directory
- [ ] GitHub Pages deployment succeeds on first commit to main
- [ ] Deployed application accessible at `https://markuswondrak.github.io/pokemon-collector/`
- [ ] Deployment history visible in GitHub Actions workflow tab
- [ ] No credentials or secrets exposed in logs or repository
