const Input = {
  keys: {},
  lastKey: null,
  init() {
    window.addEventListener('keydown', (e) => {
      if (!this.keys[e.key]) {
        this.keys[e.key] = true;
        this.lastKey = e.key;
      }
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  },
  consume() {
    const k = this.lastKey;
    this.lastKey = null;
    return k;
  }
};
