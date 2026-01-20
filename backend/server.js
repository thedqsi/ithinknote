import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { initDb, getDb, saveDb } from './db.js';
import { startCleanupJob } from './cleanup.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper: Calculate expiry time (24 hours from now)
function getExpiryTime() {
  const expires = new Date();
  expires.setHours(expires.getHours() + 24);
  return expires.toISOString();
}

// Helper: Convert sql.js result to object
function rowToNote(columns, values) {
  const note = {};
  columns.forEach((col, i) => {
    note[col] = values[i];
  });
  return note;
}

// POST /api/note - Create a new note
app.post('/api/note', (req, res) => {
  try {
    const db = getDb();
    const id = uuidv4();
    const expires_at = getExpiryTime();
    const created_at = new Date().toISOString();

    db.run(`INSERT INTO notes (id, content, created_at, expires_at) VALUES (?, '', ?, ?)`, [id, created_at, expires_at]);
    saveDb();

    res.status(201).json({
      id,
      content: '',
      created_at,
      expires_at
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// GET /api/note/:id - Get a note by ID
app.get('/api/note/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const result = db.exec(`SELECT * FROM notes WHERE id = ?`, [id]);

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Note not found or has expired' });
    }

    const note = rowToNote(result[0].columns, result[0].values[0]);

    // Check if note has expired
    const now = new Date();
    const expiresAt = new Date(note.expires_at);

    if (now > expiresAt) {
      // Delete the expired note
      db.run(`DELETE FROM notes WHERE id = ?`, [id]);
      saveDb();
      return res.status(404).json({ error: 'Note has expired' });
    }

    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// PUT /api/note/:id - Update a note
app.put('/api/note/:id', (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { content } = req.body;

    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'Content must be a string' });
    }

    // Check if note exists and is not expired
    const result = db.exec(`SELECT * FROM notes WHERE id = ?`, [id]);

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Note not found or has expired' });
    }

    const note = rowToNote(result[0].columns, result[0].values[0]);

    const now = new Date();
    const expiresAt = new Date(note.expires_at);

    if (now > expiresAt) {
      db.run(`DELETE FROM notes WHERE id = ?`, [id]);
      saveDb();
      return res.status(404).json({ error: 'Note has expired' });
    }

    // Update the note
    db.run(`UPDATE notes SET content = ? WHERE id = ?`, [content, id]);
    saveDb();

    // Fetch updated note
    const updatedResult = db.exec(`SELECT * FROM notes WHERE id = ?`, [id]);
    const updatedNote = rowToNote(updatedResult[0].columns, updatedResult[0].values[0]);

    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Initialize database and start server
async function start() {
  await initDb();
  console.log('Database initialized');

  // Start cleanup job
  startCleanupJob();

  // Start server
  app.listen(PORT, () => {
    console.log(`iThinkNote backend running on http://localhost:${PORT}`);
  });
}

start().catch(console.error);
