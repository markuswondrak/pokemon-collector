---
agent: speckit.constitution
---

## Terminal Command Usage Rules

- **Avoid unnecessary redirection**: Do not use `2>&1` or similar redirection unless specifically needed to combine streams or suppress output
- **Use clean syntax**: Run commands directly (e.g., `pnpm test` not `pnpm test 2>&1`)
- **Let tools handle output**: The run_in_terminal tool captures both stdout and stderr by default
