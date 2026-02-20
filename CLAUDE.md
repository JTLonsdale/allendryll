# Allendryll Princess Warriors

A browser-based RPG inspired by Dragon Warrior 4, built for the developer's daughters. High fantasy setting with five princess characters exploring a procedurally generated overworld.

## Tech Stack

- **Backend:** Node.js + Express 5, serves static files and save/load API (`server.js`)
- **Frontend:** Vanilla JS with HTML5 Canvas (no framework, no bundler)
- **Assets:** Kenney Roguelike RPG tileset in `public/assets/Spritesheet/`, but the game currently uses procedurally drawn tiles as fallback (the tileset is loaded but `init()` doesn't call `loadTileset`)
- **Maps:** Tiled `.tmx` files exist in `public/assets/Map/` but are unused; the overworld is procedurally generated in `map.js`

## Running the Game

```bash
npm start          # starts Express on http://localhost:3000
```

## Project Structure

```
server.js              — Express server: static file serving + save/load REST API
public/
  index.html           — Entry point, loads all JS via script tags (order matters)
  css/style.css        — Minimal canvas styling
  js/
    map.js             — Tile types, procedural world generation (60x50 grid), walkability
    enemies.js         — Enemy type definitions (ENEMY_TYPES array, getRandomEnemy())
    player.js          — Party definitions (with xp/level/attack/defense/spells), player state, movement
    input.js           — Keyboard input handler (keydown/keyup + consume pattern)
    renderer.js        — Canvas rendering: procedural tile cache, map drawing, player sprite, title/naming screens
    hud.js             — In-game HUD overlay (leader stats, gold)
    battle.js          — Battle system: sub-state machine, enemy rendering, Web Audio SFX, encounter check
    save.js            — Save/load via fetch to server API
    main.js            — Game loop, state machine (title → naming → playing → battle)
  assets/
    Spritesheet/       — Kenney roguelike tileset (16x16 tiles, 17px stride)
    Map/               — Tiled .tmx map files (not yet integrated)
saves/                 — Server-side JSON save files (gitignored)
```

## Architecture Notes

### Script Load Order (matters — no modules)
Scripts are loaded via `<script>` tags in `index.html` in dependency order:
`map.js → enemies.js → player.js → input.js → renderer.js → hud.js → battle.js → save.js → main.js`

All state is shared via globals (`player`, `MAP_DATA`, `TILE`, `TILE_SIZE`, etc.).

### Game State Machine
`Game.state` controls flow: `title` → `naming` → `recruiting` (optional) → `playing` → `battle` → `playing`
- **title:** Starfield background, press Enter to advance
- **naming:** Rename the five princesses (arrow keys to select, Enter to edit, Escape to skip)
- **recruiting:** Town-based recruitment (optional: shown if party incomplete); select new members to join, Escape to start game
- **playing:** Overworld exploration with camera-centered scrolling; random encounters trigger `battle`
- **battle:** Full turn-based combat managed by `Battle` object with its own sub-state machine (`transition`, `menu`, `spell_menu`, `player_attack`, `player_spell`, `enemy_turn`, `victory`, `defeat`, `run_success`)

### World Generation (`map.js`)
Procedural 60x50 tile map with: continent shaped by ellipse + value noise, northern mountain range with a pass, river, lake, forest regions, sand borders, flower meadows, 5 towns connected by paths with bridges. Uses seeded hash (`tileHash`) for deterministic randomness.

### The Party
Five princesses with default names: Angeline (Leader), Bathena (Warrior), Bedalia (Mage), Banabelle (Healer), Bedava (Ranger). Each has HP/MP/attack/defense/xp/level stats and a spells array. Names are customizable at game start.

### Rendering (`renderer.js`)
Dual rendering system: sprite-based (Kenney tileset) and procedural (hand-drawn canvas tiles). Currently only procedural is active. Tiles are pre-rendered into an off-screen canvas cache for performance. Water tiles animate across 4 frames.

### Controls
- Arrow keys: move (with 8-frame delay for repeat)
- S: save, L: load
- Enter/Escape: menu navigation

## Conventions

- No build step — edit JS files directly and refresh the browser
- Canvas is fixed at 800x600
- Tile size is 32x32 pixels
- Colors: gold (#ffd700) for UI accents, pink (#e84393) for princess theme
- Save files are plain JSON stored server-side in `saves/`

## Agent Roles

For tasks that span multiple domains, **dispatch parallel subagents via the Task tool**. Each agent's prompt file lives in `.claude/agents/` — read the relevant file and pass its contents as the prompt prefix, followed by the specific task.

For single-domain tasks, work directly without subagent overhead.

| Role | Prompt File | Owns |
|------|-------------|------|
| Game Designer | `.claude/agents/game-designer.md` | Design suggestions (no code — produces specs for other agents) |
| Engineer | `.claude/agents/engineer.md` | All JS, HTML, CSS, `server.js` |
| World Builder | `.claude/agents/world-builder.md` | `public/assets/`, map data |
| QA Engineer | `.claude/agents/qa-engineer.md` | `tests/` |
| Tech Lead | `.claude/agents/tech-lead.md` | Reviews all agents, maintains prompts & CLAUDE.md |

**Workflow**: After domain agents finish, dispatch the Tech Lead to review their combined output. The Tech Lead will flag issues, verify cross-domain integration, and update agent prompts if recurring problems are found.

**Game design suggestions**: Use `/suggestions` to trigger the Game Designer agent for a prioritized list of next improvements. The Game Designer reads all current JS files and suggests incremental changes ordered by effort-to-impact ratio.

**Code review and PR**: Use `/review-and-pr` to review unpushed changes, select the best-suited agent for the review based on which files changed, perform the review, then commit and create a GitHub PR.

**Next feature pipeline**: Use `/next-feature` to orchestrate the full design -> implement -> review cycle for the next game feature.

**Fix issues**: Use `/fix-issues` to find and fix all open GitHub issues.

## Subagent Usage Reporting

After completing any request that changed code files (`.js`, `.json`, `.css`, `.html`, or other non-`.md` files), include a **Subagents Used** summary at the end of your response. This helps verify that the right agents are being dispatched for multi-domain tasks.

Format:
```
**Subagents Used:** Engineer, QA Engineer
```

If no subagents were used, explicitly say so:
```
**Subagents Used:** None (single-domain task, worked directly)
```

This applies to every task that results in code file changes, whether the task was simple or complex. Skip this only when the task exclusively touched `.md` files.

## What's Not Built Yet

This is early-stage. Major systems still needed include: NPCs/dialogue, inventory/equipment, indoor maps/town interiors, leveling/experience (XP tracking exists but no level-up logic), story/quests, sound/music (battle SFX exists via Web Audio; overworld music absent), and mobile/touch input.
