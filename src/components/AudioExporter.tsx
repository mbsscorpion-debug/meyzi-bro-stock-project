/**
 * MEYZI BRO STOCK PROJECT — Professional Audio Exporter
 * Exports individual tracks, multi-selection, complete folders & full albums in original formats or ZIP.
 */

import React, { useState } from 'react';
import {
  Download,
  FileArchive,
  Folder,
  Music,
  Disc3,
  CheckSquare,
  Square,
  RefreshCw,
  HardDrive,
  CheckCircle,
  FileAudio
} from 'lucide-react';
import JSZip from 'jszip';
import { Song, Folder as FolderType, Project } from '../types';
import { getAudioBlob } from '../services/storage';

interface AudioExporterProps {
  songs: Song[];
  folders: FolderType[];
  projects: Project[];
  showToast: (msg: string) => void;
}

export default function AudioExporter({
  songs,
  folders,
  projects,
  showToast
}: AudioExporterProps) {
  const [selectedSongIds, setSelectedSongIds] = useState<number[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<{
    percent: number;
    currentName: string;
    stage: string;
  }>({ percent: 0, currentName: '', stage: '' });

  // Toggle selection
  const toggleSelect = (id: number) => {
    setSelectedSongIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedSongIds.length === songs.length) {
      setSelectedSongIds([]);
    } else {
      setSelectedSongIds(songs.map(s => s.id));
    }
  };

  // Helper to get audio blob or fallback
  const resolveAudioBlob = async (song: Song): Promise<{ blob: Blob | null; ext: string }> => {
    let blob = await getAudioBlob(`song_${song.id}_audio`);
    if (!blob && song.audioFile && song.audioFile.startsWith('blob:')) {
      try {
        blob = await fetch(song.audioFile).then(r => r.blob());
      } catch {}
    }
    const ext = song.fileFormat?.toLowerCase() || (song.originalFileName ? song.originalFileName.split('.').pop() || 'mp3' : 'mp3');
    return { blob, ext };
  };

  // Export Single Song in Original Format
  const handleExportSingleSong = async (song: Song) => {
    try {
      showToast(`Exportation de « ${song.title} »...`);
      const { blob, ext } = await resolveAudioBlob(song);

      const filename = `${song.artist} - ${song.title}.${ext}`;
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`Morceau « ${filename} » téléchargé.`);
      } else {
        // Fallback: download metadata
        const meta = `Titre: ${song.title}\nArtiste: ${song.artist}\nBPM: ${song.bpm}\nClé: ${song.keySignature}`;
        const metaBlob = new Blob([meta], { type: 'text/plain' });
        const url = URL.createObjectURL(metaBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${song.title}_info.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`Fiche de métadonnées téléchargée.`);
      }
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'exportation du morceau.");
    }
  };

  // Export Multiple Selected Songs as ZIP
  const handleExportSelectedAsZip = async () => {
    if (selectedSongIds.length === 0) return;

    setIsExporting(true);
    setExportProgress({ percent: 5, currentName: 'Initialisation...', stage: 'Préparation des fichiers' });

    try {
      const zip = new JSZip();
      const songsToExport = songs.filter(s => selectedSongIds.includes(s.id));
      const total = songsToExport.length;

      for (let i = 0; i < total; i++) {
        const s = songsToExport[i];
        const percent = Math.round(((i + 1) / total) * 80);
        setExportProgress({
          percent,
          currentName: `${s.title}`,
          stage: `Traitement du fichier ${i + 1}/${total}`
        });

        const { blob, ext } = await resolveAudioBlob(s);
        const filename = `${s.artist} - ${s.title}.${ext}`;
        if (blob) {
          zip.file(filename, blob);
        } else {
          zip.file(`${s.title}_meta.txt`, `Titre: ${s.title}\nArtiste: ${s.artist}\nBPM: ${s.bpm}`);
        }
      }

      setExportProgress({ percent: 90, currentName: 'Compression ZIP...', stage: 'Génération de l\'archive' });
      const content = await zip.generateAsync({ type: 'blob' });

      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MEYZI_BRO_SELECTION_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportProgress({ percent: 100, currentName: 'Terminé', stage: 'Téléchargement lancé' });
      showToast(`${total} morceau(x) exporté(s) au format ZIP !`);
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'exportation ZIP.");
    } finally {
      setIsExporting(false);
    }
  };

  // Export Complete Folder as ZIP
  const handleExportFolder = async (folder: FolderType) => {
    const songsInFolder = songs.filter(s => s.folderId === folder.id);
    if (songsInFolder.length === 0) {
      showToast(`Le dossier « ${folder.name} » est vide.`);
      return;
    }

    setIsExporting(true);
    setExportProgress({ percent: 10, currentName: folder.name, stage: 'Préparation du dossier' });

    try {
      const zip = new JSZip();
      const folderZip = zip.folder(folder.name) || zip;
      const total = songsInFolder.length;

      for (let i = 0; i < total; i++) {
        const s = songsInFolder[i];
        setExportProgress({
          percent: Math.round(((i + 1) / total) * 85),
          currentName: s.title,
          stage: `Ajout au dossier ZIP (${i + 1}/${total})`
        });

        const { blob, ext } = await resolveAudioBlob(s);
        const filename = `${s.artist} - ${s.title}.${ext}`;
        if (blob) {
          folderZip.file(filename, blob);
        }
      }

      setExportProgress({ percent: 92, currentName: 'Finalisation...', stage: 'Création de l\'archive ZIP' });
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folder.name.replace(/\s+/g, '_')}_ARCHIVE.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(`Dossier « ${folder.name} » exporté (${total} sons) !`);
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'exportation du dossier.");
    } finally {
      setIsExporting(false);
    }
  };

  // Export Full Album / Project
  const handleExportProject = async (project: Project) => {
    const projectSongs = songs.filter(s => s.projectId === project.id || s.projectName === project.name);
    if (projectSongs.length === 0) {
      showToast(`Aucun morceau associé au projet « ${project.name} »`);
      return;
    }

    setIsExporting(true);
    try {
      const zip = new JSZip();
      const albumZip = zip.folder(project.name) || zip;
      const total = projectSongs.length;

      for (let i = 0; i < total; i++) {
        const s = projectSongs[i];
        setExportProgress({
          percent: Math.round(((i + 1) / total) * 85),
          currentName: s.title,
          stage: `Morceau ${i + 1}/${total}`
        });

        const { blob, ext } = await resolveAudioBlob(s);
        const filename = `${String(i + 1).padStart(2, '0')}. ${s.artist} - ${s.title}.${ext}`;
        if (blob) {
          albumZip.file(filename, blob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ALBUM_${project.name.replace(/\s+/g, '_')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(`Album « ${project.name} » exporté avec succès !`);
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'exportation de l'album.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs text-[#d4af37] font-semibold uppercase tracking-wider mb-1">
          <span>Centre d'Exportation & Téléchargement</span>
        </div>
        <h2 className="text-xl font-display font-bold text-white">
          Exporter vos Musiques, Dossiers & Albums
        </h2>
        <p className="text-xs text-neutral-400">
          Téléchargez vos morceaux dans leur format d'origine (MP3, WAV, FLAC, etc.) ou générez des archives ZIP complètes de vos dossiers.
        </p>
      </div>

      {/* Progress Bar if Exporting */}
      {isExporting && (
        <div className="bg-[#141414] border border-[#d4af37]/40 rounded-xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#d4af37] animate-spin" />
              <span className="text-white font-bold">{exportProgress.stage}</span>
            </div>
            <span className="font-mono-numbers text-[#d4af37] font-bold">
              {exportProgress.percent}%
            </span>
          </div>
          <div className="w-full bg-[#222] h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#d4af37] to-[#f7e08c] h-full rounded-full transition-all duration-200"
              style={{ width: `${exportProgress.percent}%` }}
            />
          </div>
          <div className="text-[11px] font-mono-numbers text-neutral-400 truncate">
            Fichier : <span className="text-white">{exportProgress.currentName}</span>
          </div>
        </div>
      )}

      {/* 1. Export by Folder Cards */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <Folder className="w-4 h-4 text-[#d4af37]" />
          <span>Exporter par Dossier Complet (ZIP)</span>
        </h3>

        {folders.length === 0 ? (
          <p className="text-xs text-neutral-500">Aucun dossier créé.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {folders.map(f => {
              const count = songs.filter(s => s.folderId === f.id).length;
              return (
                <div
                  key={f.id}
                  className="bg-[#161616] border border-[#222] rounded-lg p-3.5 flex items-center justify-between hover:border-[#d4af37]/50 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <h4 className="text-xs font-bold text-white truncate">{f.name}</h4>
                    <span className="text-[11px] font-mono-numbers text-neutral-400">
                      {count} morceau{count !== 1 ? 'x' : ''}
                    </span>
                  </div>
                  <button
                    onClick={() => handleExportFolder(f)}
                    disabled={isExporting || count === 0}
                    className="p-2 rounded-lg bg-[#1a170d] border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all disabled:opacity-30 shrink-0"
                    title="Télécharger ZIP"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Export by Project / Album */}
      {projects.length > 0 && (
        <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <Disc3 className="w-4 h-4 text-[#d4af37]" />
            <span>Exporter des Albums Complets</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {projects.map(p => {
              const count = songs.filter(s => s.projectId === p.id).length;
              return (
                <div
                  key={p.id}
                  className="bg-[#161616] border border-[#222] rounded-lg p-3.5 flex items-center justify-between hover:border-[#d4af37]/50 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                    <span className="text-[11px] font-mono-numbers text-neutral-400">
                      {p.type} · {count} titre{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <button
                    onClick={() => handleExportProject(p)}
                    disabled={isExporting}
                    className="p-2 rounded-lg bg-[#1a170d] border border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all disabled:opacity-30 shrink-0"
                    title="Télécharger Album ZIP"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Export Single or Multi-Selected Songs */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl overflow-hidden">
        <div className="p-4 bg-[#161616] border-b border-[#202020] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={selectAll}
              className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white"
            >
              {selectedSongIds.length > 0 && selectedSongIds.length === songs.length ? (
                <CheckSquare className="w-4 h-4 text-[#d4af37]" />
              ) : (
                <Square className="w-4 h-4 text-neutral-500" />
              )}
              <span>
                {selectedSongIds.length > 0
                  ? `${selectedSongIds.length} sélectionné(s)`
                  : 'Tout sélectionner'}
              </span>
            </button>
            <span className="text-neutral-600">|</span>
            <span className="text-xs text-neutral-400">
              Liste de tous les morceaux ({songs.length})
            </span>
          </div>

          {selectedSongIds.length > 0 && (
            <button
              onClick={handleExportSelectedAsZip}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#d4af37] text-black font-bold text-xs rounded-lg hover:bg-[#e2c14f] transition-all shadow-md"
            >
              <FileArchive className="w-4 h-4 stroke-[2.5]" />
              <span>Télécharger la sélection en ZIP ({selectedSongIds.length})</span>
            </button>
          )}
        </div>

        {songs.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            Aucun morceau disponible dans votre stockage. Importez des morceaux d'abord.
          </div>
        ) : (
          <div className="divide-y divide-[#1c1c1c]">
            {songs.map(s => {
              const isSelected = selectedSongIds.includes(s.id);
              const fmt = s.fileFormat || 'MP3';

              return (
                <div
                  key={s.id}
                  className={`p-3.5 flex items-center justify-between gap-4 hover:bg-[#151515] transition-colors ${
                    isSelected ? 'bg-[#18160e]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleSelect(s.id)}
                      className="text-neutral-400 hover:text-white"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#d4af37]" />
                      ) : (
                        <Square className="w-4 h-4 text-neutral-600" />
                      )}
                    </button>

                    <FileAudio className="w-4 h-4 text-[#d4af37] shrink-0" />

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{s.title}</h4>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {s.artist} · <span className="text-[#d4af37]">{fmt}</span>
                        {s.fileSize && (
                          <span className="font-mono-numbers">
                            {' '}· {(s.fileSize / 1024 / 1024).toFixed(2)} MB
                          </span>
                        )}
                        {s.folderName && <span> · 📁 {s.folderName}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleExportSingleSong(s)}
                      disabled={isExporting}
                      className="flex items-center gap-1.5 px-3 py-1 bg-[#1a1a1a] hover:bg-[#d4af37] text-neutral-300 hover:text-black font-semibold text-xs rounded transition-all border border-[#2a2a2a]"
                      title="Télécharger fichier original"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger {fmt}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
