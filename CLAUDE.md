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
    player.js          — Party definitions, player state, movement
    input.js           — Keyboard input handler (keydown/keyup + consume pattern)
    renderer.js        — Canvas rendering: procedural tile cache, map drawing, player sprite, title/naming screens
    hud.js             — In-game HUD overlay (leader stats, gold)
    save.js            — Save/load via fetch to server API
    main.js            — Game loop, state machine (title → naming → playing)
  assets/
    Spritesheet/       — Kenney roguelike tileset (16x16 tiles, 17px stride)
    Map/               — Tiled .tmx map files (not yet integrated)
saves/                 — Server-side JSON save files (gitignored)
```

## Architecture Notes

### Script Load Order (matters — no modules)
Scripts are loaded via `<script>` tags in `index.html` in dependency order:
`map.js → player.js → input.js → renderer.js → hud.js → save.js → main.js`

All state is shared via globals (`player`, `MAP_DATA`, `TILE`, `TILE_SIZE`, etc.).

### Game State Machine
`Game.state` controls flow: `title` → `naming` → `playing`
- **title:** Starfield background, press Enter to advance
- **naming:** Rename the five princesses (arrow keys to select, Enter to edit, Escape to start)
- **playing:** Overworld exploration with camera-centered scrolling

### World Generation (`map.js`)
Procedural 60x50 tile map with: continent shaped by ellipse + value noise, northern mountain range with a pass, river, lake, forest regions, sand borders, flower meadows, 5 towns connected by paths with bridges. Uses seeded hash (`tileHash`) for deterministic randomness.

### The Party
Five princesses with default names: Angeline (Leader), Bathena (Warrior), Bedalia (Mage), Banabelle (Healer), Bedava (Ranger). Each has HP/MP stats. Names are customizable at game start.

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

## What's Not Built Yet

This is early-stage. Major systems still needed include: battle system, NPCs/dialogue, inventory/equipment, magic/spells, indoor maps/town interiors, enemy encounters, leveling/experience, story/quests, sound/music, and mobile/touch input.
