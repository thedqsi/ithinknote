import { getDb, saveDb } from './db.js';

const CLEANUP_INTERVAL = 60 * 1000; // Run every minute

function cleanupExpiredNotes() {
  const db = getDb();
  if (!db) return;

  const now = new Date().toISOString();

  // Get count of expired notes first
  const countResult = db.exec(`SELECT COUNT(*) as count FROM notes WHERE expires_at < '${now}'`);
  const count = countResult.length > 0 ? countResult[0].values[0][0] : 0;

  if (count > 0) {
    db.run(`DELETE FROM notes WHERE expires_at < '${now}'`);
    saveDb();
    console.log(`[Cleanup] Deleted ${count} expired note(s)`);
  }
}

export function startCleanupJob() {
  // Run immediately on startup
  cleanupExpiredNotes();

  // Then run on interval
  setInterval(cleanupExpiredNotes, CLEANUP_INTERVAL);
  console.log('[Cleanup] Cleanup job started (runs every minute)');
}

export { cleanupExpiredNotes };
