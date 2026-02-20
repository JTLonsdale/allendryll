// Shop system
const Shop = {
  active: null,    // current SHOPS[id] definition
  shopName: '',
  items: [],       // resolved item objects
  cursor: 0,
  message: null,
  messageTimer: 0,

  open(shopId) {
    const def = SHOPS[shopId];
    if (!def) return;
    this.active = def;
    this.shopName = def.name;
    this.items = def.items.map(id => ITEMS[id]).filter(Boolean);
    this.cursor = 0;
    this.message = null;
    this.messageTimer = 0;
  },

  close() {
    this.active = null;
    this.items = [];
    this.cursor = 0;
    this.message = null;
    this.messageTimer = 0;
  },

  moveCursor(dir) {
    if (!this.active || this.items.length === 0) return;
    this.cursor += dir;
    if (this.cursor < 0) this.cursor = this.items.length - 1;
    if (this.cursor >= this.items.length) this.cursor = 0;
  },

  buy() {
    if (!this.active || this.items.length === 0) return;
    const item = this.items[this.cursor];
    if (!item) return;
    if (player.gold < item.price) {
      this.message = 'Not enough gold!';
      this.messageTimer = 90;
      return;
    }
    player.gold -= item.price;
    player.items.push(item.id);
    this.message = 'Bought ' + item.name + '!';
    this.messageTimer = 90;
  },

  update() {
    if (this.messageTimer > 0) {
      this.messageTimer--;
      if (this.messageTimer === 0) this.message = null;
    }
  },

  getSelectedItem() {
    if (!this.active || this.items.length === 0) return null;
    return this.items[this.cursor];
  }
};
