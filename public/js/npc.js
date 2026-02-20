// NPC interaction system
const NPC = {
  // Dialogue state
  active: null,       // currently interacting NPC
  dialogueIndex: 0,   // current line index

  // Find NPC the player is facing and adjacent to
  getFacingNPC() {
    if (!ACTIVE_NPCS || ACTIVE_NPCS.length === 0) return null;
    let tx = player.x, ty = player.y;
    if (player.direction === 'up')    ty--;
    else if (player.direction === 'down')  ty++;
    else if (player.direction === 'left')  tx--;
    else if (player.direction === 'right') tx++;

    for (const npc of ACTIVE_NPCS) {
      if (npc.x === tx && npc.y === ty) return npc;
    }
    return null;
  },

  // Start dialogue with an NPC
  interact(npc) {
    if (!npc || !npc.dialogue || npc.dialogue.length === 0) return false;
    this.active = npc;
    this.dialogueIndex = 0;
    return true;
  },

  // Advance dialogue — returns true if dialogue is still going, false if done
  advance() {
    if (!this.active) return false;
    this.dialogueIndex++;
    if (this.dialogueIndex >= this.active.dialogue.length) {
      const npc = this.active;
      this.close();
      // If shopkeeper, return the shop ID to open
      if (npc.isShopkeeper && npc.shopId) {
        return { done: true, shopId: npc.shopId };
      }
      return { done: true };
    }
    return { done: false };
  },

  // Close dialogue
  close() {
    this.active = null;
    this.dialogueIndex = 0;
  },

  // Get current dialogue line
  getCurrentLine() {
    if (!this.active) return null;
    return this.active.dialogue[this.dialogueIndex];
  },

  // Get NPC name
  getCurrentName() {
    if (!this.active) return '';
    return this.active.name;
  },

  // Check if any NPC is adjacent and player is facing them (for "!" indicator)
  hasFacingNPC() {
    return this.getFacingNPC() !== null;
  }
};
