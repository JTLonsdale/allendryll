const Game = {
  state: 'title', // title | naming | recruiting | playing | town | building | battle
  subState: null,  // null | 'dialogue' | 'shop'
  notification: null,
  notificationTimer: 0,
  editingName: null,
  partyNames: null,
  moveDelay: 0,
  recruitingMember: null,
  recruitingName: '',

  async init() {
    Renderer.init();
    Input.init();
    this.partyNames = [DEFAULT_PARTY[0].name];
    initTownCoords();
    this.loop();
  },

  showNotification(msg) {
    this.notification = msg;
    this.notificationTimer = 120;
  },

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  },

  update() {
    if (this.notificationTimer > 0) this.notificationTimer--;
    if (this.notificationTimer === 0) this.notification = null;
    if (typeof Shop !== 'undefined') Shop.update();

    // Battle system handles its own input
    if (this.state === 'battle') {
      Battle.update();
      return;
    }

    const key = Input.consume();

    if (this.state === 'title') {
      if (key === 'Enter') this.state = 'naming';
    } else if (this.state === 'naming') {
      this.updateNaming(key);
    } else if (this.state === 'recruiting') {
      this.updateRecruiting(key);
    } else if (this.state === 'playing') {
      this.updatePlaying(key);
    } else if (this.state === 'town') {
      this.updateTown(key);
    } else if (this.state === 'building') {
      this.updateBuilding(key);
    }
  },

  updateNaming(key) {
    if (this.editingName !== null) {
      if (key === 'Enter') {
        if (this.editingName.length > 0) {
          this.partyNames[0] = this.editingName;
        }
        this.editingName = null;
      } else if (key === 'Backspace') {
        this.editingName = this.editingName.slice(0, -1);
      } else if (key === 'Escape') {
        this.editingName = null;
      } else if (key && key.length === 1 && this.editingName.length < 12) {
        this.editingName += key;
      }
    } else {
      if (key === 'Enter') this.editingName = '';
      else if (key === 'Escape') {
        player.party[0].name = this.partyNames[0];
        this.state = 'playing';
      }
    }
  },

  updateRecruiting(key) {
    if (this.editingName !== null) {
      if (key === 'Enter') {
        if (this.editingName.length > 0) {
          this.recruitingName = this.editingName;
        }
        this.editingName = null;
      } else if (key === 'Backspace') {
        this.editingName = this.editingName.slice(0, -1);
      } else if (key === 'Escape') {
        this.editingName = null;
      } else if (key && key.length === 1 && this.editingName.length < 12) {
        this.editingName += key;
      }
    } else {
      if (key === 'Enter') this.editingName = '';
      else if (key === 'Escape') {
        this.recruitingMember.name = this.recruitingName;
        player.party.push(this.recruitingMember);
        this.showNotification(this.recruitingMember.name + ' joined the party!');
        this.recruitingMember = null;
        this.state = 'playing';
      }
    }
  },

  checkRecruitment() {
    const townKey = getTownAt(player.x, player.y);
    if (!townKey) return;

    const template = TOWN_RECRUITMENT[townKey];
    if (!template) return;

    const alreadyRecruited = player.party.some(m => m.role === template.role);
    if (alreadyRecruited) return;

    this.recruitingMember = JSON.parse(JSON.stringify(template));
    this.recruitingName = template.name;
    this.editingName = null;
    this.state = 'recruiting';
  },

  updatePlaying(key) {
    if (this.moveDelay > 0) { this.moveDelay--; return; }

    // Movement from held keys (faster when sailing)
    const moveSpeed = ship.boarded ? 4 : 8;
    let moved = false;
    if (Input.keys['ArrowUp'])         { moved = movePlayer(0, -1); this.moveDelay = moveSpeed; }
    else if (Input.keys['ArrowDown'])  { moved = movePlayer(0, 1);  this.moveDelay = moveSpeed; }
    else if (Input.keys['ArrowLeft'])  { moved = movePlayer(-1, 0); this.moveDelay = moveSpeed; }
    else if (Input.keys['ArrowRight']) { moved = movePlayer(1, 0);  this.moveDelay = moveSpeed; }

    if (moved && !ship.boarded) {
      // Check for random encounter
      if (checkRandomEncounter()) {
        this.state = 'battle';
        Battle.start();
        return;
      }

      // Check if player stepped on a town tile
      const tile = getTile(player.x, player.y);
      if (tile === TILE.TOWN) {
        const townId = TOWN_COORDS[player.x + ',' + player.y];
        if (townId) {
          enterTown(townId);
          this.state = 'town';
          this.showNotification(TOWNS.find(t => t.id === townId).name);
          return;
        }
      }

      // Check for recruitment
      this.checkRecruitment();
    }

    if (key === 's' || key === 'S') {
      Save.save().then(ok => this.showNotification(ok ? 'Game Saved!' : 'Save Failed!'));
    }
    if (key === 'l' || key === 'L') {
      Save.load().then(ok => {
        if (ok) {
          this.showNotification('Game Loaded!');
          if (Location.area === 'town') this.state = 'town';
          else if (Location.area === 'building') this.state = 'building';
          else this.state = 'playing';
        } else {
          this.showNotification('No Save Found!');
        }
      });
    }

    // Ship boarding/docking
    if (key === ' ') {
      if (!ship.boarded) {
        const dist = Math.abs(player.x - ship.x) + Math.abs(player.y - ship.y);
        if (dist <= 1) {
          player.x = ship.x;
          player.y = ship.y;
          ship.boarded = true;
          this.showNotification('Boarded the ship!');
        }
      } else {
        const landTiles = [TILE.SAND, TILE.GRASS, TILE.PATH, TILE.TOWN, TILE.BRIDGE, TILE.FLOWERS];
        const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
        let docked = false;
        for (const [ddx, ddy] of dirs) {
          const lx = player.x + ddx;
          const ly = player.y + ddy;
          if (lx < 0 || ly < 0 || lx >= MAP_COLS || ly >= MAP_ROWS) continue;
          const tile = getTile(lx, ly);
          if (landTiles.includes(tile)) {
            player.x = lx;
            player.y = ly;
            ship.boarded = false;
            docked = true;
            this.showNotification('Docked the ship.');
            break;
          }
        }
        if (!docked) {
          this.showNotification('No land nearby to dock!');
        }
      }
    }
  },

  updateTown(key) {
    if (this.subState === 'dialogue') {
      this.updateDialogue(key);
      return;
    }
    if (this.subState === 'shop') {
      this.updateShop(key);
      return;
    }

    if (this.moveDelay > 0) { this.moveDelay--; return; }

    let moved = false;
    if (Input.keys['ArrowUp'])         { moved = movePlayer(0, -1); this.moveDelay = 8; }
    else if (Input.keys['ArrowDown'])   { moved = movePlayer(0, 1);  this.moveDelay = 8; }
    else if (Input.keys['ArrowLeft'])   { moved = movePlayer(-1, 0); this.moveDelay = 8; }
    else if (Input.keys['ArrowRight'])  { moved = movePlayer(1, 0);  this.moveDelay = 8; }

    if (moved) {
      const tile = getTile(player.x, player.y);
      if (tile === TILE.TOWN_EXIT) {
        exitTown();
        this.state = 'playing';
        return;
      }
      if (tile === TILE.DOOR) {
        const building = findBuildingAtDoor(player.x, player.y);
        if (building) {
          enterBuilding(building);
          this.state = 'building';
          this.showNotification(building.name);
          return;
        }
      }
    }

    if (key === 'Enter') {
      const npc = NPC.getFacingNPC();
      if (npc && NPC.interact(npc)) {
        this.subState = 'dialogue';
        return;
      }
    }

    if (key === 's' || key === 'S') {
      Save.save().then(ok => this.showNotification(ok ? 'Game Saved!' : 'Save Failed!'));
    }
    if (key === 'l' || key === 'L') {
      Save.load().then(ok => {
        if (ok) {
          this.showNotification('Game Loaded!');
          if (Location.area === 'town') this.state = 'town';
          else if (Location.area === 'building') this.state = 'building';
          else this.state = 'playing';
        } else {
          this.showNotification('No Save Found!');
        }
      });
    }
  },

  updateBuilding(key) {
    if (this.subState === 'dialogue') {
      this.updateDialogue(key);
      return;
    }
    if (this.subState === 'shop') {
      this.updateShop(key);
      return;
    }

    if (this.moveDelay > 0) { this.moveDelay--; return; }

    let moved = false;
    if (Input.keys['ArrowUp'])         { moved = movePlayer(0, -1); this.moveDelay = 8; }
    else if (Input.keys['ArrowDown'])   { moved = movePlayer(0, 1);  this.moveDelay = 8; }
    else if (Input.keys['ArrowLeft'])   { moved = movePlayer(-1, 0); this.moveDelay = 8; }
    else if (Input.keys['ArrowRight'])  { moved = movePlayer(1, 0);  this.moveDelay = 8; }

    if (moved) {
      const tile = getTile(player.x, player.y);
      if (tile === TILE.DOOR) {
        exitBuilding();
        this.state = 'town';
        return;
      }
    }

    if (key === 'Enter') {
      const npc = NPC.getFacingNPC();
      if (npc && NPC.interact(npc)) {
        this.subState = 'dialogue';
        return;
      }
    }

    if (key === 's' || key === 'S') {
      Save.save().then(ok => this.showNotification(ok ? 'Game Saved!' : 'Save Failed!'));
    }
    if (key === 'l' || key === 'L') {
      Save.load().then(ok => {
        if (ok) {
          this.showNotification('Game Loaded!');
          if (Location.area === 'town') this.state = 'town';
          else if (Location.area === 'building') this.state = 'building';
          else this.state = 'playing';
        } else {
          this.showNotification('No Save Found!');
        }
      });
    }
  },

  updateDialogue(key) {
    if (key === 'Enter') {
      const result = NPC.advance();
      if (result && result.done) {
        this.subState = null;
        if (result.shopId) {
          Shop.open(result.shopId);
          this.subState = 'shop';
        }
      }
    }
    if (key === 'Escape') {
      NPC.close();
      this.subState = null;
    }
  },

  updateShop(key) {
    if (key === 'Escape') {
      Shop.close();
      this.subState = null;
      return;
    }
    if (key === 'ArrowUp') Shop.moveCursor(-1);
    if (key === 'ArrowDown') Shop.moveCursor(1);
    if (key === 'Enter') Shop.buy();
  },

  render() {
    Renderer.clear();

    if (this.state === 'title') {
      Renderer.drawTitleScreen();
    } else if (this.state === 'naming') {
      Renderer.drawNameEntry(this.partyNames, 0, this.editingName);
    } else if (this.state === 'recruiting') {
      Renderer.drawRecruitScreen(this.recruitingMember, this.recruitingName, this.editingName);
    } else if (this.state === 'playing') {
      Renderer.drawMap();
      Renderer.drawPlayer();
      HUD.draw(Renderer.ctx, Renderer.canvas);
    } else if (this.state === 'battle') {
      Battle.render(Renderer.ctx, Renderer.canvas);
    } else if (this.state === 'town' || this.state === 'building') {
      Renderer.drawMap();
      Renderer.drawNPCs();
      Renderer.drawPlayer();
      HUD.draw(Renderer.ctx, Renderer.canvas);
      this.drawLocationLabel();
      if (this.subState === 'dialogue') {
        Renderer.drawDialogue();
      } else if (this.subState === 'shop') {
        Renderer.drawShop();
      }
    }

    if (this.notification) {
      Renderer.drawNotification(this.notification);
    }
  },

  drawLocationLabel() {
    const ctx = Renderer.ctx;
    let label = '';
    if (Location.area === 'town' && Location.townId) {
      const town = TOWNS.find(t => t.id === Location.townId);
      if (town) label = town.name;
    } else if (Location.area === 'building' && Location.townId && Location.buildingId) {
      const town = TOWNS.find(t => t.id === Location.townId);
      if (town) {
        const b = town.buildings.find(bl => bl.id === Location.buildingId);
        label = b ? b.name : '';
      }
    }
    if (!label) return;

    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(10, Renderer.canvas.height - 32, ctx.measureText(label).width + 24, 26);
    ctx.fillStyle = '#ffd700';
    ctx.fillText(label, 22, Renderer.canvas.height - 14);
  }
};

window.addEventListener('DOMContentLoaded', () => Game.init());
