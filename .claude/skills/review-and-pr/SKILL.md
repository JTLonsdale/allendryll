---
name: review-and-pr
description: Review unpushed code changes with the best-suited agent, then commit and create a GitHub PR
user_invocable: true
---

# Review and PR

You are being asked to review the current unpushed code changes, get a quality review from the most appropriate agent, then commit and create a GitHub PR.

## Step 1: Understand the changes

Run the following commands in parallel to understand the current state:

- `git diff main...HEAD --stat` to see which files changed and their scope
- `git diff main...HEAD` to see the full diff
- `git log main..HEAD --oneline` to see the commit history on this branch
- `git diff` and `git diff --cached` to see any uncommitted changes
- `git status` to see untracked files

If there are uncommitted changes, stage and commit them first (ask the user for a commit message if the changes are non-trivial).

## Step 2: Choose the reviewer agent

Based on which files were modified, select the **single best agent** to review the code. Use this mapping:

| Files changed | Agent | Prompt file |
|---|---|---|
| Only `public/js/*.js`, `public/index.html`, `public/css/`, `server.js` | Engineer | `.claude/agents/engineer.md` |
| Only `public/assets/`, map data | World Builder | `.claude/agents/world-builder.md` |
| Only `tests/` | QA Engineer | `.claude/agents/qa-engineer.md` |
| **Multiple domains** | Tech Lead | `.claude/agents/tech-lead.md` |

If changes span more than one agent's domain, always use the **Tech Lead** — they review across all domains.

## Step 3: Dispatch the review

1. Read the chosen agent's prompt file from `.claude/agents/`.
2. Dispatch a subagent using the **Task tool** with the agent prompt as a prefix, followed by this review request:

> Review the following code changes for quality, correctness, and adherence to project patterns. Do NOT modify any files — only analyze and report.
>
> Focus on:
> - **Correctness**: Are there bugs, logic errors, or edge cases?
> - **Architecture**: Do the changes follow project patterns (globals, script load order, canvas rendering, state machine)?
> - **Style**: Descriptive names, no magic numbers, consistent with existing code?
> - **Theme**: Princess theme colors (#ffd700 gold, #e84393 pink), age-appropriate content?
> - **Missing work**: Are there gaps — new game states without render paths, new globals without cleanup?
>
> Return your findings structured as:
> - **Passed**: What looks correct
> - **Issues**: Problems found (with file paths and line numbers)
> - **Suggestions**: Optional improvements (not blockers)

Include the full diff output in the subagent prompt so it has context.

## Step 4: Present the review

Show the user the review results clearly. If there are **Issues** (not just suggestions), ask the user whether they want to fix them before proceeding to the PR. If the user wants to fix issues, fix them, then re-run the review.

## Step 5: Create the PR

Once the review passes (or the user chooses to proceed despite issues):

1. Push the branch to the remote: `git push -u origin <branch-name>`
2. Create the PR using `gh pr create`. Use the commit history and diff to write a clear title and description:

```bash
gh pr create --title "<concise title>" --body "$(cat <<'EOF'
## Summary
<bullet points describing what changed and why>

## Review
Reviewed by: <agent name>
<1-2 sentence summary of review outcome>

## Test plan
<how to verify the changes work>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

3. Return the PR URL to the user.
