---
name: suggestions
description: Get game design suggestions for next incremental gameplay or story improvements
user_invocable: true
---

# Game Design Suggestions

You are being asked to suggest improvements to Allendryll Princess Warriors. Use the Game Designer agent to analyze the current state and propose actionable next steps.

1. Read the Game Designer agent prompt from `.claude/agents/game-designer.md` to understand the design principles and suggestion format.

2. Read the current game code to understand what exists:
   - `public/js/map.js` (tile types, world layout, walkability)
   - `public/js/player.js` (party definitions, stats)
   - `public/js/renderer.js` (rendering capabilities)
   - `public/js/main.js` (game state machine, loop)
   - `public/js/hud.js` (HUD display)
   - `public/js/input.js` (controls)

3. Dispatch a subagent using the Task tool with the Game Designer agent prompt (from `.claude/agents/game-designer.md`) as the prompt prefix. Ask it for an open-ended review: the next 3-5 highest-impact improvements, prioritized by effort-to-impact ratio.

4. Present the suggestions to the user in a clear, readable format. For each suggestion, include:
   - A short title
   - What it adds and why it matters for the player experience
   - Scope (small code change or new system)
   - Specific enough details that you could implement it immediately if asked

5. Ask the user which suggestions they'd like to implement (they can pick one, several, or ask for different ideas).
