// Persistent GLB cache in IndexedDB, keyed by content hash (preferred) or URL.
// Checked before the network. See implementation.md §7.6.
import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "scalebench";
const STORE = "glb";
const VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB unavailable"));
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      },
    });
  }
  return dbPromise;
}

export async function getCachedGlb(key: string): Promise<ArrayBuffer | undefined> {
  try {
    return await (await getDb()).get(STORE, key);
  } catch {
    return undefined;
  }
}

export async function putCachedGlb(key: string, buf: ArrayBuffer): Promise<void> {
  try {
    await (await getDb()).put(STORE, buf, key);
  } catch {
    // Caching is best-effort; ignore quota/availability failures.
  }
}
