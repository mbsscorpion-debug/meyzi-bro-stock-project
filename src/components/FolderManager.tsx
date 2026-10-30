/**
 * MEYZI BRO STOCK PROJECT — Professional Folder & Directory Manager
 * Organizes music by folders, sub-folders, batch moves/copies, folder imports & ZIP exports.
 */

import React, { useState } from 'react';
import {
  Folder as FolderIcon,
  FolderPlus,
  FolderOpen,
  Edit2,
  Trash2,
  Download,
  Upload,
  MoveRight,
  Music,
  CheckSquare,
  Square,
  ChevronRight,
  MoreVertical,
  Plus,
  FileArchive,
  ArrowRight
} from 'lucide-react';
import { Folder, Song } from '../types';
import JSZip from 'jszip';
import { getAudioBlob } from '../services/storage';

interface FolderManagerProps {
  folders: Folder[];
  songs: Song[];
  currentFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string, parentId?: string | null, color?: string) => Promise<void>;
  onRenameFolder: (folderId: string, newName: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onMoveSongsToFolder: (songIds: number[], targetFolderId: string | null) => Promise<void>;
  onImportFolderFromDisk: (files: FileList) => Promise<void>;
  onPlaySong: (song: Song) => void;
  showToast: (msg: string) => void;
}

