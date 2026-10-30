/**
 * MEYZI BRO STOCK PROJECT — Professional Audio & Folder Batch Importer
 * Supports multi-file & folder imports for MP3, WAV, FLAC, AAC, M4A, OGG
 * Automatic metadata extraction, deduplication & progress bar
 */

import React, { useState, useRef } from 'react';
import {
  Upload,
  FolderUp,
  FileAudio,
  CheckCircle,
  AlertCircle,
  Clock,
  HardDrive,
  Folder,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Song, Folder as FolderType } from '../types';
import { saveAudioBlob, saveToStore } from '../services/storage';

interface AudioBatchImporterProps {
  folders: FolderType[];
  existingSongs: Song[];
  onImportComplete: (newSongs: Song[]) => void;
  showToast: (msg: string) => void;
}

export default function AudioBatchImporter({
  folders,
  existingSongs,
  onImportComplete,
  showToast
}: AudioBatchImporterProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [defaultArtist, setDefaultArtist] = useState<string>('MEYZI BRO OFFICIEL');
  const [defaultType, setDefaultType] = useState<string>('Single');

  // Import progress state
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    fileName: string;
    percent: number;
  }>({ current: 0, total: 0, fileName: '', percent: 0 });

  const [importSummary, setImportSummary] = useState<{
    imported: number;
    duplicates: number;
    errors: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  // Supported audio extensions regex
  const audioRegex = /\.(mp3|wav|flac|aac|m4a|ogg)$/i;

  // Clean filename to Title and Artist
  const parseFilename = (fileName: string) => {
    // Remove extension
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    // Check if format is "Artist - Title"
    if (baseName.includes(' - ')) {
      const [artistPart, ...rest] = baseName.split(' - ');
      return {
        artist: artistPart.trim(),
        title: rest.join(' - ').trim()
      };
    }
    return {
      artist: defaultArtist,
      title: baseName.replace(/[_]/g, ' ').trim()
    };
  };

  // Detect audio duration helper
  const detectDuration = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      try {
        const audio = new Audio();
        const url = URL.createObjectURL(file);
        audio.src = url;
        audio.onloadedmetadata = () => {
          URL.revokeObjectURL(url);
          const dur = audio.duration;
          if (dur && !isNaN(dur) && isFinite(dur)) {
            const m = Math.floor(dur / 60);
            const s = Math.floor(dur % 60);
            resolve(`${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`);
          } else {
            resolve('03:15');
          }
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          resolve('03:15');
        };
      } catch {
        resolve('03:15');
      }
    });
  };

  // Process File list
  const processFiles = async (filesList: FileList | File[]) => {
    const rawFiles = Array.from(filesList);
    const audioFiles = rawFiles.filter(f => audioRegex.test(f.name));

    if (audioFiles.length === 0) {
      showToast('Aucun fichier audio valide trouvé (MP3, WAV, FLAC, AAC, M4A, OGG).');
      return;
    }

    setIsImporting(true);
    setImportSummary(null);

    let importedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    const newSongs: Song[] = [];

    const existingNames = new Set(
      existingSongs.map(s => (s.originalFileName || s.title).toLowerCase().trim())
    );

    const total = audioFiles.length;

    for (let i = 0; i < total; i++) {
      const file = audioFiles[i];
      const percent = Math.round(((i + 1) / total) * 100);

      setProgress({
        current: i + 1,
        total,
        fileName: file.name,
        percent
      });

      // Check duplicates
      const cleanFileName = file.name.toLowerCase().trim();
      const { title, artist } = parseFilename(file.name);
      const cleanTitle = title.toLowerCase().trim();

      if (existingNames.has(cleanFileName) || existingNames.has(cleanTitle)) {
        duplicateCount++;
        continue;
      }

      try {
        const duration = await detectDuration(file);
        const songId = Date.now() + i;

        // Save audio binary blob to IndexedDB
        await saveAudioBlob(`song_${songId}_audio`, file);

        const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3';

        const songObj: Song = {
          id: songId,
          title: title,
          type: defaultType as Song['type'],
          folderId: selectedFolderId || null,
          folderName: folders.find(f => f.id === selectedFolderId)?.name,
          artist: artist || defaultArtist,
          producer: 'Studio Vault',
          composer: artist || defaultArtist,
          genre: 'Rap / Hip-Hop',
          year: new Date().getFullYear(),
          bpm: 140,
          keySignature: 'D Minor',
          duration: duration,
          status: 'Terminé',
          originalFileName: file.name,
          fileFormat: ext.toUpperCase(),
          fileSize: file.size,
          audioFile: URL.createObjectURL(file),
          createdAt: new Date().toISOString().split('T')[0]
        };

        // Save song metadata to IndexedDB
        await saveToStore('songs', songObj);
        newSongs.push(songObj);
        existingNames.add(cleanFileName);
        existingNames.add(cleanTitle);
        importedCount++;
      } catch (err) {
        console.error('Import error on file:', file.name, err);
        errorCount++;
      }
    }

    setIsImporting(false);
    setImportSummary({
      imported: importedCount,
      duplicates: duplicateCount,
      errors: errorCount
    });

    if (newSongs.length > 0) {
      onImportComplete(newSongs);
      showToast(`${newSongs.length} morceau(x) importé(s) avec succès !`);
    } else if (duplicateCount > 0) {
      showToast(`${duplicateCount} morceau(x) déjà présent(s) (doublons ignorés).`);
    }
  };

  // Modern File System Access API with fallback
  const handlePickDirectory = async () => {
    // Check if window.showDirectoryPicker exists
    if ('showDirectoryPicker' in window) {
      try {
        // @ts-expect-error showDirectoryPicker is supported in modern browsers
        const dirHandle = await window.showDirectoryPicker();
        const files: File[] = [];

        async function getFilesRecursively(handle: any) {
          for await (const entry of handle.values()) {
            if (entry.kind === 'file') {
              const file = await entry.getFile();
              if (audioRegex.test(file.name)) {
                files.push(file);
              }
            } else if (entry.kind === 'directory') {
              await getFilesRecursively(entry);
            }
          }
        }

        await getFilesRecursively(dirHandle);
        if (files.length > 0) {
          await processFiles(files);
        } else {
          showToast('Aucun fichier audio trouvé dans ce dossier.');
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          // Fallback to input webkitdirectory
          folderInputRef.current?.click();
        }
      }
    } else {
      folderInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs text-[#d4af37] font-semibold uppercase tracking-wider mb-1">
          <span>Centre d'Importation Musicale</span>
        </div>
        <h2 className="text-xl font-display font-bold text-white">
          Importer vos Musiques & Dossiers
        </h2>
        <p className="text-xs text-neutral-400">
          Importez unitairement ou en masse vos fichiers audios (MP3, WAV, FLAC, AAC, M4A, OGG) depuis votre ordinateur.
        </p>
      </div>

      {/* Target Options Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#121212] border border-[#1f1f1f] p-4 rounded-xl text-xs">
        <div>
          <label className="text-neutral-400 block mb-1 font-semibold">Dossier de destination :</label>
          <select
            value={selectedFolderId}
            onChange={e => setSelectedFolderId(e.target.value)}
            className="w-full h-8 bg-[#181818] border border-[#282828] rounded px-2 text-white"
          >
            <option value="">-- Aucun dossier (Racine) --</option>
            {folders.map(f => (
              <option key={f.id} value={f.id}>
                📁 {f.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-neutral-400 block mb-1 font-semibold">Artiste principal par défaut :</label>
          <input
            type="text"
            value={defaultArtist}
            onChange={e => setDefaultArtist(e.target.value)}
            className="w-full h-8 bg-[#181818] border border-[#282828] rounded px-2.5 text-white"
          />
        </div>

        <div>
          <label className="text-neutral-400 block mb-1 font-semibold">Type de format :</label>
          <select
            value={defaultType}
            onChange={e => setDefaultType(e.target.value)}
            className="w-full h-8 bg-[#181818] border border-[#282828] rounded px-2 text-white"
          >
            <option value="Single">Single</option>
            <option value="Album">Album</option>
            <option value="EP">EP</option>
            <option value="Mixtape">Mixtape</option>
            <option value="Freestyle">Freestyle</option>
            <option value="Instrumental">Instrumental</option>
          </select>
        </div>
      </div>

      {/* Import Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Multi-Files */}
        <div
          onClick={() => !isImporting && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
            isImporting
              ? 'opacity-50 cursor-not-allowed border-[#222] bg-[#0e0e0e]'
              : 'border-[#262626] hover:border-[#d4af37]/60 bg-[#101010]/80 hover:bg-[#141414]'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-[#181818] border border-[#282828] flex items-center justify-center mb-3 text-[#d4af37]">
            <Upload className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">
            Importer des Fichiers Multiples
          </h3>
          <p className="text-xs text-neutral-400 max-w-xs mb-3">
            Sélectionnez un ou plusieurs fichiers audio depuis votre ordinateur.
          </p>
          <span className="text-[11px] font-mono-numbers px-2.5 py-1 bg-[#1a170d] text-[#d4af37] border border-[#d4af37]/30 rounded-md">
            Formats : MP3, WAV, FLAC, AAC, M4A, OGG
          </span>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept=".mp3,.wav,.flac,.aac,.m4a,.ogg,audio/*"
            className="hidden"
            onChange={e => {
              if (e.target.files) processFiles(e.target.files);
            }}
          />
        </div>

        {/* Card 2: Entire Folder */}
        <div
          onClick={() => !isImporting && handlePickDirectory()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
            isImporting
              ? 'opacity-50 cursor-not-allowed border-[#222] bg-[#0e0e0e]'
              : 'border-[#262626] hover:border-[#d4af37]/60 bg-[#101010]/80 hover:bg-[#141414]'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-[#181818] border border-[#282828] flex items-center justify-center mb-3 text-[#d4af37]">
            <FolderUp className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">
            Importer un Dossier Entier
          </h3>
          <p className="text-xs text-neutral-400 max-w-xs mb-3">
            Scanne et importe automatiquement toutes les musiques d'un répertoire.
          </p>
          <span className="text-[11px] font-mono-numbers px-2.5 py-1 bg-[#1a170d] text-[#d4af37] border border-[#d4af37]/30 rounded-md">
            Détection automatique des sous-fichiers
          </span>
          <input
            type="file"
            ref={folderInputRef}
            // @ts-expect-error webkitdirectory is standard
            webkitdirectory=""
            directory=""
            multiple
            className="hidden"
            onChange={e => {
              if (e.target.files) processFiles(e.target.files);
            }}
          />
        </div>
      </div>

      {/* Live Import Progress Bar */}
      {isImporting && (
        <div className="bg-[#141414] border border-[#d4af37]/40 rounded-xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#d4af37] animate-spin" />
              <span className="text-white font-bold">Importation en cours...</span>
            </div>
            <span className="font-mono-numbers text-[#d4af37] font-bold">
              {progress.current} / {progress.total} ({progress.percent}%)
            </span>
          </div>

          <div className="w-full bg-[#222] h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#d4af37] to-[#f7e08c] h-full rounded-full transition-all duration-200"
              style={{ width: `${progress.percent}%` }}
            />
          </div>

          <div className="text-[11px] font-mono-numbers text-neutral-400 truncate">
            Fichier en cours d'enregistrement : <span className="text-white">{progress.fileName}</span>
          </div>
        </div>
      )}

      {/* Import Summary */}
      {importSummary && (
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Importation terminée</h4>
              <p className="text-[11px] text-neutral-400">
                {importSummary.imported} son(s) importé(s) avec succès · {importSummary.duplicates} doublon(s) ignoré(s)
              </p>
            </div>
          </div>
          <button
            onClick={() => setImportSummary(null)}
            className="text-xs text-[#d4af37] hover:underline"
          >
            Fermer le résumé
          </button>
        </div>
      )}
    </div>
  );
}
