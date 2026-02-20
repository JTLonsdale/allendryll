const HUD = {
  draw(ctx, canvas) {
    const leader = player.party[0];
    const w = canvas.width;
    const panelW = 220;
    const panelH = 110;
    const px = w - panelW - 10;
    const py = 10;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(px, py, panelW, panelH);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, panelW, panelH);

    ctx.textAlign = 'left';

    // Name
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(leader.name, px + 12, py + 24);

    // Role
    ctx.fillStyle = '#e84393';
    ctx.font = '12px sans-serif';
    ctx.fillText(leader.role, px + 12, py + 40);

    // HP bar
    ctx.fillStyle = '#aaa';
    ctx.font = '13px sans-serif';
    ctx.fillText('HP', px + 12, py + 60);
    ctx.fillStyle = '#333';
    ctx.fillRect(px + 35, py + 50, 120, 12);
    ctx.fillStyle = leader.hp > leader.maxHp * 0.3 ? '#27ae60' : '#e74c3c';
    ctx.fillRect(px + 35, py + 50, 120 * (leader.hp / leader.maxHp), 12);
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.fillText(`${leader.hp}/${leader.maxHp}`, px + 160, py + 60);

    // MP bar
    ctx.fillStyle = '#aaa';
    ctx.font = '13px sans-serif';
    ctx.fillText('MP', px + 12, py + 80);
    ctx.fillStyle = '#333';
    ctx.fillRect(px + 35, py + 70, 120, 12);
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(px + 35, py + 70, 120 * (leader.mp / leader.maxMp), 12);
    ctx.fillStyle = '#fff';
    ctx.font = '11px sans-serif';
    ctx.fillText(`${leader.mp}/${leader.maxMp}`, px + 160, py + 80);

    // Gold
    ctx.fillStyle = '#ffd700';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Gold: ${player.gold}`, px + 12, py + 100);

    // Party count
    ctx.fillStyle = '#e84393';
    ctx.fillText('Party: ' + player.party.length + '/5', px + 120, py + 100);

    // Ship prompts
    if (ship.boarded) {
      this._drawPrompt(ctx, canvas, 'Sailing - SPACE to dock');
    } else {
      const dist = Math.abs(player.x - ship.x) + Math.abs(player.y - ship.y);
      if (dist <= 1) {
        this._drawPrompt(ctx, canvas, 'Press SPACE to board ship');
      }
    }
  },

  _drawPrompt(ctx, canvas, text) {
    const w = canvas.width;
    const h = canvas.height;
    const barW = 280;
    const barH = 32;
    const bx = Math.floor(w / 2 - barW / 2);
    const by = h - barH - 12;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(bx, by, barW, barH);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, barW, barH);

    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, w / 2, by + 21);
    ctx.textAlign = 'left';
  }
};
