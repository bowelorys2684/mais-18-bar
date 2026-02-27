import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure we use an absolute path for the database
const dbPath = path.join(__dirname, 'checkins.db');
console.log(`[DATABASE] Initializing at: ${dbPath}`);

const db = new Database(dbPath);

// Initialize database table
db.exec(`
  CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    profile TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---

  // 1. Create Check-in
  app.post('/api/checkin', (req, res) => {
    const { name, whatsapp, profile } = req.body;
    const now = new Date().toISOString();
    console.log(`[API] POST /api/checkin - Name: ${name} at ${now}`);
    
    if (!name || !whatsapp || !profile) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const stmt = db.prepare('INSERT INTO checkins (name, whatsapp, profile, created_at) VALUES (?, ?, ?, ?)');
      const info = stmt.run(name, whatsapp, profile, now);
      res.json({ success: true, id: info.lastInsertRowid, created_at: now });
    } catch (error) {
      console.error('[DATABASE ERROR]', error);
      res.status(500).json({ error: 'Failed to save check-in' });
    }
  });

  // 2. List all Check-ins
  app.get('/api/checkins', (req, res) => {
    console.log('[API] GET /api/checkins');
    try {
      const rows = db.prepare('SELECT * FROM checkins ORDER BY created_at DESC').all();
      res.json(rows);
    } catch (error) {
      console.error('[DATABASE ERROR]', error);
      res.status(500).json({ error: 'Failed to fetch check-ins' });
    }
  });

  // 3. Clear all Check-ins (Using POST for better compatibility)
  app.post('/api/checkins/clear', (req, res) => {
    console.log('[API] POST /api/checkins/clear');
    try {
      const result = db.prepare('DELETE FROM checkins').run();
      console.log(`[API] Cleared table. Rows affected: ${result.changes}`);
      res.json({ success: true, count: result.changes });
    } catch (error) {
      console.error('[DATABASE ERROR]', error);
      res.status(500).json({ error: 'Failed to clear list' });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[CRITICAL SERVER ERROR]', err);
});
