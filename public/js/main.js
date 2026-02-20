const Game = {
  state: 'title', // title | naming | recruiting | playing | battle
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
    if (this.moveDelay > 0) {
      this.moveDelay--;
      return;
    }

    // Movement from held keys (faster when sailing), check for random encounters
    const moveSpeed = ship.boarded ? 4 : 8;
    let moved = false;
    if (Input.keys['ArrowUp'])         { moved = movePlayer(0, -1); this.moveDelay = moveSpeed; }
    else if (Input.keys['ArrowDown'])  { moved = movePlayer(0, 1);  this.moveDelay = moveSpeed; }
    else if (Input.keys['ArrowLeft'])  { moved = movePlayer(-1, 0); this.moveDelay = moveSpeed; }
    else if (Input.keys['ArrowRight']) { moved = movePlayer(1, 0);  this.moveDelay = moveSpeed; }

    // Check for random encounter after a successful move (not while sailing)
    if (moved && !ship.boarded && checkRandomEncounter()) {
      this.state = 'battle';
      Battle.start();
      return;
    }

    // Check for recruitment after movement (not while sailing)
    if (moved && !ship.boarded) {
      this.checkRecruitment();
    }

    if (key === 's' || key === 'S') {
      Save.save().then(ok => this.showNotification(ok ? 'Game Saved!' : 'Save Failed!'));
    }
    if (key === 'l' || key === 'L') {
      Save.load().then(ok => this.showNotification(ok ? 'Game Loaded!' : 'No Save Found!'));
    }

    // Ship boarding/docking
    if (key === ' ') {
      if (!ship.boarded) {
        // Board the ship if adjacent (Manhattan distance <= 1)
        const dist = Math.abs(player.x - ship.x) + Math.abs(player.y - ship.y);
        if (dist <= 1) {
          player.x = ship.x;
          player.y = ship.y;
          ship.boarded = true;
          this.showNotification('Boarded the ship!');
        }
      } else {
        // Dock: find adjacent walkable land tile
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
    }

    if (this.notification) {
      Renderer.drawNotification(this.notification);
    }
  }
};

window.addEventListener('DOMContentLoaded', () => Game.init());
