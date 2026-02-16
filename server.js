const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const SAVES_DIR = path.join(__dirname, 'saves');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

if (!fs.existsSync(SAVES_DIR)) fs.mkdirSync(SAVES_DIR);

app.post('/api/save', (req, res) => {
  const data = req.body;
  const filename = `save_${data.slot || 1}.json`;
  fs.writeFileSync(path.join(SAVES_DIR, filename), JSON.stringify(data, null, 2));
  res.json({ ok: true });
});

app.get('/api/load/:slot', (req, res) => {
  const filename = `save_${req.params.slot}.json`;
  const filepath = path.join(SAVES_DIR, filename);
  if (!fs.existsSync(filepath)) return res.json({ ok: false, error: 'No save found' });
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  res.json({ ok: true, data });
});

app.listen(PORT, () => console.log(`Allendryll Princess Warriors running at http://localhost:${PORT}`));
