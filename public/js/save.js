const Save = {
  async save(slot = 1) {
    const state = getPlayerState();
    state.slot = slot;
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      const data = await res.json();
      return data.ok;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  },

  async load(slot = 1) {
    try {
      const res = await fetch(`/api/load/${slot}`);
      const data = await res.json();
      if (data.ok) {
        loadPlayerState(data.data);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Load failed:', e);
      return false;
    }
  }
};
