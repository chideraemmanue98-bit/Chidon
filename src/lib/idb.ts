import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'chidon_iq_intelligence_db';
const STORE_NAME = 'notes_local';

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

export async function saveNoteLocal(note: any) {
  const db = await initDB();
  return db.put(STORE_NAME, note);
}

export async function getNoteLocal(id: string) {
  const db = await initDB();
  return db.get(STORE_NAME, id);
}

export async function getAllNotesLocal() {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

export async function deleteNoteLocal(id: string) {
  const db = await initDB();
  return db.delete(STORE_NAME, id);
}

export async function clearAllNotesLocal() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.clear();
  await tx.done;
}
