/**
 * Persistent Storage for MEYZI BRO STOCK PROJECT using IndexedDB
 * Supports real audio files (MP3, WAV, FLAC, AAC, M4A, OGG), folders, and playlists
 */

import { Song, Project, Instrumental, MediaFile, Collaborator, Folder, Playlist } from '../types';

const DB_NAME = 'meyzi_bro_stock_db';
const DB_VERSION = 2;

let dbInstance: IDBDatabase | null = null;

export async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('songs')) {
        db.createObjectStore('songs', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('instrumentals')) {
        db.createObjectStore('instrumentals', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('collaborators')) {
        db.createObjectStore('collaborators', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('audioBlobs')) {
        db.createObjectStore('audioBlobs', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('folders')) {
        db.createObjectStore('folders', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('playlists')) {
        db.createObjectStore('playlists', { keyPath: 'id' });
      }
    };

    request.onsuccess = (e) => {
      dbInstance = (e.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (e) => {
      reject((e.target as IDBOpenDBRequest).error);
    };
  });
}

// Save binary audio blob
export async function saveAudioBlob(key: string, blob: Blob): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('audioBlobs', 'readwrite');
    const store = tx.objectStore('audioBlobs');
    const req = store.put({ key, blob });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Retrieve binary audio blob
export async function getAudioBlob(key: string): Promise<Blob | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('audioBlobs', 'readonly');
    const store = tx.objectStore('audioBlobs');
    const req = store.get(key);
    req.onsuccess = () => {
      resolve(req.result ? req.result.blob : null);
    };
    req.onerror = () => reject(req.error);
  });
}

// Delete audio blob
export async function deleteAudioBlob(key: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('audioBlobs', 'readwrite');
    const store = tx.objectStore('audioBlobs');
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Generic CRUD
export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveToStore<T>(storeName: string, item: T): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteFromStore(storeName: string, id: number | string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearStore(storeName: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export const DEFAULT_SUGGESTED_FOLDERS: Omit<Folder, 'createdAt'>[] = [
  { id: 'fld_albums', name: 'MES ALBUMS', color: '#d4af37', description: 'Projets longs et albums studio' },
  { id: 'fld_mixtapes', name: 'MES MIXTAPES', color: '#f59e0b', description: 'Mixtapes et formats freestyle' },
  { id: 'fld_singles', name: 'MES SINGLES', color: '#ef4444', description: 'Singles et sorties solos' },
  { id: 'fld_instru', name: 'MES INSTRUMENTALES', color: '#10b981', description: 'Beats, productions et stems' },
  { id: 'fld_feats', name: 'MES FEATURINGS', color: '#8b5cf6', description: 'Collaborations et morceaux en feat' },
  { id: 'fld_flstudio', name: 'MES PROJETS FL STUDIO', color: '#ec4899', description: 'Fichiers de session FL Studio et stems de travail' },
  { id: 'fld_exports', name: 'MES EXPORTATIONS', color: '#3b82f6', description: 'Exports masters WAV et MP3' }
];

export async function initDefaultFoldersIfEmpty(): Promise<Folder[]> {
  const existing = await getAllFromStore<Folder>('folders');
  if (existing.length === 0) {
    const now = new Date().toISOString().split('T')[0];
    const initial: Folder[] = DEFAULT_SUGGESTED_FOLDERS.map(f => ({
      ...f,
      createdAt: now
    }));
    for (const f of initial) {
      await saveToStore('folders', f);
    }
    return initial;
  }
  return existing;
}

// Backup & Restore Library
export async function exportLibraryBackupJSON(): Promise<string> {
  const [songs, projects, instrumentals, files, collaborators, folders, playlists] = await Promise.all([
    getAllFromStore<Song>('songs'),
    getAllFromStore<Project>('projects'),
    getAllFromStore<Instrumental>('instrumentals'),
    getAllFromStore<MediaFile>('files'),
    getAllFromStore<Collaborator>('collaborators'),
    getAllFromStore<Folder>('folders'),
    getAllFromStore<Playlist>('playlists')
  ]);

  const backup = {
    appName: 'MEYZI BRO STOCK PROJECT',
    version: '2.0',
    exportDate: new Date().toISOString(),
    songs,
    projects,
    instrumentals,
    files,
    collaborators,
    folders,
    playlists
  };

  return JSON.stringify(backup, null, 2);
}

export async function importLibraryBackupJSON(jsonStr: string): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.songs || !Array.isArray(data.songs)) {
      return { success: false, count: 0, error: 'Format de fichier de sauvegarde invalide.' };
    }

    let importedCount = 0;
    if (Array.isArray(data.folders)) {
      for (const f of data.folders) {
        await saveToStore('folders', f);
      }
    }
    if (Array.isArray(data.playlists)) {
      for (const p of data.playlists) {
        await saveToStore('playlists', p);
      }
    }
    if (Array.isArray(data.songs)) {
      for (const s of data.songs) {
        await saveToStore('songs', s);
        importedCount++;
      }
    }
    if (Array.isArray(data.projects)) {
      for (const pr of data.projects) {
        await saveToStore('projects', pr);
      }
    }
    if (Array.isArray(data.instrumentals)) {
      for (const ins of data.instrumentals) {
        await saveToStore('instrumentals', ins);
      }
    }

    return { success: true, count: importedCount };
  } catch (err: unknown) {
    return { success: false, count: 0, error: err instanceof Error ? err.message : 'Erreur JSON' };
  }
}
