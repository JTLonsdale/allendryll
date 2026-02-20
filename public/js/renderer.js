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
    this._buildShipTile();
    // Town interior tiles
    this._buildCobbleTile();
    this._buildWoodFloorTile();
    this._buildWallTile();
    this._buildWallTopTile();
    this._buildCounterTile();
    this._buildDoorTile();
    this._buildCarpetTile();
    this._buildTownTreeTile();
    this._buildTownExitTile();
    this._buildStreamTiles();
    this._buildTownBridgeTile();
    this._buildFountainTile();
    this._buildWellTile();
    this._buildFenceTile();
    this._buildGardenTile();
    this._buildSignTile();
    this._buildSignInnTile();
    this._buildSignWeaponTile();
    this._buildSignItemTile();
    this._buildSignSpecialTile();
    this._buildRoofTile();
    this._buildInnBedTile();
    this._buildBookshelfTile();
    this._buildTownFlowersTile();
    this._buildDockTile();
    this._buildStoneCircleTile();
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

  _buildShipTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    // Hull — boat-shaped polygon (pointy prow at top, wider stern at bottom)
    ctx.fillStyle = '#8B5E3C';
    ctx.beginPath();
    ctx.moveTo(S / 2, 2);         // prow (top center)
    ctx.lineTo(S - 4, S / 2);     // right mid
    ctx.lineTo(S - 3, S - 4);     // right stern
    ctx.lineTo(3, S - 4);         // left stern
    ctx.lineTo(4, S / 2);         // left mid
    ctx.closePath();
    ctx.fill();
    // Hull plank lines
    ctx.strokeStyle = '#6B4226';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(6, 12);
    ctx.lineTo(S - 6, 12);
    ctx.moveTo(5, 18);
    ctx.lineTo(S - 5, 18);
    ctx.moveTo(4, 24);
    ctx.lineTo(S - 4, 24);
    ctx.stroke();
    // Mast — dark brown vertical bar at center
    ctx.fillStyle = '#5a3a18';
    ctx.fillRect(S / 2 - 1, 4, 3, 22);
    // Sail — cream/white triangle on the right side of the mast
    ctx.fillStyle = '#f5f0e0';
    ctx.beginPath();
    ctx.moveTo(S / 2 + 2, 5);     // top of mast
    ctx.lineTo(S - 5, 14);        // right point
    ctx.lineTo(S / 2 + 2, 22);    // bottom of mast
    ctx.closePath();
    ctx.fill();
    // Pink accent stripe on the sail (princess theme)
    ctx.fillStyle = '#e84393';
    ctx.beginPath();
    ctx.moveTo(S / 2 + 2, 12);
    ctx.lineTo(S - 8, 14);
    ctx.lineTo(S / 2 + 2, 16);
    ctx.closePath();
    ctx.fill();
    this.tileCache['proc_ship_0'] = canvas;
  },

  // === Town interior tile builders ===

  _buildCobbleTile() {
    for (let v = 0; v < 2; v++) {
      const { canvas, ctx } = this._makeTile();
      const S = TILE_SIZE;
      ctx.fillStyle = v === 0 ? '#9a8a7a' : '#a09080';
      ctx.fillRect(0, 0, S, S);
      ctx.strokeStyle = 'rgba(60,50,40,0.3)';
      ctx.lineWidth = 0.5;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const ox = r % 2 === 0 ? 0 : 4;
          ctx.strokeRect(c * 8 + ox, r * 8, 8, 8);
        }
      }
      ctx.fillStyle = 'rgba(80,70,60,0.1)';
      ctx.fillRect((v * 7) % S, (v * 13) % S, 3, 2);
      this.tileCache[`proc_cobble_${v}`] = canvas;
    }
  },

  _buildWoodFloorTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    ctx.fillStyle = '#c49a6c';
    ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = '#a07840';
    ctx.lineWidth = 1;
    for (let py = 0; py < S; py += 8) {
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(S, py); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(100,70,30,0.15)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(10, S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(22, S); ctx.stroke();
    this.tileCache['proc_woodfloor_0'] = canvas;
  },

  _buildWallTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    ctx.fillStyle = '#6a6a70';
    ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = 'rgba(40,40,45,0.4)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        const ox = r % 2 === 0 ? 0 : 5;
        ctx.strokeRect(c * 11 + ox, r * 8, 11, 8);
      }
    }
    ctx.fillStyle = 'rgba(80,80,90,0.3)';
    ctx.fillRect(0, 0, S, 2);
    this.tileCache['proc_wall_0'] = canvas;
  },

  _buildWallTopTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    ctx.fillStyle = '#5a5a60';
    ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = '#4a4a50';
    ctx.fillRect(0, S - 6, S, 6);
    ctx.strokeStyle = 'rgba(30,30,35,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, S - 6); ctx.lineTo(S, S - 6); ctx.stroke();
    this.tileCache['proc_walltop_0'] = canvas;
  },

  _buildCounterTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    ctx.fillStyle = '#c49a6c';
    ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = '#8b6935';
    ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = '#a07840';
    ctx.fillRect(2, 2, S - 4, S - 4);
    ctx.strokeStyle = '#6b4423';
    ctx.lineWidth = 1;
    ctx.strokeRect(2, 2, S - 4, S - 4);
    ctx.fillStyle = 'rgba(200,180,140,0.3)';
    ctx.fillRect(4, 4, S - 8, 3);
    this.tileCache['proc_counter_0'] = canvas;
  },

  _buildDoorTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    ctx.fillStyle = '#9a8a7a';
    ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = '#7a5a2a';
    ctx.fillRect(6, 2, S - 12, S - 2);
    ctx.strokeStyle = '#5a3a18';
    ctx.lineWidth = 1;
    ctx.strokeRect(6, 2, S - 12, S - 2);
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(S - 10, S / 2, 2, 0, Math.PI * 2);
    ctx.fill();
    this.tileCache['proc_door_0'] = canvas;
  },

  _buildCarpetTile() {
    for (let v = 0; v < 2; v++) {
      const { canvas, ctx } = this._makeTile();
      const S = TILE_SIZE;
      ctx.fillStyle = v === 0 ? '#8b2252' : '#6b3a6b';
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = v === 0 ? '#a03060' : '#7a4a7a';
      ctx.fillRect(3, 3, S - 6, S - 6);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(5, 5, S - 10, S - 10);
      this.tileCache[`proc_carpet_${v}`] = canvas;
    }
  },

  _buildTownTreeTile() {
    for (let v = 0; v < 2; v++) {
      const { canvas, ctx } = this._makeTile();
      const S = TILE_SIZE;
      ctx.fillStyle = '#9a8a7a';
      ctx.fillRect(0, 0, S, S);
      ctx.strokeStyle = 'rgba(60,50,40,0.3)';
      ctx.lineWidth = 0.5;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          ctx.strokeRect(c * 8 + (r % 2 === 0 ? 0 : 4), r * 8, 8, 8);
        }
      }
      ctx.fillStyle = '#7a5a2a';
      ctx.fillRect(S / 2 - 2, 16, 4, 16);
      const colors = v === 0 ? ['#2d7a28', '#3a8a35'] : ['#4a9a40', '#5aaa50'];
      ctx.fillStyle = colors[0];
      ctx.beginPath(); ctx.arc(S / 2, 12, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = colors[1];
      ctx.beginPath(); ctx.arc(S / 2 - 3, 10, 6, 0, Math.PI * 2); ctx.fill();
      this.tileCache[`proc_towntree_${v}`] = canvas;
    }
  },

  _buildTownExitTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    ctx.fillStyle = '#9a8a7a';
    ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = 'rgba(74,140,63,0.3)';
    ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = 'rgba(60,50,40,0.3)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        ctx.strokeRect(c * 8 + (r % 2 === 0 ? 0 : 4), r * 8, 8, 8);
      }
    }
    ctx.fillStyle = 'rgba(0,150,0,0.2)';
    ctx.beginPath();
    ctx.moveTo(S / 2 - 6, S - 4);
    ctx.lineTo(S / 2, S - 12);
    ctx.lineTo(S / 2 + 6, S - 4);
    ctx.closePath();
    ctx.fill();
    this.tileCache['proc_townexit_0'] = canvas;
  },

  _buildStreamTiles() {
    for (let f = 0; f < 4; f++) {
      const { canvas, ctx } = this._makeTile();
      const S = TILE_SIZE;
      ctx.fillStyle = '#2a7ab4';
      ctx.fillRect(0, 0, S, S);
      ctx.strokeStyle = 'rgba(100,200,255,0.4)';
      ctx.lineWidth = 1.5;
      for (let w = 0; w < 3; w++) {
        const wy = 4 + w * 10 + f * 2;
        ctx.beginPath();
        ctx.moveTo(0, wy);
        ctx.quadraticCurveTo(8, wy - 2, 16, wy);
        ctx.quadraticCurveTo(24, wy + 2, S, wy);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(180,230,255,0.3)';
      ctx.fillRect((f * 9) % (S - 2), (f * 5 + 3) % (S - 2), 2, 2);
      this.tileCache[`proc_stream_${f}`] = canvas;
    }
  },

  _buildTownBridgeTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    ctx.fillStyle = '#2a7ab4';
    ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = '#a07840';
    ctx.fillRect(0, 4, S, S - 8);
    ctx.strokeStyle = '#806030';
    ctx.lineWidth = 1;
    for (let px = 0; px < S; px += 6) {
      ctx.beginPath(); ctx.moveTo(px, 4); ctx.lineTo(px, S - 4); ctx.stroke();
    }
    ctx.fillStyle = '#785828';
    ctx.fillRect(0, 3, S, 2);
    ctx.fillRect(0, S - 5, S, 2);
    this.tileCache['proc_townbridge_0'] = canvas;
  },

  _buildFountainTile() {
    for (let f = 0; f < 4; f++) {
      const { canvas, ctx } = this._makeTile();
      const S = TILE_SIZE;
      ctx.fillStyle = '#9a8a7a';
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = '#7a7a80';
      ctx.beginPath(); ctx.arc(S / 2, S / 2, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3a8ac4';
      ctx.beginPath(); ctx.arc(S / 2, S / 2, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6a6a70';
      ctx.beginPath(); ctx.arc(S / 2, S / 2, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(150,210,255,0.6)';
      const spray = 3 + f;
      ctx.fillRect(S / 2 - 1, S / 2 - spray, 2, spray);
      ctx.fillStyle = 'rgba(200,230,255,0.5)';
      ctx.fillRect(S / 2 - 2 - f, S / 2 - 1, 1, 1);
      ctx.fillRect(S / 2 + 2 + f, S / 2 - 1, 1, 1);
      this.tileCache[`proc_fountain_${f}`] = canvas;
    }
  },

  _buildWellTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    ctx.fillStyle = '#9a8a7a';
    ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = '#6a6a70';
    ctx.beginPath(); ctx.arc(S / 2, S / 2 + 2, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a3a5a';
    ctx.beginPath(); ctx.arc(S / 2, S / 2 + 2, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5a3a18';
    ctx.fillRect(S / 2 - 1, S / 2 - 10, 2, 10);
    ctx.fillRect(S / 2 - 6, S / 2 - 10, 12, 2);
    this.tileCache['proc_well_0'] = canvas;
  },

  _buildFenceTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    ctx.fillStyle = '#9a8a7a';
    ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = 'rgba(60,50,40,0.3)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        ctx.strokeRect(c * 8 + (r % 2 === 0 ? 0 : 4), r * 8, 8, 8);
      }
    }
    ctx.fillStyle = '#8b6935';
    ctx.fillRect(2, 10, 3, 18);
    ctx.fillRect(S - 5, 10, 3, 18);
    ctx.fillRect(S / 2 - 1, 10, 3, 18);
    ctx.fillStyle = '#a07840';
    ctx.fillRect(0, 12, S, 3);
    ctx.fillRect(0, 22, S, 3);
    this.tileCache['proc_fence_0'] = canvas;
  },

  _buildGardenTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    ctx.fillStyle = '#5a3a18';
    ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = '#3a6a25';
    for (let r = 0; r < 4; r++) {
      ctx.fillRect(2, r * 8 + 1, S - 4, 4);
    }
    ctx.fillStyle = '#d44';
    ctx.fillRect(6, 2, 3, 3);
    ctx.fillRect(20, 10, 3, 3);
    ctx.fillStyle = '#fa0';
    ctx.fillRect(14, 18, 3, 3);
    this.tileCache['proc_garden_0'] = canvas;
  },

  _buildSignTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    ctx.fillStyle = '#9a8a7a';
    ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = 'rgba(60,50,40,0.3)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        ctx.strokeRect(c * 8 + (r % 2 === 0 ? 0 : 4), r * 8, 8, 8);
      }
    }
    ctx.fillStyle = '#5a3a18';
    ctx.fillRect(S / 2 - 1, 14, 3, 18);
    ctx.fillStyle = '#a07840';
    ctx.fillRect(S / 2 - 8, 6, 16, 10);
    ctx.strokeStyle = '#6b4423';
    ctx.lineWidth = 1;
    ctx.strokeRect(S / 2 - 8, 6, 16, 10);
    ctx.fillStyle = '#333';
    ctx.font = '6px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('INFO', S / 2, 14);
    this.tileCache['proc_sign_0'] = canvas;
  },

  _buildSignInnTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    // Cobblestone base
    ctx.fillStyle = '#9a8a7a';
    ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = 'rgba(60,50,40,0.3)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        ctx.strokeRect(c * 8 + (r % 2 === 0 ? 0 : 4), r * 8, 8, 8);
      }
    }
    // Wooden post
    ctx.fillStyle = '#5a3a18';
    ctx.fillRect(S / 2 - 1, 14, 3, 18);
    // Sign board
    ctx.fillStyle = '#8a6a3a';
    ctx.fillRect(S / 2 - 8, 6, 16, 10);
    ctx.strokeStyle = '#6b4423';
    ctx.lineWidth = 1;
    ctx.strokeRect(S / 2 - 8, 6, 16, 10);
    // Crescent moon icon
    ctx.fillStyle = '#ddeeff';
    ctx.beginPath();
    ctx.arc(S / 2, 11, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a6a3a';
    ctx.beginPath();
    ctx.arc(S / 2 + 2, 10, 3.5, 0, Math.PI * 2);
    ctx.fill();
    this.tileCache['proc_signinn_0'] = canvas;
  },

  _buildSignWeaponTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    // Cobblestone base
    ctx.fillStyle = '#9a8a7a';
    ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = 'rgba(60,50,40,0.3)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        ctx.strokeRect(c * 8 + (r % 2 === 0 ? 0 : 4), r * 8, 8, 8);
      }
    }
    // Wooden post
    ctx.fillStyle = '#5a3a18';
    ctx.fillRect(S / 2 - 1, 14, 3, 18);
    // Sign board
    ctx.fillStyle = '#8a3030';
    ctx.fillRect(S / 2 - 8, 6, 16, 10);
    ctx.strokeStyle = '#6b2020';
    ctx.lineWidth = 1;
    ctx.strokeRect(S / 2 - 8, 6, 16, 10);
    // Crossed swords icon
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(S / 2 - 5, 8);
    ctx.lineTo(S / 2 + 5, 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(S / 2 + 5, 8);
    ctx.lineTo(S / 2 - 5, 14);
    ctx.stroke();
    // Small diamond hilts
    ctx.fillStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(S / 2 - 5, 8);
    ctx.lineTo(S / 2 - 4, 7);
    ctx.lineTo(S / 2 - 3, 8);
    ctx.lineTo(S / 2 - 4, 9);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(S / 2 + 5, 8);
    ctx.lineTo(S / 2 + 6, 7);
    ctx.lineTo(S / 2 + 7, 8);
    ctx.lineTo(S / 2 + 6, 9);
    ctx.closePath();
    ctx.fill();
    this.tileCache['proc_signweapon_0'] = canvas;
  },

  _buildSignItemTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    // Cobblestone base
    ctx.fillStyle = '#9a8a7a';
    ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = 'rgba(60,50,40,0.3)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        ctx.strokeRect(c * 8 + (r % 2 === 0 ? 0 : 4), r * 8, 8, 8);
      }
    }
    // Wooden post
    ctx.fillStyle = '#5a3a18';
    ctx.fillRect(S / 2 - 1, 14, 3, 18);
    // Sign board
    ctx.fillStyle = '#3a6a3a';
    ctx.fillRect(S / 2 - 8, 6, 16, 10);
    ctx.strokeStyle = '#2a5a2a';
    ctx.lineWidth = 1;
    ctx.strokeRect(S / 2 - 8, 6, 16, 10);
    // Potion bottle icon
    ctx.fillStyle = '#88ddff';
    // Bottle neck
    ctx.fillRect(S / 2 - 1, 7, 2, 3);
    // Bottle body (trapezoid as filled path)
    ctx.beginPath();
    ctx.moveTo(S / 2 - 1, 10);
    ctx.lineTo(S / 2 - 3, 14);
    ctx.lineTo(S / 2 + 3, 14);
    ctx.lineTo(S / 2 + 1, 10);
    ctx.closePath();
    ctx.fill();
    // Cork / stopper
    ctx.fillStyle = '#a07840';
    ctx.fillRect(S / 2 - 1, 7, 2, 1);
    this.tileCache['proc_signitem_0'] = canvas;
  },

  _buildSignSpecialTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    // Cobblestone base
    ctx.fillStyle = '#9a8a7a';
    ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = 'rgba(60,50,40,0.3)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        ctx.strokeRect(c * 8 + (r % 2 === 0 ? 0 : 4), r * 8, 8, 8);
      }
    }
    // Wooden post
    ctx.fillStyle = '#5a3a18';
    ctx.fillRect(S / 2 - 1, 14, 3, 18);
    // Sign board
    ctx.fillStyle = '#5a3a7a';
    ctx.fillRect(S / 2 - 8, 6, 16, 10);
    ctx.strokeStyle = '#4a2a6a';
    ctx.lineWidth = 1;
    ctx.strokeRect(S / 2 - 8, 6, 16, 10);
    // Gold star icon
    ctx.fillStyle = '#ffd700';
    const cx = S / 2;
    const cy = 11;
    const or = 4;
    const ir = 1.5;
    ctx.beginPath();
    for (let p = 0; p < 5; p++) {
      // Outer point
      const outerAngle = -Math.PI / 2 + p * (2 * Math.PI / 5);
      const ox = cx + or * Math.cos(outerAngle);
      const oy = cy + or * Math.sin(outerAngle);
      if (p === 0) ctx.moveTo(ox, oy);
      else ctx.lineTo(ox, oy);
      // Inner point
      const innerAngle = outerAngle + Math.PI / 5;
      const ix = cx + ir * Math.cos(innerAngle);
      const iy = cy + ir * Math.sin(innerAngle);
      ctx.lineTo(ix, iy);
    }
    ctx.closePath();
    ctx.fill();
    this.tileCache['proc_signspecial_0'] = canvas;
  },

  _buildRoofTile() {
    for (let v = 0; v < 2; v++) {
      const { canvas, ctx } = this._makeTile();
      const S = TILE_SIZE;
      ctx.fillStyle = v === 0 ? '#b04030' : '#386838';
      ctx.fillRect(0, 0, S, S);
      ctx.strokeStyle = v === 0 ? '#903020' : '#285028';
      ctx.lineWidth = 1;
      for (let py = 0; py < S; py += 6) {
        ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(S, py); ctx.stroke();
      }
      ctx.fillStyle = v === 0 ? 'rgba(180,80,60,0.3)' : 'rgba(60,120,60,0.3)';
      for (let py = 0; py < S; py += 6) {
        for (let px = (py / 6 % 2) * 8; px < S; px += 16) {
          ctx.fillRect(px, py, 8, 6);
        }
      }
      this.tileCache[`proc_roof_${v}`] = canvas;
    }
  },

  _buildInnBedTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    ctx.fillStyle = '#c49a6c';
    ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = '#5a3a18';
    ctx.fillRect(4, 4, S - 8, S - 6);
    ctx.fillStyle = '#eee8d8';
    ctx.fillRect(6, 6, S - 12, S - 12);
    ctx.fillStyle = '#8b2252';
    ctx.fillRect(6, S - 12, S - 12, 8);
    ctx.fillStyle = '#e0d0b0';
    ctx.fillRect(8, 4, 8, 6);
    this.tileCache['proc_innbed_0'] = canvas;
  },

  _buildBookshelfTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    ctx.fillStyle = '#5a3a18';
    ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = '#7a5a2a';
    ctx.fillRect(2, 0, S - 4, S);
    const colors = ['#c22', '#28c', '#2a2', '#cc2', '#c2c', '#2cc', '#a52', '#55a'];
    for (let row = 0; row < 4; row++) {
      const sy = row * 8;
      ctx.fillStyle = '#6b4423';
      ctx.fillRect(2, sy + 7, S - 4, 1);
      for (let b = 0; b < 5; b++) {
        ctx.fillStyle = colors[(row * 5 + b) % colors.length];
        ctx.fillRect(4 + b * 5, sy + 1, 4, 6);
      }
    }
    this.tileCache['proc_bookshelf_0'] = canvas;
  },

  _buildTownFlowersTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    ctx.fillStyle = '#9a8a7a';
    ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = 'rgba(60,50,40,0.3)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        ctx.strokeRect(c * 8 + (r % 2 === 0 ? 0 : 4), r * 8, 8, 8);
      }
    }
    const flowerColors = ['#ff6b8a', '#ffaa44', '#aa66ff', '#44ccff', '#ffee44'];
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = flowerColors[i];
      const fx = (i * 11 + 3) % (S - 4);
      const fy = (i * 7 + 5) % (S - 4);
      ctx.beginPath(); ctx.arc(fx + 2, fy + 2, 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffee88';
      ctx.fillRect(fx + 1, fy + 1, 2, 2);
    }
    this.tileCache['proc_townflowers_0'] = canvas;
  },

  _buildDockTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    ctx.fillStyle = '#1a5c94';
    ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = '#a07840';
    ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = '#806030';
    ctx.lineWidth = 1;
    for (let py = 0; py < S; py += 6) {
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(S, py); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(100,70,30,0.2)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(8, S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(24, 0); ctx.lineTo(24, S); ctx.stroke();
    this.tileCache['proc_dock_0'] = canvas;
  },

  _buildStoneCircleTile() {
    const { canvas, ctx } = this._makeTile();
    const S = TILE_SIZE;
    ctx.fillStyle = '#4a8c3f';
    ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = '#7a7a80';
    ctx.fillRect(S / 2 - 5, 4, 10, 24);
    ctx.fillStyle = '#8a8a90';
    ctx.fillRect(S / 2 - 4, 5, 8, 22);
    ctx.fillStyle = 'rgba(150,150,200,0.2)';
    ctx.fillRect(S / 2 - 3, 6, 3, 20);
    ctx.strokeStyle = 'rgba(60,60,80,0.3)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(S / 2 - 2, 10);
    ctx.lineTo(S / 2 + 2, 14);
    ctx.moveTo(S / 2 + 1, 18);
    ctx.lineTo(S / 2 - 1, 22);
    ctx.stroke();
    this.tileCache['proc_stonecircle_0'] = canvas;
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
      // Town interior tiles
      case TILE.COBBLE:       return this.tileCache[`proc_cobble_${h % 2}`];
      case TILE.WOOD_FLOOR:   return this.tileCache['proc_woodfloor_0'];
      case TILE.WALL:         return this.tileCache['proc_wall_0'];
      case TILE.WALL_TOP:     return this.tileCache['proc_walltop_0'];
      case TILE.COUNTER:      return this.tileCache['proc_counter_0'];
      case TILE.DOOR:         return this.tileCache['proc_door_0'];
      case TILE.CARPET:       return this.tileCache[`proc_carpet_${h % 2}`];
      case TILE.TOWN_TREE:    return this.tileCache[`proc_towntree_${h % 2}`];
      case TILE.TOWN_EXIT:    return this.tileCache['proc_townexit_0'];
      case TILE.STREAM:       return null; // animated
      case TILE.TOWN_BRIDGE:  return this.tileCache['proc_townbridge_0'];
      case TILE.FOUNTAIN:     return null; // animated
      case TILE.WELL:         return this.tileCache['proc_well_0'];
      case TILE.FENCE:        return this.tileCache['proc_fence_0'];
      case TILE.GARDEN:       return this.tileCache['proc_garden_0'];
      case TILE.SIGN:         return this.tileCache['proc_sign_0'];
      case TILE.SIGN_INN:     return this.tileCache['proc_signinn_0'];
      case TILE.SIGN_WEAPON:  return this.tileCache['proc_signweapon_0'];
      case TILE.SIGN_ITEM:    return this.tileCache['proc_signitem_0'];
      case TILE.SIGN_SPECIAL: return this.tileCache['proc_signspecial_0'];
      case TILE.ROOF:         return this.tileCache[`proc_roof_${h % 2}`];
      case TILE.INN_BED:      return this.tileCache['proc_innbed_0'];
      case TILE.BOOKSHELF:    return this.tileCache['proc_bookshelf_0'];
      case TILE.TOWN_FLOWERS: return this.tileCache['proc_townflowers_0'];
      case TILE.DOCK:         return this.tileCache['proc_dock_0'];
      case TILE.STONE_CIRCLE: return this.tileCache['proc_stonecircle_0'];
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
    const animFrame = Math.floor(this.frameCount / 20) % 4;

    // Determine map dimensions
    const cols = ACTIVE_MAP ? ACTIVE_COLS : MAP_COLS;
    const rows = ACTIVE_MAP ? ACTIVE_ROWS : MAP_ROWS;

    // Camera offset to center player on screen
    let camX = player.x * TILE_SIZE - this.canvas.width / 2 + TILE_SIZE / 2;
    let camY = player.y * TILE_SIZE - this.canvas.height / 2 + TILE_SIZE / 2;

    // Clamp camera for small maps
    const mapPixelW = cols * TILE_SIZE;
    const mapPixelH = rows * TILE_SIZE;
    if (mapPixelW <= this.canvas.width) {
      camX = (mapPixelW - this.canvas.width) / 2;
    } else {
      camX = Math.max(0, Math.min(camX, mapPixelW - this.canvas.width));
    }
    if (mapPixelH <= this.canvas.height) {
      camY = (mapPixelH - this.canvas.height) / 2;
    } else {
      camY = Math.max(0, Math.min(camY, mapPixelH - this.canvas.height));
    }

    const startCol = Math.max(0, Math.floor(camX / TILE_SIZE));
    const startRow = Math.max(0, Math.floor(camY / TILE_SIZE));
    const endCol = Math.min(cols, startCol + Math.ceil(this.canvas.width / TILE_SIZE) + 2);
    const endRow = Math.min(rows, startRow + Math.ceil(this.canvas.height / TILE_SIZE) + 2);

    // Fill background
    ctx.fillStyle = ACTIVE_MAP ? '#111' : '#0a3a6a';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Store camera for player/NPC drawing
    this._camX = camX;
    this._camY = camY;

    for (let r = startRow; r < endRow; r++) {
      for (let c = startCol; c < endCol; c++) {
        const tile = getTile(c, r);
        const dx = Math.floor(c * TILE_SIZE - camX);
        const dy = Math.floor(r * TILE_SIZE - camY);

        // Animated tiles
        if (tile === TILE.WATER || tile === TILE.STREAM) {
          const key = tile === TILE.WATER
            ? (this.tileset ? 'sprite_water_0' : `proc_water_${animFrame}`)
            : `proc_stream_${animFrame}`;
          const cached = this.tileCache[key];
          if (cached) { ctx.drawImage(cached, dx, dy); }
          else { ctx.fillStyle = '#1a5c94'; ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE); }
          continue;
        }
        if (tile === TILE.FOUNTAIN) {
          const cached = this.tileCache[`proc_fountain_${animFrame}`];
          if (cached) { ctx.drawImage(cached, dx, dy); }
          else { ctx.fillStyle = '#3a8ac4'; ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE); }
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

    // Draw ship on the map when not boarded
    if (!ship.boarded) {
      const shipDx = Math.floor(ship.x * TILE_SIZE - camX);
      const shipDy = Math.floor(ship.y * TILE_SIZE - camY);
      if (shipDx > -TILE_SIZE && shipDx < this.canvas.width && shipDy > -TILE_SIZE && shipDy < this.canvas.height) {
        const shipTile = this.tileCache['proc_ship_0'];
        if (shipTile) this.ctx.drawImage(shipTile, shipDx, shipDy);
      }
    }
  },

  drawPlayer() {
    const ctx = this.ctx;
    const camX = this._camX != null ? this._camX : player.x * TILE_SIZE - this.canvas.width / 2 + TILE_SIZE / 2;
    const camY = this._camY != null ? this._camY : player.y * TILE_SIZE - this.canvas.height / 2 + TILE_SIZE / 2;
    const px = Math.floor(player.x * TILE_SIZE - camX);
    const py = Math.floor(player.y * TILE_SIZE - camY);

    if (ship.boarded) {
      // Draw ship tile under the princess
      const shipTile = this.tileCache['proc_ship_0'];
      if (shipTile) ctx.drawImage(shipTile, px, py);
    }

    // Princess sprite (shifted up 4px when sailing so she stands in the ship)
    const yOff = ship.boarded ? -4 : 0;

    // Body
    ctx.fillStyle = '#e84393';
    ctx.fillRect(px + 6, py + 8 + yOff, 20, 16);
    // Head
    ctx.fillStyle = '#ffeaa7';
    ctx.fillRect(px + 9, py + 1 + yOff, 14, 12);
    // Hair
    ctx.fillStyle = '#fdcb6e';
    ctx.fillRect(px + 7, py + 0 + yOff, 18, 5);
    // Eyes
    ctx.fillStyle = '#2d3436';
    const eyeOffset = player.direction === 'left' ? -2 : player.direction === 'right' ? 2 : 0;
    ctx.fillRect(px + 12 + eyeOffset, py + 5 + yOff, 2, 2);
    ctx.fillRect(px + 18 + eyeOffset, py + 5 + yOff, 2, 2);
    // Crown
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(px + 10, py - 3 + yOff, 12, 4);
    ctx.fillRect(px + 10, py - 6 + yOff, 3, 3);
    ctx.fillRect(px + 15, py - 7 + yOff, 3, 4);
    ctx.fillRect(px + 20, py - 6 + yOff, 3, 3);
    // Legs (hidden when boarded — inside the ship)
    if (!ship.boarded) {
      ctx.fillStyle = '#e84393';
      ctx.fillRect(px + 9, py + 24 + yOff, 5, 6);
      ctx.fillRect(px + 18, py + 24 + yOff, 5, 6);
    }
  },

  // NPC sprite palettes by type
  NPC_PALETTES: {
    elder:    { body: '#6a5acd', hair: '#ccc', skin: '#ffeaa7' },
    merchant: { body: '#d4a017', hair: '#8b4513', skin: '#ffeaa7' },
    soldier:  { body: '#4a6a8a', hair: '#333', skin: '#ffeaa7' },
    child:    { body: '#50c878', hair: '#fdcb6e', skin: '#ffeaa7' },
    druid:    { body: '#2e8b57', hair: '#556b2f', skin: '#deb887' },
    sailor:   { body: '#2a6aaa', hair: '#444', skin: '#ffeaa7' },
  },

  drawNPCs() {
    if (!ACTIVE_NPCS || ACTIVE_NPCS.length === 0) return;
    const ctx = this.ctx;
    const camX = this._camX != null ? this._camX : 0;
    const camY = this._camY != null ? this._camY : 0;

    for (const npc of ACTIVE_NPCS) {
      const sx = Math.floor(npc.x * TILE_SIZE - camX);
      const sy = Math.floor(npc.y * TILE_SIZE - camY);

      // Skip if off screen
      if (sx < -TILE_SIZE || sx > this.canvas.width || sy < -TILE_SIZE || sy > this.canvas.height) continue;

      const pal = this.NPC_PALETTES[npc.sprite] || this.NPC_PALETTES.elder;

      // Body
      ctx.fillStyle = pal.body;
      ctx.fillRect(sx + 6, sy + 8, 20, 16);
      // Head
      ctx.fillStyle = pal.skin;
      ctx.fillRect(sx + 9, sy + 1, 14, 12);
      // Hair
      ctx.fillStyle = pal.hair;
      ctx.fillRect(sx + 7, sy + 0, 18, 5);
      // Eyes
      ctx.fillStyle = '#2d3436';
      const eo = npc.direction === 'left' ? -2 : npc.direction === 'right' ? 2 : 0;
      ctx.fillRect(sx + 12 + eo, sy + 5, 2, 2);
      ctx.fillRect(sx + 18 + eo, sy + 5, 2, 2);
      // Legs
      ctx.fillStyle = pal.body;
      ctx.fillRect(sx + 9, sy + 24, 5, 6);
      ctx.fillRect(sx + 18, sy + 24, 5, 6);

      // Shopkeeper indicator
      if (npc.isShopkeeper) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('$', sx + TILE_SIZE / 2, sy - 2);
      }
    }

    // "!" indicator for facing NPC
    if (typeof NPC !== 'undefined' && NPC.hasFacingNPC && NPC.hasFacingNPC()) {
      const facing = NPC.getFacingNPC();
      if (facing) {
        const fx = Math.floor(facing.x * TILE_SIZE - camX);
        const fy = Math.floor(facing.y * TILE_SIZE - camY);
        ctx.fillStyle = '#ff0';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', fx + TILE_SIZE / 2, fy - 4);
      }
    }
  },

  drawDialogue() {
    if (typeof NPC === 'undefined' || !NPC.active) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const boxH = 100;
    const boxY = h - boxH - 10;
    const boxX = 10;
    const boxW = w - 20;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // NPC name
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(NPC.getCurrentName(), boxX + 14, boxY + 24);

    // Dialogue text
    ctx.fillStyle = '#fff';
    ctx.font = '15px sans-serif';
    const line = NPC.getCurrentLine();
    if (line) ctx.fillText(line, boxX + 14, boxY + 52);

    // Prompt
    ctx.fillStyle = '#aaa';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    const isLast = NPC.dialogueIndex >= NPC.active.dialogue.length - 1;
    ctx.fillText(isLast ? '[Enter to close]' : '[Enter to continue]', boxX + boxW - 14, boxY + boxH - 12);
  },

  drawShop() {
    if (typeof Shop === 'undefined' || !Shop.active) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const panelW = 420;
    const panelH = 340;
    const px = (w - panelW) / 2;
    const py = (h - panelH) / 2;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(px, py, panelW, panelH);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, panelW, panelH);

    // Title
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(Shop.shopName, w / 2, py + 28);

    // Gold
    ctx.fillStyle = '#ffd700';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Gold: ' + player.gold, px + panelW - 16, py + 28);

    // Item list
    ctx.textAlign = 'left';
    const listX = px + 16;
    const listY = py + 50;
    const rowH = 26;
    const maxVisible = 9;
    const scrollOffset = Math.max(0, Shop.cursor - maxVisible + 1);

    for (let i = 0; i < Math.min(Shop.items.length, maxVisible); i++) {
      const idx = i + scrollOffset;
      if (idx >= Shop.items.length) break;
      const item = Shop.items[idx];
      const iy = listY + i * rowH;
      const isSelected = idx === Shop.cursor;

      if (isSelected) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
        ctx.fillRect(listX - 4, iy - 4, panelW - 32, rowH);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('>', listX, iy + 13);
      }

      ctx.fillStyle = isSelected ? '#fff' : '#ccc';
      ctx.font = '14px sans-serif';
      ctx.fillText(item.name, listX + 18, iy + 13);

      ctx.fillStyle = player.gold >= item.price ? '#ffd700' : '#e74c3c';
      ctx.textAlign = 'right';
      ctx.fillText(item.price + 'G', px + panelW - 16, iy + 13);
      ctx.textAlign = 'left';
    }

    // Selected item description
    const sel = Shop.getSelectedItem();
    if (sel) {
      const descY = py + panelH - 50;
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(px + 10, descY - 8, panelW - 20, 36);
      ctx.fillStyle = '#aaa';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(sel.desc, px + 16, descY + 10);
    }

    // Shop message
    if (Shop.message) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(Shop.message, w / 2, py + panelH - 14);
    }

    // Controls hint
    ctx.fillStyle = '#666';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Up/Down: Select   Enter: Buy   Escape: Close', w / 2, py + panelH + 16);
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
    ctx.fillText('Name Your Princess', w / 2, 60);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Press ENTER to edit name, type new name + ENTER to confirm', w / 2, 95);

    // Center the entries vertically based on count
    const count = partyNames.length;
    const rowH = 70;
    const startY = h / 2 - (count * rowH) / 2;

    for (let i = 0; i < count; i++) {
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
      ctx.fillText(DEFAULT_PARTY[i].role, w / 2 - 180, y + 20);

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

  drawRecruitScreen(member, currentName, editingText) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Draw the map underneath for context
    this.drawMap();
    this.drawPlayer();

    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, w, h);

    // Panel dimensions
    const panelW = 460;
    const panelH = 320;
    const px = (w - panelW) / 2;
    const py = (h - panelH) / 2;

    // Panel background
    ctx.fillStyle = '#1a0533';
    ctx.fillRect(px, py, panelW, panelH);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.strokeRect(px, py, panelW, panelH);

    // Inner border
    ctx.strokeStyle = '#e84393';
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 4, py + 4, panelW - 8, panelH - 8);

    // Announcement
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'center';
    ctx.fillText('A New Ally Appears!', w / 2, py + 40);

    // Role
    ctx.fillStyle = '#e84393';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(member.role, w / 2, py + 70);

    // Name editing area
    ctx.fillStyle = '#888';
    ctx.font = '14px sans-serif';
    ctx.fillText('Name:', w / 2, py + 105);

    // Name box
    const nameBoxW = 280;
    const nameBoxH = 40;
    const nameBoxX = (w - nameBoxW) / 2;
    const nameBoxY = py + 115;
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(nameBoxX, nameBoxY, nameBoxW, nameBoxH);
    ctx.strokeStyle = editingText !== null ? '#ffd700' : '#e84393';
    ctx.lineWidth = 2;
    ctx.strokeRect(nameBoxX, nameBoxY, nameBoxW, nameBoxH);

    // Display name
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px serif';
    const displayName = editingText !== null ? editingText + '_' : currentName;
    ctx.fillText(displayName, w / 2, nameBoxY + 28);

    // Stats
    const statsY = nameBoxY + nameBoxH + 25;
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#aaa';

    // HP
    ctx.fillText('HP', w / 2 - 80, statsY);
    ctx.fillStyle = '#333';
    ctx.fillRect(w / 2 - 50, statsY - 12, 100, 14);
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(w / 2 - 50, statsY - 12, 100 * (member.hp / member.maxHp), 14);
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.fillText(member.hp + '/' + member.maxHp, w / 2 + 65, statsY);

    // MP
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.fillText('MP', w / 2 - 80, statsY + 28);
    ctx.fillStyle = '#333';
    ctx.fillRect(w / 2 - 50, statsY + 16, 100, 14);
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(w / 2 - 50, statsY + 16, 100 * (member.mp / member.maxMp), 14);
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.fillText(member.mp + '/' + member.maxMp, w / 2 + 65, statsY + 28);

    // Instructions
    ctx.fillStyle = '#aaa';
    ctx.font = '14px sans-serif';
    ctx.fillText('ENTER to edit name  |  ESCAPE to accept and recruit', w / 2, py + panelH - 20);
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
