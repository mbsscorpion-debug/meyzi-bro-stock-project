/**
 * MEYZI BRO STOCK PROJECT — Playlists & Queue Manager
 */

import React, { useState } from 'react';
import {
  ListMusic,
  Plus,
  Play,
  Trash2,
  Music,
  Clock,
  Disc,
  MoreVertical,
  CheckCircle,
  X
} from 'lucide-react';
import { Playlist, Song } from '../types';
import { saveToStore, deleteFromStore } from '../services/storage';

interface PlaylistsManagerProps {
  playlists: Playlist[];
  songs: Song[];
  onPlaySongList: (songsToPlay: Song[], startIndex?: number) => void;
  onRefreshPlaylists: () => Promise<void>;
  showToast: (msg: string) => void;
}

export default function PlaylistsManager({
  playlists,
  songs,
  onPlaySongList,
  onRefreshPlaylists,
  showToast
}: PlaylistsManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Songs picker inside playlist
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const newPl: Playlist = {
      id: `pl_${Date.now()}`,
      name: newPlaylistName.trim(),
      songIds: [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    await saveToStore('playlists', newPl);
    await onRefreshPlaylists();
    setNewPlaylistName('');
    setIsCreateOpen(false);
    showToast(`Playlist « ${newPl.name} » créée.`);
  };

  const handleDelete = async (plId: string) => {
    if (window.confirm('Supprimer cette playlist ?')) {
      await deleteFromStore('playlists', plId);
      await onRefreshPlaylists();
      if (selectedPlaylist?.id === plId) setSelectedPlaylist(null);
      showToast('Playlist supprimée.');
    }
  };

  const handleToggleSongInPlaylist = async (songId: number) => {
    if (!selectedPlaylist) return;
    const exists = selectedPlaylist.songIds.includes(songId);
    const updatedIds = exists
      ? selectedPlaylist.songIds.filter(id => id !== songId)
      : [...selectedPlaylist.songIds, songId];

    const updatedPl: Playlist = {
      ...selectedPlaylist,
      songIds: updatedIds
    };

    await saveToStore('playlists', updatedPl);
    setSelectedPlaylist(updatedPl);
    await onRefreshPlaylists();
  };

  const playlistSongs = selectedPlaylist
    ? songs.filter(s => selectedPlaylist.songIds.includes(s.id))
    : [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#d4af37] font-semibold uppercase tracking-wider mb-1">
            <span>Playlists & Sélections</span>
          </div>
          <h2 className="text-xl font-display font-bold text-white">
            {selectedPlaylist ? selectedPlaylist.name : 'Mes Playlists'}
          </h2>
          <p className="text-xs text-neutral-400">
            Créez des sélections personnalisées pour vos sessions studio, scènes ou mixages.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d4af37] text-black font-bold text-xs rounded-lg hover:bg-[#e2c14f] transition-all self-start"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Nouvelle Playlist</span>
        </button>
      </div>

      {/* Grid of Playlists */}
      {!selectedPlaylist ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {playlists.length === 0 ? (
            <div className="col-span-full bg-[#121212] border border-[#1f1f1f] rounded-xl p-8 text-center text-xs text-neutral-400">
              Aucune playlist créée. Cliquez sur « Nouvelle Playlist » pour démarrer votre première sélection.
            </div>
          ) : (
            playlists.map(pl => {
              const count = pl.songIds.length;
              return (
                <div
                  key={pl.id}
                  className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-5 hover:border-[#d4af37]/60 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-[#181818] border border-[#262626] flex items-center justify-center text-[#d4af37]">
                        <ListMusic className="w-5 h-5" />
                      </div>
                      <button
                        onClick={() => handleDelete(pl.id)}
                        className="p-1 text-neutral-500 hover:text-rose-400"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3
                      onClick={() => setSelectedPlaylist(pl)}
                      className="text-base font-bold text-white cursor-pointer hover:text-[#d4af37] truncate mb-1"
                    >
                      {pl.name}
                    </h3>
                    <p className="text-xs text-neutral-400 mb-4 font-mono-numbers">
                      {count} morceau{count !== 1 ? 'x' : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#1c1c1c]">
                    <button
                      onClick={() => setSelectedPlaylist(pl)}
                      className="flex-1 py-1.5 bg-[#171717] hover:bg-[#202020] text-xs font-semibold text-neutral-300 rounded"
                    >
                      Voir morceaux
                    </button>
                    {count > 0 && (
                      <button
                        onClick={() => {
                          const plSongs = songs.filter(s => pl.songIds.includes(s.id));
                          onPlaySongList(plSongs, 0);
                        }}
                        className="px-3 py-1.5 bg-[#d4af37] text-black font-bold text-xs rounded hover:bg-[#e2c14f] flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Lire</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Inside selected playlist */
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#141414] border border-[#1f1f1f] rounded-xl">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="text-xs text-[#d4af37] hover:underline"
              >
                &larr; Toutes les playlists
              </button>
              <span className="text-neutral-600">|</span>
              <span className="text-sm font-bold text-white">{selectedPlaylist.name}</span>
              <span className="text-xs text-neutral-400 font-mono-numbers">
                ({playlistSongs.length} morceaux)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddSongModalOpen(true)}
                className="px-3 py-1 bg-[#1a170d] border border-[#d4af37]/40 text-[#d4af37] text-xs rounded hover:bg-[#d4af37] hover:text-black font-semibold transition-all"
              >
                + Ajouter des morceaux
              </button>
              {playlistSongs.length > 0 && (
                <button
                  onClick={() => onPlaySongList(playlistSongs, 0)}
                  className="px-3 py-1 bg-[#d4af37] text-black font-bold text-xs rounded hover:bg-[#e2c14f] flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Tout lire</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl overflow-hidden divide-y divide-[#1c1c1c]">
            {playlistSongs.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                Cette playlist est vide. Cliquez sur « + Ajouter des morceaux » pour y insérer vos musiques.
              </div>
            ) : (
              playlistSongs.map((s, idx) => (
                <div
                  key={s.id}
                  className="p-3.5 flex items-center justify-between gap-4 hover:bg-[#161616] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono-numbers text-xs text-neutral-500 w-5">
                      {idx + 1}
                    </span>
                    <button
                      onClick={() => onPlaySongList(playlistSongs, idx)}
                      className="w-8 h-8 rounded-full bg-[#d4af37] text-black flex items-center justify-center shrink-0 hover:bg-[#e2c14f]"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </button>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{s.title}</h4>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {s.artist} · {s.duration}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleSongInPlaylist(s.id)}
                    className="p-1.5 text-neutral-500 hover:text-rose-400 text-xs"
                    title="Retirer de la playlist"
                  >
                    Retirer
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal: Create Playlist */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#282828] rounded-xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-display font-bold text-white mb-2">
              Nouvelle Playlist
            </h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                required
                autoFocus
                value={newPlaylistName}
                onChange={e => setNewPlaylistName(e.target.value)}
                placeholder="ex: Live Set 2026, Drill Favoris..."
                className="w-full h-8 bg-[#181818] border border-[#282828] rounded px-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
              />
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 bg-[#181818] text-neutral-300 text-xs rounded"
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

      {/* Modal: Pick Songs for Playlist */}
      {isAddSongModalOpen && selectedPlaylist && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#282828] rounded-xl max-w-lg w-full p-6 shadow-2xl relative max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">
                Ajouter des sons à « {selectedPlaylist.name} »
              </h3>
              <button
                onClick={() => setIsAddSongModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#1c1c1c] my-2 pr-1">
              {songs.map(s => {
                const isChecked = selectedPlaylist.songIds.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => handleToggleSongInPlaylist(s.id)}
                    className="py-2.5 px-2 flex items-center justify-between cursor-pointer hover:bg-[#181818] rounded"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="text-xs font-bold text-white truncate">{s.title}</div>
                      <div className="text-[11px] text-neutral-400 truncate">{s.artist}</div>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        isChecked
                          ? 'bg-[#d4af37] text-black'
                          : 'bg-[#222] text-neutral-400'
                      }`}
                    >
                      {isChecked ? 'Ajouté ✓' : '+ Ajouter'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#202020] flex justify-end">
              <button
                onClick={() => setIsAddSongModalOpen(false)}
                className="px-4 py-1.5 bg-[#d4af37] text-black font-bold text-xs rounded hover:bg-[#e2c14f]"
              >
                Terminer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