export default function FolderManager({
  folders,
  songs,
  currentFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveSongsToFolder,
  onImportFolderFromDisk,
  onPlaySong,
  showToast
}: FolderManagerProps) {
  // UI states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);
  const [newFolderColor, setNewFolderColor] = useState('#d4af37');

  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [editName, setEditName] = useState('');

  // Multi-select songs inside current folder
  const [selectedSongIds, setSelectedSongIds] = useState<number[]>([]);
  const [targetMoveFolderId, setTargetMoveFolderId] = useState<string>('');
  const [isExportingZip, setIsExportingZip] = useState(false);

  // Hidden folder input ref
  const folderInputRef = React.useRef<HTMLInputElement | null>(null);

  // Active folder object
  const activeFolder = folders.find(f => f.id === currentFolderId) || null;

  // Songs filtered by folder
  const folderSongs = songs.filter(s => {
    if (currentFolderId === null) return true; // root or all
    return s.folderId === currentFolderId;
  });

  // Song count map
  const songCountMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const f of folders) {
      map[f.id] = songs.filter(s => s.folderId === f.id).length;
    }
    return map;
  }, [folders, songs]);

  // Handle Create Folder
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    await onCreateFolder(newFolderName.trim(), newFolderParentId, newFolderColor);
    setNewFolderName('');
    setNewFolderParentId(null);
    setIsCreateModalOpen(false);
  };

  // Handle Rename Folder
  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFolder || !editName.trim()) return;
    await onRenameFolder(editingFolder.id, editName.trim());
    setEditingFolder(null);
    setEditName('');
  };

  // Toggle selection
  const toggleSelectSong = (id: number) => {
    setSelectedSongIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedSongIds.length === folderSongs.length) {
      setSelectedSongIds([]);
    } else {
      setSelectedSongIds(folderSongs.map(s => s.id));
    }
  };

  // Batch move
  const handleBatchMove = async () => {
    if (selectedSongIds.length === 0) return;
    const dest = targetMoveFolderId === 'root' ? null : targetMoveFolderId;
    await onMoveSongsToFolder(selectedSongIds, dest);
    setSelectedSongIds([]);
    setTargetMoveFolderId('');
  };

  // Export folder as ZIP
  const handleExportFolderZip = async (folder: Folder) => {
    setIsExportingZip(true);
    showToast(`Génération du ZIP pour le dossier « ${folder.name} »...`);
    try {
      const zip = new JSZip();
      const songsInFolder = songs.filter(s => s.folderId === folder.id);

      if (songsInFolder.length === 0) {
        showToast('Aucun morceau dans ce dossier à exporter.');
        setIsExportingZip(false);
        return;
      }

      for (const song of songsInFolder) {
        let blob: Blob | null = await getAudioBlob(`song_${song.id}_audio`);
        if (!blob && song.audioFile && song.audioFile.startsWith('blob:')) {
          try {
            blob = await fetch(song.audioFile).then(r => r.blob());
          } catch {}
        }

        const ext = song.fileFormat || (song.originalFileName ? song.originalFileName.split('.').pop() : 'mp3');
        const filename = `${song.artist} - ${song.title}.${ext}`;

        if (blob) {
          zip.file(filename, blob);
        } else {
          // If audio blob is not found, export text metadata file
          zip.file(
            `${song.title}_metadata.txt`,
            `Titre: ${song.title}\nArtiste: ${song.artist}\nBPM: ${song.bpm}\nClé: ${song.keySignature}\nGenre: ${song.genre}`
          );
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folder.name.replace(/\s+/g, '_')}_MEYZI_BRO.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(`Dossier « ${folder.name} » exporté avec succès (${songsInFolder.length} sons) !`);
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la génération du ZIP.');
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#d4af37] font-semibold uppercase tracking-wider mb-1">
            <span>Gestionnaire de Dossiers</span>
            {activeFolder && (
              <>
                <span>/</span>
                <span className="text-white">{activeFolder.name}</span>
              </>
            )}
          </div>
          <h2 className="text-xl font-display font-bold text-white">
            {activeFolder ? activeFolder.name : 'Mes Dossiers Musicaux'}
          </h2>
          <p className="text-xs text-neutral-400">
            Créez vos dossiers personnalisés, déplacez vos musiques, importez des répertoires entiers ou exportez en ZIP.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Import Folder from disk */}
          <button
            onClick={() => folderInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171717] border border-[#2a2a2a] text-neutral-200 text-xs rounded-lg hover:border-[#d4af37]/60 transition-all"
            title="Importer un dossier complet depuis votre ordinateur"
          >
            <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Importer Dossier PC</span>
          </button>
          <input
            type="file"
            ref={folderInputRef}
            // @ts-expect-error webkitdirectory is standard on browsers
            webkitdirectory=""
            directory=""
            multiple
            className="hidden"
            onChange={e => {
              if (e.target.files && e.target.files.length > 0) {
                onImportFolderFromDisk(e.target.files);
              }
            }}
          />

          {/* New Folder Button */}
          <button
            onClick={() => {
              setNewFolderName('');
              setNewFolderParentId(activeFolder ? activeFolder.id : null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d4af37] text-black font-bold text-xs rounded-lg hover:bg-[#e2c14f] transition-all shadow-md active:scale-95"
          >
            <FolderPlus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Nouveau Dossier</span>
          </button>
        </div>
      </div>

      {/* Breadcrumb Navigation if inside folder */}
      {activeFolder && (
        <div className="flex items-center justify-between p-3 bg-[#121212] border border-[#1f1f1f] rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectFolder(null)}
              className="text-[#d4af37] hover:underline font-semibold"
            >
              Tous les dossiers
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-white font-bold">{activeFolder.name}</span>
            <span className="text-neutral-500 font-mono-numbers">({folderSongs.length} sons)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportFolderZip(activeFolder)}
              disabled={isExportingZip}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1a170d] border border-[#d4af37]/40 text-[#d4af37] text-[11px] rounded hover:bg-[#d4af37]/20"
            >
              <FileArchive className="w-3.5 h-3.5" />
              <span>Télécharger ZIP Dossier</span>
            </button>
            <button
              onClick={() => {
                setEditingFolder(activeFolder);
                setEditName(activeFolder.name);
              }}
              className="p-1 text-neutral-400 hover:text-white"
              title="Renommer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteFolder(activeFolder.id)}
              className="p-1 text-neutral-400 hover:text-rose-400"
              title="Supprimer dossier"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Grid of Folders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {folders
          .filter(f => (activeFolder ? f.parentId === activeFolder.id : !f.parentId))
          .map(f => {
            const count = songCountMap[f.id] || 0;
            const isCurrent = currentFolderId === f.id;

            return (
              <div
                key={f.id}
                className={`group relative bg-[#121212] border rounded-xl p-4 transition-all hover:border-[#d4af37]/60 flex flex-col justify-between ${
                  isCurrent ? 'border-[#d4af37] bg-[#16140d]' : 'border-[#1f1f1f]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      onClick={() => onSelectFolder(f.id)}
                      className="cursor-pointer w-10 h-10 rounded-lg flex items-center justify-center bg-[#181818] border border-[#2a2a2a] group-hover:border-[#d4af37] transition-colors"
                      style={{ color: f.color || '#d4af37' }}
                    >
                      <FolderIcon className="w-5 h-5 fill-current/20" />
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => handleExportFolderZip(f)}
                        disabled={isExportingZip}
                        className="p-1 text-neutral-400 hover:text-[#d4af37] rounded hover:bg-[#1a1a1a]"
                        title="Télécharger ce dossier en ZIP"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingFolder(f);
                          setEditName(f.name);
                        }}
                        className="p-1 text-neutral-400 hover:text-white rounded hover:bg-[#1a1a1a]"
                        title="Renommer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteFolder(f.id)}
                        className="p-1 text-neutral-400 hover:text-rose-400 rounded hover:bg-[#1a1a1a]"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3
                    onClick={() => onSelectFolder(f.id)}
                    className="text-sm font-bold text-white group-hover:text-[#d4af37] cursor-pointer truncate mb-1"
                  >
                    {f.name}
                  </h3>
                  <p className="text-[11px] text-neutral-400 line-clamp-1 mb-3">
                    {f.description || 'Dossier musical'}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#1c1c1c] flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-mono-numbers text-[11px]">{count} morceau{count !== 1 ? 'x' : ''}</span>
                  <button
                    onClick={() => onSelectFolder(f.id)}
                    className="text-[11px] text-[#d4af37] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Ouvrir</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Songs in selected folder + Batch Move Controls */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl overflow-hidden mt-6">
        <div className="p-4 bg-[#161616] border-b border-[#202020] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={selectAll}
              className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white"
            >
              {selectedSongIds.length > 0 && selectedSongIds.length === folderSongs.length ? (
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
              {activeFolder ? `Musiques dans « ${activeFolder.name} »` : 'Toutes les musiques'} (
              {folderSongs.length})
            </span>
          </div>

          {/* Batch move action dropdown */}
          {selectedSongIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Déplacer vers :</span>
              <select
                value={targetMoveFolderId}
                onChange={e => setTargetMoveFolderId(e.target.value)}
                className="h-8 bg-[#1f1f1f] border border-[#2a2a2a] rounded px-2 text-xs text-white"
              >
                <option value="">-- Choisir dossier --</option>
                <option value="root">Racine (Aucun dossier)</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleBatchMove}
                disabled={!targetMoveFolderId}
                className="px-3 py-1 bg-[#d4af37] text-black font-bold text-xs rounded hover:bg-[#e2c14f] disabled:opacity-40"
              >
                Déplacer
              </button>
            </div>
          )}
        </div>

        {folderSongs.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            Aucun morceau dans ce dossier. Vous pouvez importer des fichiers ou déplacer des musiques ici.
          </div>
        ) : (
          <div className="divide-y divide-[#1c1c1c]">
            {folderSongs.map(s => {
              const isSelected = selectedSongIds.includes(s.id);

              return (
                <div
                  key={s.id}
                  className={`p-3.5 flex items-center justify-between gap-4 hover:bg-[#151515] transition-colors ${
                    isSelected ? 'bg-[#18160e]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleSelectSong(s.id)}
                      className="text-neutral-400 hover:text-white"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#d4af37]" />
                      ) : (
                        <Square className="w-4 h-4 text-neutral-600" />
                      )}
                    </button>

                    <button
                      onClick={() => onPlaySong(s)}
                      className="w-8 h-8 rounded-full bg-[#d4af37] text-black flex items-center justify-center shrink-0 hover:bg-[#e2c14f]"
                    >
                      <Music className="w-4 h-4" />
                    </button>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{s.title}</h4>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {s.artist} {s.featuring && `ft. ${s.featuring}`} · {s.type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono-numbers text-neutral-400">
                    <span>{s.bpm} BPM</span>
                    <span>{s.duration}</span>

                    {/* Move single track */}
                    <select
                      value={s.folderId || 'root'}
                      onChange={e => {
                        const val = e.target.value === 'root' ? null : e.target.value;
                        onMoveSongsToFolder([s.id], val);
                      }}
                      className="h-7 bg-[#1c1c1c] border border-[#2a2a2a] rounded px-2 text-[11px] text-neutral-300"
                    >
                      <option value="root">Racine</option>
                      {folders.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Create Folder */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#282828] rounded-xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-display font-bold text-white mb-2">
              Créer un Nouveau Dossier
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Nommez votre dossier pour organiser vos albums, mixtapes ou instrumentales.
            </p>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Nom du dossier *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  placeholder="ex: MES SESSIONS 2026"
                  className="w-full h-8 bg-[#181818] border border-[#282828] rounded px-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Dossier parent (Sous-dossier)</label>
                <select
                  value={newFolderParentId || ''}
                  onChange={e => setNewFolderParentId(e.target.value || null)}
                  className="w-full h-8 bg-[#181818] border border-[#282828] rounded px-2 text-xs text-white"
                >
                  <option value="">-- Racine (Dossier principal) --</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>
                      📁 {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Couleur du dossier</label>
                <div className="flex items-center gap-2">
                  {['#d4af37', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewFolderColor(c)}
                      className={`w-6 h-6 rounded-full border-2 ${
                        newFolderColor === c ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 bg-[#181818] text-neutral-300 text-xs rounded hover:bg-[#222]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#d4af37] text-black font-bold text-xs rounded hover:bg-[#e2c14f]"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Rename Folder */}
      {editingFolder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#282828] rounded-xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-display font-bold text-white mb-2">Renommer le Dossier</h3>
            <form onSubmit={handleRename} className="space-y-3">
              <input
                type="text"
                required
                autoFocus
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full h-8 bg-[#181818] border border-[#282828] rounded px-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFolder(null)}
                  className="px-3 py-1.5 bg-[#181818] text-neutral-300 text-xs rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#d4af37] text-black font-bold text-xs rounded hover:bg-[#e2c14f]"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
