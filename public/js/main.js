const Game = {
  state: 'title', // title | naming | playing | battle
  notification: null,
  notificationTimer: 0,
  nameIndex: 0,
  editingName: null,
  partyNames: null,
  moveDelay: 0,

  async init() {
    Renderer.init();
    Input.init();
    this.partyNames = DEFAULT_PARTY.map(p => p.name);

    // Use procedural tile rendering (rich hand-drawn tiles)
    // Kenney spritesheet available at assets/Spritesheet/ but procedural looks better

    this.loop();
  },

  showNotification(msg) {
    this.notification = msg;
    this.notificationTimer = 120; // ~2 seconds at 60fps
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
    } else if (this.state === 'playing') {
      this.updatePlaying(key);
    }
  },

  updateNaming(key) {
    if (this.editingName !== null) {
      // Currently editing a name
      if (key === 'Enter') {
        if (this.editingName.length > 0) {
          this.partyNames[this.nameIndex] = this.editingName;
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
      if (key === 'ArrowUp') this.nameIndex = (this.nameIndex + 4) % 5;
      else if (key === 'ArrowDown') this.nameIndex = (this.nameIndex + 1) % 5;
      else if (key === 'Enter') this.editingName = '';
      else if (key === 'Escape') {
        // Apply names and start game
        for (let i = 0; i < 5; i++) {
          player.party[i].name = this.partyNames[i];
        }
        this.state = 'playing';
      }
    }
  },

  updatePlaying(key) {
    if (this.moveDelay > 0) {
      this.moveDelay--;
      return;
    }

    // Movement from held keys — check for random encounter after each step
    let moved = false;
    if (Input.keys['ArrowUp'])         { moved = movePlayer(0, -1); this.moveDelay = 8; }
    else if (Input.keys['ArrowDown'])  { moved = movePlayer(0, 1);  this.moveDelay = 8; }
    else if (Input.keys['ArrowLeft'])  { moved = movePlayer(-1, 0); this.moveDelay = 8; }
    else if (Input.keys['ArrowRight']) { moved = movePlayer(1, 0);  this.moveDelay = 8; }

    // Check for random encounter after a successful move
    if (moved && checkRandomEncounter()) {
      this.state = 'battle';
      Battle.start();
      return;
    }

    // Save/Load
    if (key === 's' || key === 'S') {
      Save.save().then(ok => this.showNotification(ok ? 'Game Saved!' : 'Save Failed!'));
    }
    if (key === 'l' || key === 'L') {
      Save.load().then(ok => this.showNotification(ok ? 'Game Loaded!' : 'No Save Found!'));
    }
  },

  render() {
    Renderer.clear();

    if (this.state === 'title') {
      Renderer.drawTitleScreen();
    } else if (this.state === 'naming') {
      Renderer.drawNameEntry(this.partyNames, this.nameIndex, this.editingName);
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
