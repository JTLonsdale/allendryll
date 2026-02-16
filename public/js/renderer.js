const Renderer = {
  canvas: null,
  ctx: null,
  tileset: null,       // Kenney spritesheet Image
  tileCache: {},       // pre-rendered tile canvases keyed by "type_variant"
  waterFrame: 0,       // animation frame counter
  frameCount: 0,

  // Kenney roguelike sheet: 16x16 tiles, 1px margin → stride 17
  // Sprite coords: [col, row] in the spritesheet grid
  SPRITE_MAP: {
    // Grass variations — green floor tiles (row 11-12 area in the sheet)
    grass:   [{ col: 1, row: 0 }],
    // Water — blue pool tiles
    water:   [{ col: 0, row: 0 }],
    // Mountain — rock/wall tiles
    mountain: [{ col: 51, row: 13 }],
    // Town — building tiles
    town:    [{ col: 49, row: 14 }],
    // Dense forest — dark tree
    denseForest: [{ col: 8, row: 6 }],
    // Trees — lighter tree
    trees:   [{ col: 7, row: 6 }, { col: 9, row: 6 }, { col: 10, row: 6 }],
    // Path — dirt/road tile
    path:    [{ col: 6, row: 0 }],
    // Sand — sandy ground
    sand:    [{ col: 3, row: 0 }],
    // Bridge — wooden plank
    bridge:  [{ col: 37, row: 14 }],
    // Flowers — plant tile
    flowers: [{ col: 2, row: 0 }],
  },

  init() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.buildProceduralTileCache();
  },

  loadTileset(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.tileset = img;
        this.buildSpriteCache();
        resolve(true);
      };
      img.onerror = () => resolve(false);
      img.src = src;
    });
  },

  // Pre-render sprite tiles at 2x scale (16→32) for performance
  buildSpriteCache() {
    if (!this.tileset) return;
    const stride = 17; // 16px tile + 1px margin
    for (const [name, variants] of Object.entries(this.SPRITE_MAP)) {
      variants.forEach((v, i) => {
        const key = `sprite_${name}_${i}`;
        const c = document.createElement('canvas');
        c.width = TILE_SIZE;
        c.height = TILE_SIZE;
        const cx = c.getContext('2d');
        cx.imageSmoothingEnabled = false;
        cx.drawImage(
          this.tileset,
          v.col * stride, v.row * stride, 16, 16,
          0, 0, TILE_SIZE, TILE_SIZE
        );
        this.tileCache[key] = c;
      });
    }
  },

  // Build rich procedural tile canvases as fallback
  buildProceduralTileCache() {
    this._buildGrassTiles();
    this._buildWaterTiles();
    this._buildMountainTile();
    this._buildTownTile();
    this._buildDenseForestTile();
    this._buildTreeTiles();
    this._buildPathTile();
    this._buildSandTile();
    this._buildBridgeTile();
    this._buildFlowerTile();
  },

  _makeTile() {
    const c = document.createElement('canvas');
    c.width = TILE_SIZE;
    c.height = TILE_SIZE;
    return { canvas: c, ctx: c.getContext('2d') };
  },

  _buildGrassTiles() {
    for (let v = 0; v < 4; v++) {
      const { canvas, ctx } = this._makeTile();
      const S = TILE_SIZE;
      // Base green with slight variation
      const greens = ['#4a8c3f', '#478a3c', '#4d8f42', '#459038'];
      ctx.fillStyle = greens[v];
      ctx.fillRect(0, 0, S, S);
      // Grass blade details
      ctx.strokeStyle = 'rgba(60,120,40,0.5)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const gx = (v * 37 + i * 11) % S;
        const gy = (v * 23 + i * 13) % S;
        ctx.beginPath();
        ctx.moveTo(gx, gy + 4);
        ctx.lineTo(gx + 1, gy);
        ctx.stroke();
      }
      // Subtle dirt specks
      ctx.fillStyle = 'rgba(100,80,40,0.15)';
      for (let i = 0; i < 3; i++) {
        const dx = (v * 19 + i * 17) % (S - 2);
        const dy = (v * 31 + i * 11) % (S - 2);
        ctx.fillRect(dx, dy, 2, 1);
      }
      this.tileCache[`proc_grass_${v}`] = canvas;
    }
  },

  _buildWaterTiles() {
    // 4 animation frames
    for (let f = 0; f < 4; f++) {
      const { canvas, ctx } = this._makeTile();
      const S = TILE_SIZE;
      // Deep blue base
      ctx.fillStyle = '#1a5c94';
      ctx.fillRect(0, 0, S, S);
      // Wave highlights
      ctx.strokeStyle = 'rgba(100,180,240,0.5)';
      ctx.lineWidth = 1.5;
      for (let w = 0; w < 3; w++) {
        const wy = 6 + w * 10 + f * 2.5;
        ctx.beginPath();
        ctx.moveTo(0, wy);
        ctx.quadraticCurveTo(8, wy - 3, 16, wy);
        ctx.quadraticCurveTo(24, wy + 3, S, wy);
        ctx.stroke();
      }
      // Sparkle highlights
      ctx.fillStyle = 'rgba(200,230,255,0.4)';
      const sx = (f * 11) % (S - 3);
      const sy = (f * 7 + 5) % (S - 3);
      ctx.fillRect(sx, sy, 2, 2);
      ctx.fillRect((sx + 17) % S, (sy + 13) % S, 1, 1);
      this.tileCache[`proc_water_${f}`] = canvas;
    }
  },

  _buildMountainTile() {
    for (let v = 0; v < 2; v++) {
      const { canvas, ctx } = this._makeTile();
      const S = TILE_SIZE;
      // Brown rocky base
      ctx.fillStyle = '#6b5a3e';
      ctx.fillRect(0, 0, S, S);
      // Mountain peak shape
      ctx.fillStyle = '#8b7355';
      ctx.beginPath();
      ctx.moveTo(4, S);
      ctx.lineTo(S / 2 + (v ? -3 : 3), 2);
      ctx.lineTo(S - 4, S);
      ctx.closePath();
      ctx.fill();
      // Snow cap
      ctx.fillStyle = '#e8e0d4';
      ctx.beginPath();
      ctx.moveTo(S / 2 - 5 + (v ? -2 : 2), 10);
      ctx.lineTo(S / 2 + (v ? -3 : 3), 2);
      ctx.lineTo(S / 2 + 5 + (v ? -2 : 2), 10);
      ctx.closePath();
      ctx.fill();
      // Rock texture lines
      ctx.strokeStyle = 'rgba(80,60,30,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(10, 20);
      ctx.lineTo(14, 16);
      ctx.moveTo(20, 22);
      ctx.lineTo(23, 18);
      ctx.stroke();
      // Dark rock shadow
      ctx.fillStyle = 'rgba(40,30,15,0.3)';
      ctx.fillRect(4, S - 6, S - 8, 3);
      this.tileCache[`proc_mountain_${v}`] = canvas;
    }
  },

  _buildTownTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    // Stone ground
    ctx.fillStyle = '#a09080';
    ctx.fillRect(0, 0, S, S);
    // Cobblestone pattern
    ctx.strokeStyle = 'rgba(70,60,50,0.3)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const ox = r % 2 === 0 ? 0 : 4;
        ctx.strokeRect(c * 8 + ox, r * 8, 8, 8);
      }
    }
    // Building: tan walls
    ctx.fillStyle = '#d4b896';
    ctx.fillRect(6, 8, 20, 18);
    // Red roof
    ctx.fillStyle = '#b04030';
    ctx.beginPath();
    ctx.moveTo(3, 12);
    ctx.lineTo(16, 2);
    ctx.lineTo(29, 12);
    ctx.closePath();
    ctx.fill();
    // Roof edge highlight
    ctx.strokeStyle = '#cc5544';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(3, 12);
    ctx.lineTo(16, 2);
    ctx.lineTo(29, 12);
    ctx.stroke();
    // Door
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(12, 18, 8, 8);
    // Door handle
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(18, 22, 1, 1);
    // Window
    ctx.fillStyle = '#88ccee';
    ctx.fillRect(8, 12, 4, 4);
    ctx.fillStyle = '#88ccee';
    ctx.fillRect(20, 12, 4, 4);
    // Window frames
    ctx.strokeStyle = '#5a3a18';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(8, 12, 4, 4);
    ctx.strokeRect(20, 12, 4, 4);
    this.tileCache['proc_town_0'] = canvas;
  },

  _buildDenseForestTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    // Dark ground
    ctx.fillStyle = '#2a5a25';
    ctx.fillRect(0, 0, S, S);
    // Dense canopy — multiple overlapping tree tops
    const treeColors = ['#1a5020', '#225a28', '#1e4e22', '#286030'];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = treeColors[i];
      const tx = 4 + (i * 8) % 24;
      const ty = 2 + (i * 5) % 12;
      ctx.beginPath();
      ctx.arc(tx + 4, ty + 4, 7 + (i % 2) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    // Trunk hints
    ctx.fillStyle = '#5a3a18';
    ctx.fillRect(8, 22, 3, 10);
    ctx.fillRect(20, 24, 3, 8);
    // Shadow overlay
    ctx.fillStyle = 'rgba(0,20,0,0.2)';
    ctx.fillRect(0, 0, S, S);
    this.tileCache['proc_denseforest_0'] = canvas;
  },

  _buildTreeTiles() {
    for (let v = 0; v < 3; v++) {
      const { canvas, ctx } = this._makeTile();
      const S = TILE_SIZE;
      // Grass base
      ctx.fillStyle = '#4a8c3f';
      ctx.fillRect(0, 0, S, S);
      // Trunk
      const tx = S / 2 - 2 + (v - 1) * 2;
      ctx.fillStyle = '#7a5a2a';
      ctx.fillRect(tx, 16, 4, 14);
      // Foliage — different shapes per variant
      if (v === 0) {
        // Round deciduous
        ctx.fillStyle = '#2d7a28';
        ctx.beginPath();
        ctx.arc(S / 2, 12, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3a8a35';
        ctx.beginPath();
        ctx.arc(S / 2 - 3, 10, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (v === 1) {
        // Conifer/pine
        ctx.fillStyle = '#1e6025';
        ctx.beginPath();
        ctx.moveTo(S / 2, 2);
        ctx.lineTo(S / 2 + 11, 20);
        ctx.lineTo(S / 2 - 11, 20);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#247028';
        ctx.beginPath();
        ctx.moveTo(S / 2, 6);
        ctx.lineTo(S / 2 + 8, 16);
        ctx.lineTo(S / 2 - 8, 16);
        ctx.closePath();
        ctx.fill();
      } else {
        // Bushy
        ctx.fillStyle = '#358030';
        ctx.beginPath();
        ctx.arc(S / 2 - 4, 14, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(S / 2 + 4, 12, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3d9038';
        ctx.beginPath();
        ctx.arc(S / 2, 10, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      // Highlight
      ctx.fillStyle = 'rgba(120,200,80,0.2)';
      ctx.beginPath();
      ctx.arc(S / 2 - 2, 9, 4, 0, Math.PI * 2);
      ctx.fill();
      this.tileCache[`proc_trees_${v}`] = canvas;
    }
  },

  _buildPathTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    // Dirt base
    ctx.fillStyle = '#b89860';
    ctx.fillRect(0, 0, S, S);
    // Grass edges
    ctx.fillStyle = '#4a8c3f';
    ctx.fillRect(0, 0, 3, S);
    ctx.fillRect(S - 3, 0, 3, S);
    // Worn center
    ctx.fillStyle = '#c8a870';
    ctx.fillRect(6, 0, S - 12, S);
    // Pebbles
    ctx.fillStyle = 'rgba(80,65,40,0.3)';
    ctx.fillRect(10, 6, 3, 2);
    ctx.fillRect(18, 16, 2, 2);
    ctx.fillRect(14, 24, 2, 2);
    ctx.fillRect(22, 8, 2, 1);
    // Track marks
    ctx.strokeStyle = 'rgba(90,70,40,0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(12, S);
    ctx.moveTo(20, 0);
    ctx.lineTo(20, S);
    ctx.stroke();
    ctx.setLineDash([]);
    this.tileCache['proc_path_0'] = canvas;
  },

  _buildSandTile() {
    for (let v = 0; v < 2; v++) {
      const { canvas, ctx } = this._makeTile();
      const S = TILE_SIZE;
      // Sandy base
      ctx.fillStyle = v === 0 ? '#e0c878' : '#d8c070';
      ctx.fillRect(0, 0, S, S);
      // Sand grain dots
      ctx.fillStyle = 'rgba(180,150,80,0.4)';
      for (let i = 0; i < 8; i++) {
        const sx = (v * 13 + i * 11) % (S - 1);
        const sy = (v * 17 + i * 7) % (S - 1);
        ctx.fillRect(sx, sy, 1, 1);
      }
      // Wave ripple lines
      ctx.strokeStyle = 'rgba(200,180,100,0.3)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, 10 + v * 6);
      ctx.quadraticCurveTo(S / 2, 8 + v * 6, S, 12 + v * 6);
      ctx.stroke();
      this.tileCache[`proc_sand_${v}`] = canvas;
    }
  },

  _buildBridgeTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    // Water underneath
    ctx.fillStyle = '#1a5c94';
    ctx.fillRect(0, 0, S, S);
    // Wooden planks
    ctx.fillStyle = '#a07840';
    ctx.fillRect(4, 0, S - 8, S);
    // Plank lines
    ctx.strokeStyle = '#806030';
    ctx.lineWidth = 1;
    for (let py = 0; py < S; py += 6) {
      ctx.beginPath();
      ctx.moveTo(4, py);
      ctx.lineTo(S - 4, py);
      ctx.stroke();
    }
    // Wood grain
    ctx.strokeStyle = 'rgba(100,70,30,0.2)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(10, S);
    ctx.moveTo(22, 0);
    ctx.lineTo(22, S);
    ctx.stroke();
    // Railings
    ctx.fillStyle = '#785828';
    ctx.fillRect(4, 0, 2, S);
    ctx.fillRect(S - 6, 0, 2, S);
    // Railing posts
    ctx.fillStyle = '#604820';
    for (let py = 2; py < S; py += 10) {
      ctx.fillRect(3, py, 4, 3);
      ctx.fillRect(S - 7, py, 4, 3);
    }
    this.tileCache['proc_bridge_0'] = canvas;
  },

  _buildFlowerTile() {
    for (let v = 0; v < 2; v++) {
      const { canvas, ctx } = this._makeTile();
      const S = TILE_SIZE;
      // Grass base
      ctx.fillStyle = '#4a8c3f';
      ctx.fillRect(0, 0, S, S);
      // Grass blade details
      ctx.strokeStyle = 'rgba(60,120,40,0.4)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const gx = (v * 19 + i * 11) % S;
        const gy = (v * 13 + i * 9) % S;
        ctx.beginPath();
        ctx.moveTo(gx, gy + 3);
        ctx.lineTo(gx + 1, gy);
        ctx.stroke();
      }
      // Flowers — colored dots
      const flowerColors = ['#ff6b8a', '#ffaa44', '#aa66ff', '#44ccff', '#ffee44', '#ff4488'];
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = flowerColors[(v * 3 + i) % flowerColors.length];
        const fx = (v * 11 + i * 13 + 3) % (S - 4);
        const fy = (v * 7 + i * 11 + 2) % (S - 4);
        // Petal circle
        ctx.beginPath();
        ctx.arc(fx + 2, fy + 2, 2, 0, Math.PI * 2);
        ctx.fill();
        // Center
        ctx.fillStyle = '#ffee88';
        ctx.fillRect(fx + 1, fy + 1, 2, 2);
      }
      this.tileCache[`proc_flowers_${v}`] = canvas;
    }
  },

  // Get the correct cached tile canvas for a tile type at position (x,y)
  getTileCached(type, x, y) {
    const h = (x * 31 + y * 17) & 0xffff; // cheap variant hash

    if (this.tileset) {
      // Use sprite-based tiles
      switch (type) {
        case TILE.GRASS:    return this.tileCache['sprite_grass_0'];
        case TILE.WATER:    return null; // handled separately for animation
        case TILE.MOUNTAIN: return this.tileCache['sprite_mountain_0'];
        case TILE.TOWN:     return this.tileCache['sprite_town_0'];
        case TILE.DENSE_FOREST: return this.tileCache['sprite_denseForest_0'];
        case TILE.TREES:    return this.tileCache[`sprite_trees_${h % 3}`];
        case TILE.PATH:     return this.tileCache['sprite_path_0'];
        case TILE.SAND:     return this.tileCache['sprite_sand_0'];
        case TILE.BRIDGE:   return this.tileCache['sprite_bridge_0'];
        case TILE.FLOWERS:  return this.tileCache['sprite_flowers_0'];
      }
    }

    // Procedural fallback
    switch (type) {
      case TILE.GRASS:    return this.tileCache[`proc_grass_${h % 4}`];
      case TILE.WATER:    return null; // animated
      case TILE.MOUNTAIN: return this.tileCache[`proc_mountain_${h % 2}`];
      case TILE.TOWN:     return this.tileCache['proc_town_0'];
      case TILE.DENSE_FOREST: return this.tileCache['proc_denseforest_0'];
      case TILE.TREES:    return this.tileCache[`proc_trees_${h % 3}`];
      case TILE.PATH:     return this.tileCache['proc_path_0'];
      case TILE.SAND:     return this.tileCache[`proc_sand_${h % 2}`];
      case TILE.BRIDGE:   return this.tileCache['proc_bridge_0'];
      case TILE.FLOWERS:  return this.tileCache[`proc_flowers_${h % 2}`];
    }
    return null;
  },

  clear() {
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  },

  drawMap() {
    const ctx = this.ctx;
    this.frameCount++;
    const waterFrameIdx = Math.floor(this.frameCount / 20) % 4;

    // Camera offset to center player on screen
    const camX = player.x * TILE_SIZE - this.canvas.width / 2 + TILE_SIZE / 2;
    const camY = player.y * TILE_SIZE - this.canvas.height / 2 + TILE_SIZE / 2;

    const startCol = Math.max(0, Math.floor(camX / TILE_SIZE));
    const startRow = Math.max(0, Math.floor(camY / TILE_SIZE));
    const endCol = Math.min(MAP_COLS, startCol + Math.ceil(this.canvas.width / TILE_SIZE) + 2);
    const endRow = Math.min(MAP_ROWS, startRow + Math.ceil(this.canvas.height / TILE_SIZE) + 2);

    // Fill areas outside map with deep ocean
    ctx.fillStyle = '#0a3a6a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let r = startRow; r < endRow; r++) {
      for (let c = startCol; c < endCol; c++) {
        const tile = getTile(c, r);
        const dx = Math.floor(c * TILE_SIZE - camX);
        const dy = Math.floor(r * TILE_SIZE - camY);

        if (tile === TILE.WATER) {
          // Animated water tile
          const waterKey = this.tileset
            ? 'sprite_water_0'
            : `proc_water_${waterFrameIdx}`;
          const cached = this.tileCache[waterKey];
          if (cached) {
            ctx.drawImage(cached, dx, dy);
          } else {
            ctx.fillStyle = '#1a5c94';
            ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE);
          }
          continue;
        }

        const cached = this.getTileCached(tile, c, r);
        if (cached) {
          ctx.drawImage(cached, dx, dy);
        } else {
          ctx.fillStyle = '#333';
          ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  },

  drawPlayer() {
    const ctx = this.ctx;
    const px = this.canvas.width / 2 - TILE_SIZE / 2;
    const py = this.canvas.height / 2 - TILE_SIZE / 2;

    // Body
    ctx.fillStyle = '#e84393';
    ctx.fillRect(px + 6, py + 8, 20, 16);
    // Head
    ctx.fillStyle = '#ffeaa7';
    ctx.fillRect(px + 9, py + 1, 14, 12);
    // Hair
    ctx.fillStyle = '#fdcb6e';
    ctx.fillRect(px + 7, py + 0, 18, 5);
    // Eyes
    ctx.fillStyle = '#2d3436';
    const eyeOffset = player.direction === 'left' ? -2 : player.direction === 'right' ? 2 : 0;
    ctx.fillRect(px + 12 + eyeOffset, py + 5, 2, 2);
    ctx.fillRect(px + 18 + eyeOffset, py + 5, 2, 2);
    // Crown
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(px + 10, py - 3, 12, 4);
    ctx.fillRect(px + 10, py - 6, 3, 3);
    ctx.fillRect(px + 15, py - 7, 3, 4);
    ctx.fillRect(px + 20, py - 6, 3, 3);
    // Legs
    ctx.fillStyle = '#e84393';
    ctx.fillRect(px + 9, py + 24, 5, 6);
    ctx.fillRect(px + 18, py + 24, 5, 6);
  },

  drawTitleScreen() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.clear();

    // Background gradient effect
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1a0533');
    grad.addColorStop(0.5, '#2d1b69');
    grad.addColorStop(1, '#0d0221');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Stars
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 60; i++) {
      const sx = (Math.sin(i * 127.1) * 0.5 + 0.5) * w;
      const sy = (Math.cos(i * 311.7) * 0.5 + 0.5) * h * 0.6;
      const size = (i % 3) + 1;
      ctx.fillRect(sx, sy, size, size);
    }

    // Title
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 42px serif';
    ctx.textAlign = 'center';
    ctx.fillText('ALLENDRYLL', w / 2, h / 2 - 60);
    ctx.fillStyle = '#e84393';
    ctx.font = 'bold 36px serif';
    ctx.fillText('PRINCESS WARRIORS', w / 2, h / 2 - 15);

    // Subtitle
    ctx.fillStyle = '#aaa';
    ctx.font = '16px sans-serif';
    ctx.fillText('A tale of five princesses...', w / 2, h / 2 + 30);

    // Prompt (blinking)
    if (Math.floor(Date.now() / 600) % 2 === 0) {
      ctx.fillStyle = '#fff';
      ctx.font = '20px sans-serif';
      ctx.fillText('Press ENTER to Start', w / 2, h / 2 + 100);
    }
  },

  drawNameEntry(partyNames, selectedIndex, editingText) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.clear();

    ctx.fillStyle = '#1a0533';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 28px serif';
    ctx.textAlign = 'center';
    ctx.fillText('Name Your Princesses', w / 2, 60);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Use UP/DOWN to select, ENTER to edit name, type new name + ENTER to confirm', w / 2, 95);

    const startY = 140;
    const rowH = 70;
    const roles = ['Leader', 'Warrior', 'Mage', 'Healer', 'Ranger'];

    for (let i = 0; i < 5; i++) {
      const y = startY + i * rowH;
      const isSelected = i === selectedIndex;

      // Background box
      ctx.fillStyle = isSelected ? 'rgba(232,67,147,0.25)' : 'rgba(255,255,255,0.05)';
      ctx.fillRect(w / 2 - 200, y, 400, 55);
      if (isSelected) {
        ctx.strokeStyle = '#e84393';
        ctx.lineWidth = 2;
        ctx.strokeRect(w / 2 - 200, y, 400, 55);
      }

      // Role
      ctx.fillStyle = '#888';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(roles[i], w / 2 - 180, y + 20);

      // Name
      ctx.fillStyle = isSelected ? '#ffd700' : '#fff';
      ctx.font = 'bold 22px serif';
      const displayName = (isSelected && editingText !== null) ? editingText + '_' : partyNames[i];
      ctx.fillText(displayName, w / 2 - 180, y + 43);

      // Arrow indicator
      if (isSelected) {
        ctx.fillStyle = '#e84393';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('>', w / 2 - 185, y + 40);
      }
    }

    // Continue prompt
    ctx.fillStyle = '#aaa';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Press ESCAPE when done to begin your adventure!', w / 2, h - 40);
  },

  drawNotification(message) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(w / 2 - 150, 10, 300, 36);
    ctx.strokeStyle = '#ffd700';
    ctx.strokeRect(w / 2 - 150, 10, 300, 36);
    ctx.fillStyle = '#fff';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(message, w / 2, 34);
  }
};
