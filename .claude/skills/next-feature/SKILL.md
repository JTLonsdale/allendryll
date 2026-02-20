---
name: next-feature
description: Orchestrate the game-designer -> engineer -> tech-lead pipeline to design, implement, and review the next game feature
user_invocable: true
---

# Next Feature Pipeline

Orchestrates the full cycle: design a feature, implement it, and review it.

## Step 1: Get a design suggestion

1. Read `.claude/agents/game-designer.md` for the Game Designer prompt.
2. Read the current game code files to understand what exists:
   - `public/js/map.js`, `public/js/player.js`, `public/js/renderer.js`
   - `public/js/main.js`, `public/js/hud.js`, `public/js/input.js`
3. Dispatch a **Game Designer** subagent (Task tool) asking for the single highest-impact next improvement, with full implementation details.
4. Present the suggestion to the user and ask for approval before proceeding. The user may request changes to the design.

## Step 2: Implement the feature

Once the user approves the design:

1. Read `.claude/agents/engineer.md` for the Engineer prompt.
2. Dispatch an **Engineer** subagent (Task tool) with the approved design spec. Include:
   - The full design details from Step 1
   - Instructions to implement within the existing architecture
   - Reminder about globals pattern, script load order, and canvas rendering
3. The Engineer will modify the relevant files. Review the changes for completeness.

## Step 3: Review the implementation

1. Read `.claude/agents/tech-lead.md` for the Tech Lead prompt.
2. Dispatch a **Tech Lead** subagent (Task tool) to review the Engineer's changes. Include:
   - The design spec that was implemented
   - A summary of which files were changed
   - The full diff of changes
3. Present the review results to the user.

## Step 4: Fix any issues

If the Tech Lead found issues:
1. Fix them directly (for simple issues) or dispatch the Engineer again (for complex issues).
2. Re-run the Tech Lead review if significant changes were made.

## Step 5: Summary

Present a final summary:
- What was designed
- What was implemented (files changed)
- Review outcome
- What the user should test (e.g., "refresh the browser and try X")
