---
agent: speckit.implement
---

## Constitution Compliance: Test Execution Rule

Per the project constitution (Development Standards), all test commands **MUST** use the `--run` flag for one-time execution:
- Use: `pnpm test --run`
- Never: `pnpm test` (without --run flag) in implementation tasks
- Exception: Only use watch mode (`pnpm test`) if explicitly requested by the user

This ensures deterministic test runs during implementation and prevents unintended watch mode in automated workflows.
