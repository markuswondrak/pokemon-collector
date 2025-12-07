---
agent: speckit.implement
---

## Constitution Compliance: Test Execution Rule

Per the project constitution (Development Standards), all test commands **MUST** use the `--run` flag for one-time execution:
- Use: `pnpm test --run`
- Never: `pnpm test` (without --run flag) in implementation tasks
- Exception: Only use watch mode (`pnpm test`) if explicitly requested by the user

This ensures deterministic test runs during implementation and prevents unintended watch mode in automated workflows.

## Code Style

- **Indentation**: Use **tabs** instead of spaces for indentation in all source files.

## Test Suite Execution Strategy

The test suite **MUST** be executed according to strict separation rules:

### Unit Tests (Can Run All at Once)
- **Command**: `pnpm test --run` or `pnpm test:unit --run`
- **Scope**: Unit tests (`tests/unit/`) AND Contract tests (`tests/contract/`) together
- **Execution**: ALL unit and contract tests run in parallel in a single command
- **Purpose**: Fast feedback during development
- **Expected Duration**: < 1 minute

### Integration Tests (Must Run One-by-One ONLY)
- **Command**: `pnpm test:integration tests/integration/<specific-test-file>`
- **Scope**: Execute only ONE integration test file at a time
- **Execution**: NEVER run all integration tests together; always run individual test files
- **Purpose**: End-to-end validation of feature interactions without resource contention
- **Expected Duration**: 5-20 seconds per test file
- **Critical Rule**: MUST specify the individual test file path, never run the full `tests/integration/` directory at once

### Examples

✅ **CORRECT - Unit Tests (All Together)**:
```bash
pnpm test:unit
pnpm test
```

✅ **CORRECT - Integration Test (Individual)**:
```bash
pnpm test:integration tests/integration/collection.us1.test.jsx
pnpm test:integration tests/integration/lazy-loading-grid.test.jsx
```

❌ **WRONG - Integration Tests (Full Suite)**:
```bash
pnpm test:integration          # ← FORBIDDEN: runs entire integration suite
pnpm test:all                  # ← Use only before deployment, not during implementation
```

### Rationale

- **Unit tests in parallel**: Fast feedback loop, no resource constraints
- **Integration tests one-by-one**: Prevents API rate limiting, resource exhaustion, and reduces noise in test output for focused debugging

## Integration Test Execution Rule

Integration tests must be executed individually, never as the full suite in a single command. Run each integration test file one-by-one to avoid long, brittle runs and to keep diagnostics focused.
