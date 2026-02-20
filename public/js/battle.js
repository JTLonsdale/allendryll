// Battle System
// Sub-states: transition, menu, spell_menu, player_attack, player_spell, enemy_turn, victory, defeat
// Uses Web Audio API for procedural sound effects

const Battle = {
  // Battle state
  state: 'transition',  // current sub-state
  enemy: null,           // current enemy (deep copy)
  menuIndex: 0,          // selected menu option
  spellIndex: 0,         // selected spell option
  turnTimer: 0,          // timer for animations
  log: [],               // battle log messages
  damagePopups: [],      // floating damage numbers
  transitionAngle: 0,    // spiral transition effect angle
  transitionRadius: 0,   // spiral transition radius
  victoryXp: 0,          // XP gained on victory
  victoryGold: 0,        // gold gained on victory
  screenCapture: null,   // captured overworld image for transition

  // Audio context (created on first use)
  audioCtx: null,

  // Menu options
  MENU_OPTIONS: ['Attack', 'Spell', 'Item', 'Run'],

  // ===== AUDIO SYSTEM =====

  initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Resume if suspended (browsers require user gesture)
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  },

  playTone(frequency, duration, type, volume, startDelay) {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type || 'square';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume || 0.1, ctx.currentTime + (startDelay || 0));
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (startDelay || 0) + duration);
    osc.start(ctx.currentTime + (startDelay || 0));
    osc.stop(ctx.currentTime + (startDelay || 0) + duration);
  },

  soundBattleStart() {
    this.initAudio();
    // Dramatic descending chord
    this.playTone(440, 0.3, 'square', 0.08, 0);
    this.playTone(349, 0.3, 'square', 0.08, 0);
    this.playTone(294, 0.3, 'sawtooth', 0.06, 0);
    this.playTone(220, 0.5, 'square', 0.08, 0.15);
    this.playTone(175, 0.5, 'sawtooth', 0.06, 0.15);
    this.playTone(165, 0.6, 'square', 0.1, 0.35);
  },

  soundAttackHit() {
    if (!this.audioCtx) return;
    // Short impact noise burst
    const ctx = this.audioCtx;
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = 0.15;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    // Add a low thud
    this.playTone(80, 0.12, 'sine', 0.12, 0);
  },

  soundSpellCast() {
    if (!this.audioCtx) return;
    // Magical ascending tone
    this.playTone(330, 0.15, 'sine', 0.08, 0);
    this.playTone(440, 0.15, 'sine', 0.08, 0.1);
    this.playTone(554, 0.15, 'sine', 0.08, 0.2);
    this.playTone(660, 0.2, 'triangle', 0.1, 0.3);
    this.playTone(880, 0.3, 'sine', 0.06, 0.4);
  },

  soundVictory() {
    if (!this.audioCtx) return;
    // Triumphant ascending fanfare
    this.playTone(262, 0.15, 'square', 0.08, 0);
    this.playTone(330, 0.15, 'square', 0.08, 0.15);
    this.playTone(392, 0.15, 'square', 0.08, 0.3);
    this.playTone(523, 0.35, 'square', 0.1, 0.45);
    this.playTone(659, 0.15, 'triangle', 0.06, 0.45);
    this.playTone(784, 0.4, 'square', 0.1, 0.7);
    this.playTone(523, 0.4, 'triangle', 0.06, 0.7);
  },

  soundDefeat() {
    if (!this.audioCtx) return;
    // Sad descending tones
    this.playTone(392, 0.3, 'sine', 0.08, 0);
    this.playTone(330, 0.3, 'sine', 0.08, 0.25);
    this.playTone(262, 0.3, 'sine', 0.08, 0.5);
    this.playTone(196, 0.5, 'sine', 0.1, 0.75);
  },

  soundRunAway() {
    if (!this.audioCtx) return;
    // Quick ascending escape sound
    this.playTone(200, 0.1, 'square', 0.06, 0);
    this.playTone(300, 0.1, 'square', 0.06, 0.08);
    this.playTone(400, 0.1, 'square', 0.06, 0.16);
  },

  // ===== BATTLE START =====

  start() {
    this.initAudio();
    this.enemy = getRandomEnemy();
    this.state = 'transition';
    this.menuIndex = 0;
    this.spellIndex = 0;
    this.turnTimer = 0;
    this.log = [];
    this.damagePopups = [];
    this.transitionAngle = 0;
    this.transitionRadius = 0;
    this.victoryXp = 0;
    this.victoryGold = 0;

    // Capture the current screen for the spiral transition
    const canvas = Renderer.canvas;
    this.screenCapture = Renderer.ctx.getImageData(0, 0, canvas.width, canvas.height);

    this.soundBattleStart();
    this.addLog('A wild ' + this.enemy.name + ' appears!');
  },

  addLog(message) {
    this.log.push(message);
    // Keep only last 4 messages
    if (this.log.length > 4) {
      this.log.shift();
    }
  },

  addDamagePopup(x, y, text, color) {
    this.damagePopups.push({
      x: x, y: y,
      text: text,
      color: color || '#fff',
      life: 60  // frames to live
    });
  },

  // ===== UPDATE =====

  update() {
    const key = Input.consume();

    // Update damage popups
    for (let i = this.damagePopups.length - 1; i >= 0; i--) {
      this.damagePopups[i].life--;
      this.damagePopups[i].y -= 0.8;
      if (this.damagePopups[i].life <= 0) {
        this.damagePopups.splice(i, 1);
      }
    }

    switch (this.state) {
      case 'transition':
        this.updateTransition();
        break;
      case 'menu':
        this.updateMenu(key);
        break;
      case 'spell_menu':
        this.updateSpellMenu(key);
        break;
      case 'player_attack':
        this.updatePlayerAttack();
        break;
      case 'player_spell':
        this.updatePlayerSpell();
        break;
      case 'enemy_turn':
        this.updateEnemyTurn();
        break;
      case 'run_success':
        this.turnTimer++;
        if (this.turnTimer > 30) {
          Game.state = 'playing';
        }
        break;
      case 'victory':
        this.updateVictory(key);
        break;
      case 'defeat':
        this.updateDefeat(key);
        break;
    }
  },

  updateTransition() {
    this.turnTimer++;
    this.transitionAngle += 0.15;
    this.transitionRadius += 5;
    // Transition lasts ~90 frames (~1.5 seconds)
    if (this.turnTimer > 90) {
      this.state = 'menu';
      this.turnTimer = 0;
    }
  },

  updateMenu(key) {
    if (key === 'ArrowUp') {
      this.menuIndex = (this.menuIndex + 3) % 4;
    } else if (key === 'ArrowDown') {
      this.menuIndex = (this.menuIndex + 1) % 4;
    } else if (key === 'Enter') {
      this.selectMenuOption();
    }
  },

  selectMenuOption() {
    const option = this.MENU_OPTIONS[this.menuIndex];
    const leader = player.party[0];

    switch (option) {
      case 'Attack':
        this.state = 'player_attack';
        this.turnTimer = 0;
        break;

      case 'Spell':
        if (leader.spells && leader.spells.length > 0) {
          this.state = 'spell_menu';
          this.spellIndex = 0;
        } else {
          this.addLog(leader.name + ' has no spells!');
        }
        break;

      case 'Item':
        // Items not yet implemented
        this.addLog('No items to use!');
        break;

      case 'Run':
        this.attemptRun();
        break;
    }
  },

  updateSpellMenu(key) {
    const leader = player.party[0];
    const spells = leader.spells || [];

    if (key === 'ArrowUp') {
      this.spellIndex = (this.spellIndex + spells.length - 1) % spells.length;
    } else if (key === 'ArrowDown') {
      this.spellIndex = (this.spellIndex + 1) % spells.length;
    } else if (key === 'Enter') {
      const spell = spells[this.spellIndex];
      if (leader.mp >= spell.cost) {
        this.state = 'player_spell';
        this.turnTimer = 0;
      } else {
        this.addLog('Not enough MP for ' + spell.name + '!');
      }
    } else if (key === 'Escape') {
      this.state = 'menu';
    }
  },

  updatePlayerAttack() {
    this.turnTimer++;
    if (this.turnTimer === 15) {
      // Calculate damage
      const leader = player.party[0];
      const baseDamage = 8 + Math.floor(Math.random() * 8); // 8-15
      const attackBonus = Math.floor(leader.attack * 0.5);
      const damage = Math.max(1, baseDamage + attackBonus - this.enemy.defense);
      this.enemy.hp = Math.max(0, this.enemy.hp - damage);
      this.addLog(leader.name + ' attacks for ' + damage + ' damage!');
      this.addDamagePopup(400, 180, '-' + damage, '#ff4444');
      this.soundAttackHit();
    }
    if (this.turnTimer > 45) {
      this.turnTimer = 0;
      if (this.enemy.hp <= 0) {
        this.triggerVictory();
      } else {
        this.state = 'enemy_turn';
      }
    }
  },

  updatePlayerSpell() {
    this.turnTimer++;
    if (this.turnTimer === 20) {
      const leader = player.party[0];
      const spell = leader.spells[this.spellIndex];
      leader.mp -= spell.cost;
      const damage = spell.damage + Math.floor(Math.random() * 6) - 3; // spell.damage +/- 3
      const finalDamage = Math.max(1, damage - Math.floor(this.enemy.defense * 0.5));
      this.enemy.hp = Math.max(0, this.enemy.hp - finalDamage);
      this.addLog(leader.name + ' casts ' + spell.name + ' for ' + finalDamage + ' damage!');
      this.addDamagePopup(400, 180, '-' + finalDamage, '#aa66ff');
      this.soundSpellCast();
    }
    if (this.turnTimer > 55) {
      this.turnTimer = 0;
      if (this.enemy.hp <= 0) {
        this.triggerVictory();
      } else {
        this.state = 'enemy_turn';
      }
    }
  },

  updateEnemyTurn() {
    this.turnTimer++;
    if (this.turnTimer === 20) {
      const leader = player.party[0];
      // Decide: spell or physical attack
      const useSpell = this.enemy.spells.length > 0 && Math.random() < 0.4;

      if (useSpell) {
        const spell = this.enemy.spells[Math.floor(Math.random() * this.enemy.spells.length)];
        const damage = spell.damage + Math.floor(Math.random() * 6) - 3;
        const finalDamage = Math.max(1, damage - Math.floor(leader.defense * 0.3));
        leader.hp = Math.max(0, leader.hp - finalDamage);
        this.addLog(this.enemy.name + ' casts ' + spell.name + ' for ' + finalDamage + ' damage!');
        this.addDamagePopup(400, 440, '-' + finalDamage, '#ff66aa');
        this.soundSpellCast();
      } else {
        const baseDamage = this.enemy.attack + Math.floor(Math.random() * 5) - 2;
        const finalDamage = Math.max(1, baseDamage - Math.floor(leader.defense * 0.4));
        leader.hp = Math.max(0, leader.hp - finalDamage);
        this.addLog(this.enemy.name + ' attacks for ' + finalDamage + ' damage!');
        this.addDamagePopup(400, 440, '-' + finalDamage, '#ff6644');
        this.soundAttackHit();
      }
    }
    if (this.turnTimer > 50) {
      this.turnTimer = 0;
      if (player.party[0].hp <= 0) {
        this.triggerDefeat();
      } else {
        this.state = 'menu';
      }
    }
  },

  attemptRun() {
    if (Math.random() < 0.5) {
      // Escape successful
      this.addLog('Got away safely!');
      this.soundRunAway();
      this.state = 'run_success';
      this.turnTimer = 0;
    } else {
      // Escape failed, enemy gets a free attack
      this.addLog('Could not escape!');
      this.state = 'enemy_turn';
      this.turnTimer = 0;
    }
  },

  triggerVictory() {
    this.state = 'victory';
    this.turnTimer = 0;
    this.victoryXp = this.enemy.xpReward;
    this.victoryGold = this.enemy.goldReward;

    // Award XP to leader
    player.party[0].xp = (player.party[0].xp || 0) + this.victoryXp;

    // Award gold
    player.gold += this.victoryGold;

    this.addLog('Victory!');
    this.addLog('Gained ' + this.victoryXp + ' XP and ' + this.victoryGold + ' gold!');
    this.soundVictory();
  },

  triggerDefeat() {
    this.state = 'defeat';
    this.turnTimer = 0;
    this.addLog(player.party[0].name + ' has fallen!');
    this.soundDefeat();
  },

  updateVictory(key) {
    this.turnTimer++;
    if (this.turnTimer > 30 && key === 'Enter') {
      Game.state = 'playing';
    }
  },

  updateDefeat(key) {
    this.turnTimer++;
    if (this.turnTimer > 30 && key === 'Enter') {
      // Revive leader with 1 HP, return to overworld
      player.party[0].hp = Math.floor(player.party[0].maxHp * 0.25);
      // Lose half gold on defeat
      player.gold = Math.floor(player.gold * 0.5);
      this.addLog('Revived with ' + player.party[0].hp + ' HP...');
      Game.state = 'playing';
    }
  },

  // ===== ENCOUNTER CHECK =====
  // Called after player moves; returns true ~5% of the time on valid tiles

  checkRandomEncounter() {
    const tile = getTile(player.x, player.y);
    // Only trigger on overworld walkable tiles (not towns, bridges, water, mountains)
    const encounterTiles = [TILE.GRASS, TILE.TREES, TILE.PATH, TILE.FLOWERS, TILE.SAND];
    if (encounterTiles.indexOf(tile) === -1) return false;
    return Math.random() < 0.05;
  },

  // ===== RENDERING =====

  render(ctx, canvas) {
    const w = canvas.width;
    const h = canvas.height;

    switch (this.state) {
      case 'transition':
        this.renderTransition(ctx, w, h);
        break;
      case 'run_success':
        this.renderBattleScene(ctx, w, h);
        break;
      default:
        this.renderBattleScene(ctx, w, h);
        break;
    }
  },

  renderTransition(ctx, w, h) {
    // Draw the captured overworld screen
    if (this.screenCapture) {
      ctx.putImageData(this.screenCapture, 0, 0);
    }

    // Spiral wipe effect: expanding dark spiral covers the screen
    const cx = w / 2;
    const cy = h / 2;
    const progress = Math.min(1, this.turnTimer / 80);

    ctx.save();

    // Draw a series of overlapping dark circles in a spiral pattern
    ctx.fillStyle = 'rgba(10, 5, 20, 0.92)';
    const maxRadius = Math.sqrt(w * w + h * h) * 0.6;
    const steps = Math.floor(progress * 120);

    for (let i = 0; i < steps; i++) {
      const t = i / 120;
      const angle = t * Math.PI * 8;
      const radius = t * maxRadius;
      const spotX = cx + Math.cos(angle) * radius;
      const spotY = cy + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.arc(spotX, spotY, 40 + t * 60, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center dark circle that grows
    ctx.beginPath();
    ctx.arc(cx, cy, progress * 100, 0, Math.PI * 2);
    ctx.fill();

    // Flash effect near the end
    if (progress > 0.85) {
      const flashAlpha = (progress - 0.85) / 0.15;
      ctx.fillStyle = 'rgba(255, 255, 255, ' + (flashAlpha * 0.6) + ')';
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
  },

  renderBattleScene(ctx, w, h) {
    // Dark gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0a0520');
    grad.addColorStop(0.4, '#1a0a35');
    grad.addColorStop(0.7, '#150828');
    grad.addColorStop(1, '#0d0418');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Decorative ground area
    ctx.fillStyle = '#1a1025';
    ctx.fillRect(0, h * 0.65, w, h * 0.35);
    ctx.strokeStyle = '#3a2050';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.65);
    ctx.lineTo(w, h * 0.65);
    ctx.stroke();

    // Sparkle stars in background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 20; i++) {
      const sx = (Math.sin(i * 127.1 + 50) * 0.5 + 0.5) * w;
      const sy = (Math.cos(i * 311.7 + 50) * 0.5 + 0.5) * (h * 0.55);
      const twinkle = Math.sin(Date.now() * 0.003 + i) * 0.3 + 0.7;
      ctx.globalAlpha = twinkle * 0.5;
      ctx.fillRect(sx, sy, 2, 2);
    }
    ctx.globalAlpha = 1;

    // Draw enemy
    this.renderEnemy(ctx, w, h);

    // Enemy name and HP bar
    this.renderEnemyStats(ctx, w, h);

    // Player stats panel
    this.renderPlayerStats(ctx, w, h);

    // Battle log
    this.renderBattleLog(ctx, w, h);

    // Menu (only in menu states)
    if (this.state === 'menu') {
      this.renderMenu(ctx, w, h);
    } else if (this.state === 'spell_menu') {
      this.renderSpellMenu(ctx, w, h);
    }

    // Victory overlay
    if (this.state === 'victory') {
      this.renderVictory(ctx, w, h);
    }

    // Defeat overlay
    if (this.state === 'defeat') {
      this.renderDefeat(ctx, w, h);
    }

    // Attack animation flash
    if (this.state === 'player_attack' && this.turnTimer >= 12 && this.turnTimer <= 20) {
      this.renderAttackFlash(ctx, w, h);
    }

    // Spell animation effect
    if (this.state === 'player_spell' && this.turnTimer >= 10 && this.turnTimer <= 30) {
      this.renderSpellEffect(ctx, w, h);
    }

    // Enemy attack shake effect
    if (this.state === 'enemy_turn' && this.turnTimer >= 18 && this.turnTimer <= 28) {
      this.renderEnemyAttackEffect(ctx, w, h);
    }

    // Damage popups
    this.renderDamagePopups(ctx);
  },

  renderEnemy(ctx, w, h) {
    if (!this.enemy) return;

    const cx = w / 2;
    const cy = h * 0.32;
    const color = this.enemy.color;

    // Shake when being hit
    let shakeX = 0;
    let shakeY = 0;
    if (this.state === 'player_attack' && this.turnTimer >= 13 && this.turnTimer <= 25) {
      shakeX = Math.sin(this.turnTimer * 2) * 4;
      shakeY = Math.cos(this.turnTimer * 3) * 3;
    }
    if (this.state === 'player_spell' && this.turnTimer >= 18 && this.turnTimer <= 30) {
      shakeX = Math.sin(this.turnTimer * 2.5) * 5;
      shakeY = Math.cos(this.turnTimer * 3) * 4;
    }

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Shadow under enemy
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 70, 50, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw based on enemy shape
    switch (this.enemy.shape) {
      case 'blob':
        this.drawBlobEnemy(ctx, cx, cy, color);
        break;
      case 'humanoid':
        this.drawHumanoidEnemy(ctx, cx, cy, color);
        break;
      case 'bat':
        this.drawBatEnemy(ctx, cx, cy, color);
        break;
      case 'beast':
        this.drawBeastEnemy(ctx, cx, cy, color);
        break;
      case 'fairy':
        this.drawFairyEnemy(ctx, cx, cy, color);
        break;
      case 'large':
        this.drawLargeEnemy(ctx, cx, cy, color);
        break;
      case 'wizard':
        this.drawWizardEnemy(ctx, cx, cy, color);
        break;
      default:
        this.drawBlobEnemy(ctx, cx, cy, color);
    }

    ctx.restore();
  },

  drawBlobEnemy(ctx, cx, cy, color) {
    // Jiggly slime blob
    const wobble = Math.sin(Date.now() * 0.005) * 3;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 20, 40 + wobble, 35 - wobble * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx - 10, cy + 5, 15, 12, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx - 12, cy + 15, 7, 0, Math.PI * 2);
    ctx.arc(cx + 12, cy + 15, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(cx - 10, cy + 16, 4, 0, Math.PI * 2);
    ctx.arc(cx + 14, cy + 16, 4, 0, Math.PI * 2);
    ctx.fill();
    // Mouth
    ctx.strokeStyle = '#225544';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy + 30, 8, 0, Math.PI);
    ctx.stroke();
  },

  drawHumanoidEnemy(ctx, cx, cy, color) {
    // Body
    ctx.fillStyle = color;
    ctx.fillRect(cx - 18, cy - 5, 36, 50);
    // Head
    ctx.beginPath();
    ctx.arc(cx, cy - 18, 20, 0, Math.PI * 2);
    ctx.fill();
    // Eyes (menacing red)
    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.arc(cx - 8, cy - 20, 4, 0, Math.PI * 2);
    ctx.arc(cx + 8, cy - 20, 4, 0, Math.PI * 2);
    ctx.fill();
    // Arms
    ctx.fillStyle = color;
    ctx.fillRect(cx - 30, cy, 12, 35);
    ctx.fillRect(cx + 18, cy, 12, 35);
    // Legs
    ctx.fillRect(cx - 15, cy + 45, 12, 20);
    ctx.fillRect(cx + 3, cy + 45, 12, 20);
    // Weapon (for skeleton/goblin flair)
    ctx.fillStyle = '#999';
    ctx.fillRect(cx + 26, cy - 15, 4, 45);
    ctx.fillStyle = '#bbb';
    ctx.fillRect(cx + 22, cy - 20, 12, 6);
  },

  drawBatEnemy(ctx, cx, cy, color) {
    const flapOffset = Math.sin(Date.now() * 0.01) * 10;
    // Wings
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(cx - 50, cy - 30 + flapOffset, cx - 65, cy + 10 + flapOffset);
    ctx.quadraticCurveTo(cx - 40, cy + 5, cx - 20, cy + 15);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(cx + 50, cy - 30 + flapOffset, cx + 65, cy + 10 + flapOffset);
    ctx.quadraticCurveTo(cx + 40, cy + 5, cx + 20, cy + 15);
    ctx.closePath();
    ctx.fill();
    // Body
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10, 18, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(cx - 7, cy + 3, 5, 0, Math.PI * 2);
    ctx.arc(cx + 7, cy + 3, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(cx - 6, cy + 4, 3, 0, Math.PI * 2);
    ctx.arc(cx + 8, cy + 4, 3, 0, Math.PI * 2);
    ctx.fill();
    // Fangs
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy + 18);
    ctx.lineTo(cx - 3, cy + 25);
    ctx.lineTo(cx - 1, cy + 18);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 1, cy + 18);
    ctx.lineTo(cx + 3, cy + 25);
    ctx.lineTo(cx + 5, cy + 18);
    ctx.fill();
  },

  drawBeastEnemy(ctx, cx, cy, color) {
    // Wolf body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 20, 45, 25, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head
    ctx.beginPath();
    ctx.ellipse(cx - 35, cy + 5, 22, 18, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Ears
    ctx.beginPath();
    ctx.moveTo(cx - 48, cy - 5);
    ctx.lineTo(cx - 55, cy - 25);
    ctx.lineTo(cx - 40, cy - 8);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy - 7);
    ctx.lineTo(cx - 33, cy - 25);
    ctx.lineTo(cx - 22, cy - 8);
    ctx.fill();
    // Eye
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(cx - 42, cy + 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(cx - 41, cy + 2, 2, 0, Math.PI * 2);
    ctx.fill();
    // Snout
    ctx.fillStyle = '#666677';
    ctx.beginPath();
    ctx.ellipse(cx - 52, cy + 10, 10, 6, -0.1, 0, Math.PI * 2);
    ctx.fill();
    // Nose
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(cx - 58, cy + 8, 3, 0, Math.PI * 2);
    ctx.fill();
    // Tail
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx + 40, cy + 15);
    ctx.quadraticCurveTo(cx + 60, cy, cx + 55, cy - 15);
    ctx.stroke();
    // Legs
    ctx.fillStyle = color;
    ctx.fillRect(cx - 25, cy + 38, 10, 22);
    ctx.fillRect(cx - 5, cy + 38, 10, 22);
    ctx.fillRect(cx + 15, cy + 38, 10, 22);
  },

  drawFairyEnemy(ctx, cx, cy, color) {
    const bob = Math.sin(Date.now() * 0.004) * 5;
    // Glow aura
    const auraGrad = ctx.createRadialGradient(cx, cy + bob, 5, cx, cy + bob, 50);
    auraGrad.addColorStop(0, color + '66');
    auraGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(cx, cy + bob, 50, 0, Math.PI * 2);
    ctx.fill();
    // Wings
    ctx.fillStyle = color + '88';
    ctx.beginPath();
    ctx.ellipse(cx - 25, cy - 5 + bob, 18, 28, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 25, cy - 5 + bob, 18, 28, 0.5, 0, Math.PI * 2);
    ctx.fill();
    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 5 + bob, 14, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head
    ctx.beginPath();
    ctx.arc(cx, cy - 18 + bob, 12, 0, Math.PI * 2);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#ffaaff';
    ctx.beginPath();
    ctx.arc(cx - 5, cy - 19 + bob, 3, 0, Math.PI * 2);
    ctx.arc(cx + 5, cy - 19 + bob, 3, 0, Math.PI * 2);
    ctx.fill();
    // Sparkles
    ctx.fillStyle = '#ffddff';
    for (let i = 0; i < 6; i++) {
      const angle = Date.now() * 0.002 + i * Math.PI / 3;
      const dist = 35 + Math.sin(Date.now() * 0.003 + i) * 8;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist + bob, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  drawLargeEnemy(ctx, cx, cy, color) {
    // Troll - big and menacing
    // Body
    ctx.fillStyle = color;
    ctx.fillRect(cx - 35, cy - 20, 70, 70);
    // Head
    ctx.beginPath();
    ctx.arc(cx, cy - 35, 28, 0, Math.PI * 2);
    ctx.fill();
    // Horns
    ctx.fillStyle = '#887755';
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy - 55);
    ctx.lineTo(cx - 28, cy - 80);
    ctx.lineTo(cx - 12, cy - 55);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 20, cy - 55);
    ctx.lineTo(cx + 28, cy - 80);
    ctx.lineTo(cx + 12, cy - 55);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(cx - 12, cy - 38, 6, 0, Math.PI * 2);
    ctx.arc(cx + 12, cy - 38, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(cx - 11, cy - 37, 3, 0, Math.PI * 2);
    ctx.arc(cx + 13, cy - 37, 3, 0, Math.PI * 2);
    ctx.fill();
    // Mouth
    ctx.fillStyle = '#442222';
    ctx.fillRect(cx - 15, cy - 25, 30, 10);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 25);
    ctx.lineTo(cx - 7, cy - 18);
    ctx.lineTo(cx - 4, cy - 25);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 4, cy - 25);
    ctx.lineTo(cx + 7, cy - 18);
    ctx.lineTo(cx + 10, cy - 25);
    ctx.fill();
    // Arms
    ctx.fillStyle = color;
    ctx.fillRect(cx - 50, cy - 10, 15, 50);
    ctx.fillRect(cx + 35, cy - 10, 15, 50);
    // Fists
    ctx.beginPath();
    ctx.arc(cx - 42, cy + 42, 10, 0, Math.PI * 2);
    ctx.arc(cx + 42, cy + 42, 10, 0, Math.PI * 2);
    ctx.fill();
    // Legs
    ctx.fillRect(cx - 25, cy + 50, 18, 20);
    ctx.fillRect(cx + 7, cy + 50, 18, 20);
  },

  drawWizardEnemy(ctx, cx, cy, color) {
    // Robe body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx - 25, cy - 5);
    ctx.lineTo(cx - 35, cy + 55);
    ctx.lineTo(cx + 35, cy + 55);
    ctx.lineTo(cx + 25, cy - 5);
    ctx.closePath();
    ctx.fill();
    // Head
    ctx.fillStyle = '#ddccbb';
    ctx.beginPath();
    ctx.arc(cx, cy - 18, 18, 0, Math.PI * 2);
    ctx.fill();
    // Hat
    ctx.fillStyle = '#2a1540';
    ctx.beginPath();
    ctx.moveTo(cx - 25, cy - 25);
    ctx.lineTo(cx, cy - 70);
    ctx.lineTo(cx + 25, cy - 25);
    ctx.closePath();
    ctx.fill();
    // Hat brim
    ctx.fillRect(cx - 30, cy - 28, 60, 6);
    // Hat star
    ctx.fillStyle = '#ffd700';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('\u2605', cx, cy - 42);
    // Eyes
    ctx.fillStyle = '#cc00ff';
    ctx.beginPath();
    ctx.arc(cx - 7, cy - 20, 4, 0, Math.PI * 2);
    ctx.arc(cx + 7, cy - 20, 4, 0, Math.PI * 2);
    ctx.fill();
    // Staff
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(cx + 38, cy - 60, 4, 120);
    // Staff orb
    ctx.fillStyle = '#ff44ff';
    ctx.beginPath();
    ctx.arc(cx + 40, cy - 62, 8, 0, Math.PI * 2);
    ctx.fill();
    // Staff orb glow
    const orbGrad = ctx.createRadialGradient(cx + 40, cy - 62, 2, cx + 40, cy - 62, 16);
    orbGrad.addColorStop(0, 'rgba(255,100,255,0.4)');
    orbGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(cx + 40, cy - 62, 16, 0, Math.PI * 2);
    ctx.fill();
    // Beard
    ctx.fillStyle = '#aaa';
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 5);
    ctx.quadraticCurveTo(cx, cy + 20, cx + 8, cy - 5);
    ctx.fill();
  },

  renderEnemyStats(ctx, w, h) {
    if (!this.enemy) return;

    const barX = w / 2 - 100;
    const barY = 30;

    // Enemy name
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.enemy.name, w / 2, barY);

    // HP bar background
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY + 8, 200, 14);
    // HP bar fill
    const hpRatio = Math.max(0, this.enemy.hp / this.enemy.maxHp);
    const hpColor = hpRatio > 0.5 ? '#e74c3c' : hpRatio > 0.25 ? '#e67e22' : '#c0392b';
    ctx.fillStyle = hpColor;
    ctx.fillRect(barX, barY + 8, 200 * hpRatio, 14);
    // HP bar border
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY + 8, 200, 14);
    // HP text
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.enemy.hp + ' / ' + this.enemy.maxHp, w / 2, barY + 20);
  },

  renderPlayerStats(ctx, w, h) {
    const leader = player.party[0];
    const panelW = 300;
    const panelH = 80;
    const px = w / 2 - panelW / 2;
    const py = h - panelH - 15;

    // Panel background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(px, py, panelW, panelH);
    ctx.strokeStyle = '#e84393';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, panelW, panelH);

    // Name and level
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(leader.name, px + 12, py + 20);
    const nameWidth = ctx.measureText(leader.name).width;
    ctx.fillStyle = '#e84393';
    ctx.font = '12px sans-serif';
    ctx.fillText('Lv.' + (leader.level || 1), px + 20 + nameWidth, py + 20);

    // HP bar
    ctx.fillStyle = '#aaa';
    ctx.font = '12px sans-serif';
    ctx.fillText('HP', px + 12, py + 40);
    ctx.fillStyle = '#333';
    ctx.fillRect(px + 35, py + 30, 140, 12);
    const hpRatio = leader.hp / leader.maxHp;
    ctx.fillStyle = hpRatio > 0.3 ? '#27ae60' : '#e74c3c';
    ctx.fillRect(px + 35, py + 30, 140 * hpRatio, 12);
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.fillText(leader.hp + '/' + leader.maxHp, px + 180, py + 40);

    // MP bar
    ctx.fillStyle = '#aaa';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('MP', px + 12, py + 60);
    ctx.fillStyle = '#333';
    ctx.fillRect(px + 35, py + 50, 140, 12);
    const mpRatio = leader.mp / leader.maxMp;
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(px + 35, py + 50, 140 * mpRatio, 12);
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.fillText(leader.mp + '/' + leader.maxMp, px + 180, py + 60);

    // Gold
    ctx.fillStyle = '#ffd700';
    ctx.font = '12px sans-serif';
    ctx.fillText('Gold: ' + player.gold, px + 230, py + 20);
  },

  renderMenu(ctx, w, h) {
    const menuX = 30;
    const menuY = h * 0.42;
    const menuW = 150;
    const menuH = 155;

    // Menu background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(menuX, menuY, menuW, menuH);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(menuX, menuY, menuW, menuH);

    // Title
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('COMMAND', menuX + 15, menuY + 20);

    // Options
    for (let i = 0; i < this.MENU_OPTIONS.length; i++) {
      const optY = menuY + 42 + i * 28;
      const isSelected = i === this.menuIndex;

      if (isSelected) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
        ctx.fillRect(menuX + 5, optY - 14, menuW - 10, 24);
      }

      ctx.fillStyle = isSelected ? '#ffd700' : '#ccc';
      ctx.font = isSelected ? 'bold 16px sans-serif' : '16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(this.MENU_OPTIONS[i], menuX + 30, optY + 2);

      if (isSelected) {
        ctx.fillStyle = '#e84393';
        ctx.fillText('>', menuX + 14, optY + 2);
      }
    }
  },

  renderSpellMenu(ctx, w, h) {
    const leader = player.party[0];
    const spells = leader.spells || [];
    const menuX = 30;
    const menuY = h * 0.42;
    const menuW = 200;
    const menuH = 35 + spells.length * 32;

    // Spell menu background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(menuX, menuY, menuW, menuH);
    ctx.strokeStyle = '#aa66ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(menuX, menuY, menuW, menuH);

    // Title
    ctx.fillStyle = '#aa66ff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SPELLS', menuX + 15, menuY + 20);

    for (let i = 0; i < spells.length; i++) {
      const optY = menuY + 42 + i * 32;
      const isSelected = i === this.spellIndex;
      const canCast = leader.mp >= spells[i].cost;

      if (isSelected) {
        ctx.fillStyle = 'rgba(170, 102, 255, 0.15)';
        ctx.fillRect(menuX + 5, optY - 14, menuW - 10, 28);
      }

      ctx.fillStyle = isSelected ? (canCast ? '#ffd700' : '#884444') : (canCast ? '#ccc' : '#666');
      ctx.font = isSelected ? 'bold 15px sans-serif' : '15px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(spells[i].name, menuX + 30, optY + 2);

      // Cost
      ctx.fillStyle = canCast ? '#4488cc' : '#664444';
      ctx.font = '11px sans-serif';
      ctx.fillText(spells[i].cost + ' MP', menuX + 140, optY + 2);

      if (isSelected) {
        ctx.fillStyle = '#e84393';
        ctx.font = '15px sans-serif';
        ctx.fillText('>', menuX + 14, optY + 2);
      }
    }

    // Hint
    ctx.fillStyle = '#888';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ESC to go back', menuX + 15, menuY + menuH - 8);
  },

  renderBattleLog(ctx, w, h) {
    const logX = w / 2 - 200;
    const logY = h - 115;

    ctx.textAlign = 'left';
    ctx.font = '13px sans-serif';

    for (let i = 0; i < this.log.length; i++) {
      const alpha = 0.5 + (i / this.log.length) * 0.5;
      ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
      ctx.fillText(this.log[i], logX, logY + i * 18);
    }
  },

  renderDamagePopups(ctx) {
    for (const popup of this.damagePopups) {
      const alpha = Math.min(1, popup.life / 30);
      ctx.fillStyle = popup.color;
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(popup.text, popup.x, popup.y);
      ctx.globalAlpha = 1;
    }
  },

  renderAttackFlash(ctx, w, h) {
    // White slash lines across the enemy
    const cx = w / 2;
    const cy = h * 0.32;
    const progress = (this.turnTimer - 12) / 8;

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 200, ' + (1 - progress) + ')';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 40 + progress * 20, cy - 40 + progress * 20);
    ctx.lineTo(cx + 40 - progress * 20, cy + 40 - progress * 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 40 - progress * 20, cy - 40 + progress * 20);
    ctx.lineTo(cx - 40 + progress * 20, cy + 40 - progress * 20);
    ctx.stroke();

    // Screen flash
    if (this.turnTimer <= 15) {
      ctx.fillStyle = 'rgba(255, 255, 255, ' + (0.3 * (1 - (this.turnTimer - 12) / 3)) + ')';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  },

  renderSpellEffect(ctx, w, h) {
    const cx = w / 2;
    const cy = h * 0.32;
    const progress = (this.turnTimer - 10) / 20;

    ctx.save();

    // Magical particles swirling around the enemy
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + progress * Math.PI * 3;
      const dist = 30 + progress * 40;
      const px = cx + Math.cos(angle) * dist * (1 - progress * 0.5);
      const py = cy + Math.sin(angle) * dist * 0.7;
      const size = 4 + Math.sin(progress * Math.PI) * 4;

      ctx.fillStyle = 'rgba(170, 100, 255, ' + (1 - progress) + ')';
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Central flash
    if (progress > 0.3 && progress < 0.7) {
      const flashAlpha = Math.sin((progress - 0.3) / 0.4 * Math.PI) * 0.4;
      const flashGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80);
      flashGrad.addColorStop(0, 'rgba(200, 150, 255, ' + flashAlpha + ')');
      flashGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },

  renderEnemyAttackEffect(ctx, w, h) {
    const progress = (this.turnTimer - 18) / 10;

    // Red flash on the screen edges
    ctx.save();
    const alpha = Math.sin(progress * Math.PI) * 0.25;
    ctx.fillStyle = 'rgba(255, 50, 50, ' + alpha + ')';
    ctx.fillRect(0, 0, w, h);

    // Impact lines from top toward bottom
    ctx.strokeStyle = 'rgba(255, 100, 100, ' + (1 - progress) * 0.5 + ')';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const sx = w * 0.2 + (i / 5) * w * 0.6;
      ctx.beginPath();
      ctx.moveTo(sx, h * 0.3 + progress * 30);
      ctx.lineTo(sx + (Math.random() - 0.5) * 20, h * 0.7 + progress * 30);
      ctx.stroke();
    }
    ctx.restore();
  },

  renderVictory(ctx, w, h) {
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, w, h);

    // Victory banner
    const bannerY = h / 2 - 60;
    ctx.fillStyle = 'rgba(20, 10, 40, 0.9)';
    ctx.fillRect(w / 2 - 180, bannerY, 360, 140);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.strokeRect(w / 2 - 180, bannerY, 360, 140);

    // Victory text
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 32px serif';
    ctx.textAlign = 'center';
    ctx.fillText('VICTORY!', w / 2, bannerY + 40);

    // Rewards
    ctx.fillStyle = '#fff';
    ctx.font = '16px sans-serif';
    ctx.fillText('Gained ' + this.victoryXp + ' XP', w / 2, bannerY + 75);
    ctx.fillStyle = '#ffd700';
    ctx.fillText('Gained ' + this.victoryGold + ' Gold', w / 2, bannerY + 100);

    // Continue prompt
    if (this.turnTimer > 30 && Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.fillStyle = '#aaa';
      ctx.font = '14px sans-serif';
      ctx.fillText('Press ENTER to continue', w / 2, bannerY + 128);
    }
  },

  renderDefeat(ctx, w, h) {
    // Dark red overlay
    ctx.fillStyle = 'rgba(40, 0, 0, 0.6)';
    ctx.fillRect(0, 0, w, h);

    // Defeat banner
    const bannerY = h / 2 - 50;
    ctx.fillStyle = 'rgba(40, 5, 5, 0.9)';
    ctx.fillRect(w / 2 - 160, bannerY, 320, 120);
    ctx.strokeStyle = '#cc3333';
    ctx.lineWidth = 3;
    ctx.strokeRect(w / 2 - 160, bannerY, 320, 120);

    // Defeat text
    ctx.fillStyle = '#cc3333';
    ctx.font = 'bold 28px serif';
    ctx.textAlign = 'center';
    ctx.fillText('DEFEATED', w / 2, bannerY + 35);

    ctx.fillStyle = '#ccc';
    ctx.font = '14px sans-serif';
    ctx.fillText(player.party[0].name + ' has fallen in battle...', w / 2, bannerY + 65);
    ctx.fillText('Lost half your gold.', w / 2, bannerY + 85);

    // Continue prompt
    if (this.turnTimer > 30 && Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.fillStyle = '#888';
      ctx.font = '14px sans-serif';
      ctx.fillText('Press ENTER to continue', w / 2, bannerY + 108);
    }
  }
};

// Convenience function for checking encounters from main.js
function checkRandomEncounter() {
  return Battle.checkRandomEncounter();
}
