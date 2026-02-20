---
name: fix-issues
description: Look at all open GitHub issues and fix them
user_invocable: true
---

# Fix Open GitHub Issues

1. Run `gh issue list --state open` to get all open issues for this repository.
2. For each open issue, run `gh issue view <number>` to read the full details.
3. Investigate each issue by reading the relevant files and understanding the root cause.
4. Fix each issue, making sure to test by reviewing the changes carefully (run `npm test` if tests exist).
5. After fixing an issue, close it with `gh issue close <number> --comment "Fixed: <brief description of the fix>"`.
6. Continue until all open issues are resolved.
