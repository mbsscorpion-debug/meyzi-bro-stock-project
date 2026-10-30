/**
 * MEYZI BRO STOCK PROJECT — Professional Music Vault & Studio Player
 * Artiste : MEYZI BRO OFFICIEL
 * Includes Folder Manager, Batch Importer, Audio Exporter, 8-Mode Visualizer,
 * Repeat, Shuffle, Queue, and IndexedDB Persistent Storage.
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Music,
  Disc3,
  Disc,
  Radio,
  Sliders,
  FolderTree,
  Archive,
  Users,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Layers,
  Flame,
  FileCode,
  Eye,
  Trash2,
  X,
  Upload,
  ShieldCheck,
  FileAudio,
  Folder,
  FolderPlus,
  ListMusic,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  Maximize2,
  Minimize2,
  Activity,
  ListOrdered,
  Settings,
  FolderUp,
  FileArchive
} from 'lucide-react';
import {
  Song,
  Project,
  Instrumental,
  MediaFile,
  Collaborator,
  Folder as FolderType,
  Playlist,
  SongType,
  SongStatus,
  RepeatMode
} from './types';
import { SCORPION_LOGO } from './data/initialData';
import { studioAudio } from './services/audioEngine';
import { downloadXamppZip } from './services/exportZip';
import {
  getAllFromStore,
  saveToStore,
  deleteFromStore,
  clearStore,
  saveAudioBlob,
  getAudioBlob,
  deleteAudioBlob,
  initDefaultFoldersIfEmpty
} from './services/storage';

import StudioVisualizer from './components/StudioVisualizer';
import FolderManager from './components/FolderManager';
import AudioBatchImporter from './components/AudioBatchImporter';
import AudioExporter from './components/AudioExporter';
import PlaylistsManager from './components/PlaylistsManager';
import LibrarySettings from './components/LibrarySettings';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<string>('songs');

  // Core Persistent States
  const [songs, setSongs] = useState<Song[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [instrumentals, setInstrumentals] = useState<Instrumental[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  // Playback & Queue State
  const [currentTrack, setCurrentTrack] = useState<{
    song?: Song;
    instrumental?: Instrumental;
    title: string;
    artist: string;
    cover: string;
    bpm: number;
    audioUrl?: string;
  } | null>(null);

  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);

  const [playbackState, setPlaybackState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 180,
    volume: 0.8,
    isSynthesizing: false
  });

  // UI Modals & Forms
  const [isAddSongOpen, setIsAddSongOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [selectedSongDetails, setSelectedSongDetails] = useState<Song | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // File Upload inside New Song Modal
  const [uploadedAudioFile, setUploadedAudioFile] = useState<File | null>(null);
  const [uploadedCoverFile, setUploadedCoverFile] = useState<File | null>(null);

  const [newSongForm, setNewSongForm] = useState({
    title: '',
    type: 'Single' as SongType,
    projectId: '',
    folderId: '',
    artist: 'MEYZI BRO OFFICIEL',
    featuring: '',
    producer: 'Scorpion Beats',
    composer: 'MEYZI BRO',
    studio: 'Studio Gold Sound',
    genre: 'Rap / Drill / Trap',
    year: new Date().getFullYear(),
    bpm: 140,
    keySignature: 'D Minor',
    duration: '03:15',
    status: 'Terminé' as SongStatus,
    lyrics: '',
    notes: ''
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Helper Toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Refresh all state from IndexedDB
  const refreshAllData = useCallback(async () => {
    try {
      const [savedSongs, savedFolders, savedPlaylists, savedProjects, savedFiles, savedInstru, savedCollabs] = await Promise.all([
        getAllFromStore<Song>('songs'),
        initDefaultFoldersIfEmpty(),
        getAllFromStore<Playlist>('playlists'),
        getAllFromStore<Project>('projects'),
        getAllFromStore<MediaFile>('files'),
        getAllFromStore<Instrumental>('instrumentals'),
        getAllFromStore<Collaborator>('collaborators')
      ]);

      setSongs(savedSongs);
      setFolders(savedFolders);
      setPlaylists(savedPlaylists);
      setProjects(savedProjects);
      setFiles(savedFiles);
      setInstrumentals(savedInstru);
      setCollaborators(savedCollabs);
    } catch (err) {
      console.error('Error refreshing IndexedDB data:', err);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Audio Engine State Listener
  useEffect(() => {
    const unsub = studioAudio.subscribe(() => {
      setPlaybackState(studioAudio.getPlaybackState());
    });
    return unsub;
  }, []);

  // Visualizer loop for Bottom Player bar
  useEffect(() => {
    let animId: number;
    const buffer = new Uint8Array(32);

    const render = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          studioAudio.getVisualizerData(buffer);

          const barCount = 16;
          const barWidth = canvas.width / barCount - 2;

          for (let i = 0; i < barCount; i++) {
            const val = buffer[i] || (playbackState.isPlaying ? Math.sin(Date.now() / 150 + i) * 30 + 40 : 4);
            const height = Math.max(2, (val / 255) * canvas.height);
            const x = i * (barWidth + 2);
            const y = canvas.height - height;

            const grad = ctx.createLinearGradient(0, y, 0, canvas.height);
            grad.addColorStop(0, '#f7e08c');
            grad.addColorStop(0.5, '#d4af37');
            grad.addColorStop(1, '#aa8210');

            ctx.fillStyle = playbackState.isPlaying ? grad : 'rgba(212, 175, 55, 0.2)';
            ctx.fillRect(x, y, barWidth, height);
          }
        }
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [playbackState.isPlaying]);

  // Helper duration parser
  const parseDuration = (dur: string) => {
    if (!dur) return 180;
    const parts = dur.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return 180;
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Play a song and update queue
  const handlePlaySong = async (song: Song, newQueue?: Song[]) => {
    if (currentTrack?.song?.id === song.id) {
      studioAudio.togglePlay();
      return;
    }

    let playableUrl = song.audioFile;

    // Retrieve from IndexedDB if stored as blob
    const blob = await getAudioBlob(`song_${song.id}_audio`);
    if (blob) {
      playableUrl = URL.createObjectURL(blob);
    }

    let coverUrl = song.coverFile || SCORPION_LOGO;
    const coverBlob = await getAudioBlob(`song_${song.id}_cover`);
    if (coverBlob) {
      coverUrl = URL.createObjectURL(coverBlob);
    }

    setCurrentTrack({
      song,
      title: song.title,
      artist: song.artist,
      cover: coverUrl,
      bpm: song.bpm || 140,
      audioUrl: playableUrl
    });

    // Update queue if provided or use current songs list
    const activeList = newQueue || (queue.length > 0 ? queue : songs);
    setQueue(activeList);
    const idx = activeList.findIndex(s => s.id === song.id);
    setQueueIndex(idx !== -1 ? idx : 0);

    const parsedDur = parseDuration(song.duration);
    studioAudio.playTrack(playableUrl, song.bpm, parsedDur);
  };

  // Next Track logic
  const handleNextTrack = useCallback(() => {
    if (queue.length === 0) return;

    if (repeatMode === 'one' && currentTrack?.song) {
      handlePlaySong(currentTrack.song);
      return;
    }

    let nextIdx = queueIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        // End of queue
        return;
      }
    }

    const nextSong = queue[nextIdx];
    if (nextSong) {
      setQueueIndex(nextIdx);
      handlePlaySong(nextSong);
    }
  }, [queue, queueIndex, repeatMode, isShuffle, currentTrack]);

  // Previous Track logic
  const handlePrevTrack = useCallback(() => {
    if (queue.length === 0) return;
    if (playbackState.currentTime > 3) {
      studioAudio.seek(0);
      return;
    }

    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }
    const prevSong = queue[prevIdx];
    if (prevSong) {
      setQueueIndex(prevIdx);
      handlePlaySong(prevSong);
    }
  }, [queue, queueIndex, playbackState.currentTime]);

  // Hook auto-play next track into Audio Engine
  useEffect(() => {
    studioAudio.setOnTrackEnded(() => {
      handleNextTrack();
    });
  }, [handleNextTrack]);

  // Toggle repeat mode: off -> all -> one
  const toggleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  };

  // Play entire list
  const handlePlaySongList = (songsToPlay: Song[], startIndex = 0) => {
    if (songsToPlay.length === 0) return;
    setQueue(songsToPlay);
    setQueueIndex(startIndex);
    handlePlaySong(songsToPlay[startIndex], songsToPlay);
  };

  // Folder Operations
  const handleCreateFolder = async (name: string, parentId?: string | null, color?: string) => {
    const newFolder: FolderType = {
      id: `fld_${Date.now()}`,
      name,
      parentId: parentId || null,
      color: color || '#d4af37',
      createdAt: new Date().toISOString().split('T')[0]
    };
    await saveToStore('folders', newFolder);
    setFolders(prev => [...prev, newFolder]);
    showToast(`Dossier « ${name} » créé.`);
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    const f = folders.find(x => x.id === folderId);
    if (!f) return;
    const updated = { ...f, name: newName };
    await saveToStore('folders', updated);
    setFolders(prev => prev.map(x => (x.id === folderId ? updated : x)));
    showToast('Dossier renommé.');
  };

  const handleDeleteFolder = async (folderId: string) => {
    const f = folders.find(x => x.id === folderId);
    if (!f) return;
    if (window.confirm(`Supprimer le dossier « ${f.name} » ? Les morceaux seront remis à la racine.`)) {
      await deleteFromStore('folders', folderId);
      // Reset songs in that folder to root
      const affectedSongs = songs.filter(s => s.folderId === folderId);
      for (const s of affectedSongs) {
        const updated = { ...s, folderId: null, folderName: undefined };
        await saveToStore('songs', updated);
      }
      setFolders(prev => prev.filter(x => x.id !== folderId));
      if (activeFolderId === folderId) setActiveFolderId(null);
      await refreshAllData();
      showToast('Dossier supprimé.');
    }
  };

  const handleMoveSongsToFolder = async (songIds: number[], targetFolderId: string | null) => {
    const targetFolder = folders.find(f => f.id === targetFolderId);
    const updatedSongs = songs.map(s => {
      if (songIds.includes(s.id)) {
        return {
          ...s,
          folderId: targetFolderId,
          folderName: targetFolder ? targetFolder.name : undefined
        };
      }
      return s;
    });

    for (const id of songIds) {
      const s = updatedSongs.find(x => x.id === id);
      if (s) await saveToStore('songs', s);
    }

    setSongs(updatedSongs);
    showToast(`${songIds.length} morceau(x) déplacé(s) vers « ${targetFolder ? targetFolder.name : 'Racine'} ».`);
  };

  // Import folder directly from disk
  const handleImportFolderFromDisk = async (filesList: FileList) => {
    const audioRegex = /\.(mp3|wav|flac|aac|m4a|ogg)$/i;
    const filesArr = Array.from(filesList).filter(f => audioRegex.test(f.name));

    if (filesArr.length === 0) {
      showToast('Aucun fichier audio supporté dans ce dossier.');
      return;
    }

    // Determine folder name from webkitRelativePath
    const samplePath = filesArr[0].webkitRelativePath || '';
    const folderName = samplePath.split('/')[0] || `IMPORT_${Date.now()}`;

    // Create or find folder
    let targetFolder = folders.find(f => f.name.toLowerCase() === folderName.toLowerCase());
    if (!targetFolder) {
      targetFolder = {
        id: `fld_${Date.now()}`,
        name: folderName,
        createdAt: new Date().toISOString().split('T')[0]
      };
      await saveToStore('folders', targetFolder);
      setFolders(prev => [...prev, targetFolder!]);
    }

    showToast(`Importation de ${filesArr.length} sons dans « ${folderName} »...`);

    const newSongs: Song[] = [];
    for (let i = 0; i < filesArr.length; i++) {
      const file = filesArr[i];
      const songId = Date.now() + i;
      await saveAudioBlob(`song_${songId}_audio`, file);

      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_]/g, ' ');
      const newSong: Song = {
        id: songId,
        title: cleanTitle,
        type: 'Single',
        folderId: targetFolder.id,
        folderName: targetFolder.name,
        artist: 'MEYZI BRO OFFICIEL',
        genre: 'Rap / Hip-Hop',
        year: new Date().getFullYear(),
        bpm: 140,
        keySignature: 'D Minor',
        duration: '03:15',
        status: 'Terminé',
        originalFileName: file.name,
        fileFormat: file.name.split('.').pop()?.toUpperCase() || 'MP3',
        fileSize: file.size,
        audioFile: URL.createObjectURL(file),
        createdAt: new Date().toISOString().split('T')[0]
      };
      await saveToStore('songs', newSong);
      newSongs.push(newSong);
    }

    setSongs(prev => [...newSongs, ...prev]);
    showToast(`Dossier « ${folderName} » importé avec succès (${newSongs.length} musiques) !`);
  };

  // Save new single song from modal
  const handleSaveNewSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSongForm.title.trim()) {
      showToast('Veuillez entrer un titre.');
      return;
    }

    const songId = Date.now();
    let audioUrl = '';
    let coverUrl = SCORPION_LOGO;

    if (uploadedAudioFile) {
      await saveAudioBlob(`song_${songId}_audio`, uploadedAudioFile);
      audioUrl = URL.createObjectURL(uploadedAudioFile);

      const newFileEntry: MediaFile = {
        id: songId,
        fileName: uploadedAudioFile.name,
        filePath: `uploads/audio/${uploadedAudioFile.name}`,
        fileType: uploadedAudioFile.type || 'audio/mpeg',
        fileSize: uploadedAudioFile.size,
        category: 'Audio',
        songId: songId,
        songTitle: newSongForm.title,
        folderId: newSongForm.folderId || null,
        createdAt: new Date().toISOString().split('T')[0]
      };
      await saveToStore('files', newFileEntry);
      setFiles(prev => [newFileEntry, ...prev]);
    }

    if (uploadedCoverFile) {
      await saveAudioBlob(`song_${songId}_cover`, uploadedCoverFile);
      coverUrl = URL.createObjectURL(uploadedCoverFile);
    }

    const newSong: Song = {
      id: songId,
      title: newSongForm.title.trim(),
      type: newSongForm.type,
      projectId: newSongForm.projectId ? parseInt(newSongForm.projectId, 10) : null,
      projectName: projects.find(p => p.id.toString() === newSongForm.projectId)?.name,
      folderId: newSongForm.folderId || null,
      folderName: folders.find(f => f.id === newSongForm.folderId)?.name,
      artist: newSongForm.artist.trim() || 'MEYZI BRO OFFICIEL',
      featuring: newSongForm.featuring.trim(),
      producer: newSongForm.producer.trim(),
      composer: newSongForm.composer.trim(),
      studio: newSongForm.studio.trim(),
      genre: newSongForm.genre.trim(),
      year: newSongForm.year,
      bpm: newSongForm.bpm,
      keySignature: newSongForm.keySignature,
      duration: newSongForm.duration,
      status: newSongForm.status,
      lyrics: newSongForm.lyrics,
      notes: newSongForm.notes,
      audioFile: audioUrl,
      coverFile: coverUrl,
      createdAt: new Date().toISOString().split('T')[0]
    };

    await saveToStore('songs', newSong);
    setSongs(prev => [newSong, ...prev]);
    setIsAddSongOpen(false);
    showToast(`Song « ${newSong.title} » sauvegardé.`);

    setUploadedAudioFile(null);
    setUploadedCoverFile(null);
  };

  // Delete Song
  const handleDeleteSong = async (id: number) => {
    if (window.confirm('Supprimer définitivement ce morceau du stockage ?')) {
      await deleteFromStore('songs', id);
      await deleteAudioBlob(`song_${id}_audio`);
      await deleteAudioBlob(`song_${id}_cover`);

      setSongs(prev => prev.filter(s => s.id !== id));
      if (selectedSongDetails?.id === id) setSelectedSongDetails(null);
      if (currentTrack?.song?.id === id) {
        studioAudio.stop();
        setCurrentTrack(null);
      }
      showToast('Morceau supprimé.');
    }
  };

  // Filtered Songs
  const filteredSongs = useMemo(() => {
    return songs.filter(s => {
      const matchSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.producer && s.producer.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = typeFilter === 'all' || s.type === typeFilter;
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [songs, searchQuery, typeFilter, statusFilter]);

  return (
    <div className="flex h-screen bg-[#0b0b0b] text-neutral-100 font-sans overflow-hidden select-none">
      {/* ======================================================== */}
      {/* 1. SIDEBAR                                               */}
      {/* ======================================================== */}
      <aside className="w-64 bg-[#0e0e0e] border-r border-[#1f1f1f] flex flex-col shrink-0 z-30">
        {/* Brand & Identity */}
        <div className="p-4 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg overflow-hidden border border-[#d4af37]/40 shadow-sm shrink-0 bg-black flex items-center justify-center">
              <img
                src={SCORPION_LOGO}
                alt="Meyzi Bro Scorpion Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold font-display text-white tracking-wider truncate">
                MEYZI BRO
              </h1>
              <p className="text-[11px] font-semibold text-[#d4af37] tracking-widest uppercase">
                STOCK PROJECT
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#1c1c1c] flex items-center justify-between text-xs text-neutral-400">
            <span className="truncate">MEYZI BRO OFFICIEL</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" title="Studio Actif" />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
              currentView === 'dashboard'
                ? 'bg-[#181818] text-white border-l-2 border-[#d4af37]'
                : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
            }`}
          >
            <Radio className="w-4 h-4 text-[#d4af37]" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setCurrentView('songs')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
              currentView === 'songs'
                ? 'bg-[#181818] text-white border-l-2 border-[#d4af37]'
                : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Music className="w-4 h-4 text-[#d4af37]" />
              <span>Ma bibliothèque</span>
            </div>
            <span className="text-[11px] font-mono-numbers text-neutral-500">{songs.length}</span>
          </button>

          <button
            onClick={() => setCurrentView('folders')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
              currentView === 'folders'
                ? 'bg-[#181818] text-white border-l-2 border-[#d4af37]'
                : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Folder className="w-4 h-4 text-[#d4af37]" />
              <span>Mes dossiers</span>
            </div>
            <span className="text-[11px] font-mono-numbers text-neutral-500">{folders.length}</span>
          </button>

          <button
            onClick={() => setCurrentView('projects')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
              currentView === 'projects'
                ? 'bg-[#181818] text-white border-l-2 border-[#d4af37]'
                : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Disc3 className="w-4 h-4 text-[#d4af37]" />
              <span>Albums & EPs</span>
            </div>
            <span className="text-[11px] font-mono-numbers text-neutral-500">{projects.length}</span>
          </button>

          <button
            onClick={() => setCurrentView('playlists')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
              currentView === 'playlists'
                ? 'bg-[#181818] text-white border-l-2 border-[#d4af37]'
                : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
            }`}
          >
            <div className="flex items-center gap-3">
              <ListMusic className="w-4 h-4 text-[#d4af37]" />
              <span>Playlists</span>
            </div>
            <span className="text-[11px] font-mono-numbers text-neutral-500">{playlists.length}</span>
          </button>

          <div className="pt-2 pb-1 border-t border-[#1c1c1c] my-1">
            <button
              onClick={() => setCurrentView('import')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                currentView === 'import'
                  ? 'bg-[#181818] text-white border-l-2 border-[#d4af37]'
                  : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
              }`}
            >
              <Upload className="w-4 h-4 text-[#d4af37]" />
              <span>Importer</span>
            </button>

            <button
              onClick={() => setCurrentView('export')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                currentView === 'export'
                  ? 'bg-[#181818] text-white border-l-2 border-[#d4af37]'
                  : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
              }`}
            >
              <Download className="w-4 h-4 text-[#d4af37]" />
              <span>Exporter</span>
            </button>
          </div>

          <button
            onClick={() => setCurrentView('visualizer')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
              currentView === 'visualizer'
                ? 'bg-[#d4af37]/20 text-[#d4af37] border-l-2 border-[#d4af37]'
                : 'text-[#d4af37] hover:bg-[#d4af37]/10'
            }`}
          >
            <Activity className="w-4 h-4 text-[#d4af37]" />
            <span>Visualizer Studio</span>
          </button>

          <button
            onClick={() => setCurrentView('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
              currentView === 'settings'
                ? 'bg-[#181818] text-white border-l-2 border-[#d4af37]'
                : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
            }`}
          >
            <Settings className="w-4 h-4 text-[#d4af37]" />
            <span>Paramètres & Backup</span>
          </button>

          <button
            onClick={() => setCurrentView('package_xampp')}
            className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
              currentView === 'package_xampp'
                ? 'bg-[#181818] text-white border-l-2 border-[#d4af37]'
                : 'text-neutral-400 hover:text-white hover:bg-[#141414]'
            }`}
          >
            <FileCode className="w-4 h-4 text-[#d4af37]" />
            <span>Package XAMPP / SQL</span>
          </button>
        </nav>

        {/* Live Storage Indicator */}
        <div className="p-3 bg-[#0a0a0a] border-t border-[#1c1c1c] flex items-center justify-between text-xs">
          <div>
            <div className="text-white font-semibold">Stockage Local</div>
            <div className="text-neutral-400 text-[11px] font-mono-numbers">
              {songs.length} sons · {folders.length} dossiers
            </div>
          </div>
          <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN VIEWPORT & TOPBAR                                */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0b0b0b] relative overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-[#1f1f1f] bg-[#0d0d0d] px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-mono-numbers tracking-widest text-[#d4af37]">
              MEYZI BRO STOCK
            </span>
            <span className="text-neutral-600">/</span>
            <span className="text-xs font-medium text-neutral-300 capitalize">
              {currentView === 'songs'
                ? 'Ma Bibliothèque'
                : currentView === 'folders'
                ? 'Mes Dossiers'
                : currentView === 'projects'
                ? 'Albums & EPs'
                : currentView === 'playlists'
                ? 'Playlists'
                : currentView === 'import'
                ? 'Importer'
                : currentView === 'export'
                ? 'Exporter'
                : currentView === 'visualizer'
                ? 'Visualizer Studio'
                : currentView === 'settings'
                ? 'Paramètres'
                : 'Package XAMPP'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('import')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171717] border border-[#2a2a2a] text-neutral-200 text-xs rounded-md hover:border-[#d4af37]/60 transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Importer</span>
            </button>

            <button
              onClick={() => setIsAddSongOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d4af37] text-black font-bold text-xs rounded-md hover:bg-[#e2c14f] transition-all shadow-md active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Nouveau Song</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto pb-28 p-6">
          {/* ======================================================== */}
          {/* VIEW: DASHBOARD                                          */}
          {/* ======================================================== */}
          {currentView === 'dashboard' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              {/* Executive Artist Banner */}
              <div className="relative rounded-xl border border-[#d4af37]/30 p-6 overflow-hidden bg-gradient-to-r from-[#17130a] via-[#111111] to-[#0c0c0c]">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#d4af37] mb-2 uppercase tracking-wider">
                      <span>Coffre-fort Studio & Gestionnaire Audio</span>
                      <span>·</span>
                      <span>MEYZI BRO OFFICIEL</span>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-display font-bold text-white mb-2">
                      MEYZI BRO STOCK PROJECT
                    </h2>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Espace sécurisé de gestion, d'écoute et d'archivage de vos morceaux, albums, instrumentales et stems avec lecteur audio haute fidélité et animations lumineuses synchronisées.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      onClick={() => setCurrentView('import')}
                      className="px-4 py-2 bg-[#d4af37] text-black font-bold text-xs rounded-lg hover:bg-[#e2c14f] transition-all flex items-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Importer mes musiques</span>
                    </button>
                    <button
                      onClick={() => setCurrentView('visualizer')}
                      className="px-4 py-2 bg-[#171717] border border-[#d4af37]/50 text-[#d4af37] font-semibold text-xs rounded-lg hover:bg-[#d4af37]/10 transition-all flex items-center gap-2"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Ouvrir Visualizer</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg p-4">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span>Morceaux au Stock</span>
                    <Music className="w-3.5 h-3.5 text-[#d4af37]" />
                  </div>
                  <div className="text-2xl font-bold font-mono-numbers text-white">{songs.length}</div>
                </div>

                <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg p-4">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span>Dossiers Musicaux</span>
                    <Folder className="w-3.5 h-3.5 text-[#d4af37]" />
                  </div>
                  <div className="text-2xl font-bold font-mono-numbers text-white">{folders.length}</div>
                </div>

                <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg p-4">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span>Playlists</span>
                    <ListMusic className="w-3.5 h-3.5 text-[#d4af37]" />
                  </div>
                  <div className="text-2xl font-bold font-mono-numbers text-white">{playlists.length}</div>
                </div>

                <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg p-4">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span>Albums / Projets</span>
                    <Disc3 className="w-3.5 h-3.5 text-[#d4af37]" />
                  </div>
                  <div className="text-2xl font-bold font-mono-numbers text-white">{projects.length}</div>
                </div>
              </div>

              {/* Quick Jump Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Folder className="w-4 h-4 text-[#d4af37]" />
                      <span>Dossiers Récents</span>
                    </h3>
                    <div className="space-y-2 mb-4">
                      {folders.slice(0, 4).map(f => (
                        <div
                          key={f.id}
                          onClick={() => {
                            setActiveFolderId(f.id);
                            setCurrentView('folders');
                          }}
                          className="p-2.5 bg-[#161616] rounded-lg border border-[#222] hover:border-[#d4af37]/40 cursor-pointer flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-white">📁 {f.name}</span>
                          <span className="font-mono-numbers text-neutral-400">
                            {songs.filter(s => s.folderId === f.id).length} sons
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentView('folders')}
                    className="text-xs text-[#d4af37] hover:underline text-left font-semibold"
                  >
                    Gérer tous mes dossiers &rarr;
                  </button>
                </div>

                <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#d4af37]" />
                      <span>Visualizer d'Écoute</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mb-4">
                      Animations lumineuses réactives au son : Spectrum, Waveform, Neon, Particles, Circle Bass, Laser, et analyseur de fréquences 3-Band.
                    </p>
                    <div className="h-24 bg-black rounded-lg border border-[#222] overflow-hidden">
                      <StudioVisualizer isCompact={true} />
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentView('visualizer')}
                    className="text-xs text-[#d4af37] hover:underline text-left font-semibold mt-4"
                  >
                    Ouvrir le mode Visualizer complet &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW: SONGS (MA BIBLIOTHÈQUE)                            */}
          {/* ======================================================== */}
          {currentView === 'songs' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Ma Bibliothèque Musicale</h2>
                  <p className="text-xs text-neutral-400">
                    Tous vos morceaux stockés de manière permanente (formats MP3, WAV, FLAC, AAC, M4A, OGG).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentView('import')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171717] border border-[#282828] text-xs rounded-lg hover:border-[#d4af37]"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Importer</span>
                  </button>
                  <button
                    onClick={() => setIsAddSongOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#d4af37] text-black font-bold text-xs rounded-lg hover:bg-[#e2c14f]"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Nouveau Song</span>
                  </button>
                </div>
              </div>

              {/* Filter and Search */}
              <div className="flex flex-col sm:flex-row gap-3 bg-[#121212] border border-[#1f1f1f] p-3 rounded-lg text-xs">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Rechercher par titre ou producteur..."
                    className="w-full h-8 bg-[#171717] border border-[#242424] rounded-md pl-8 pr-3 text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="h-8 bg-[#171717] border border-[#242424] rounded-md px-2 text-neutral-300"
                >
                  <option value="all">Tous formats</option>
                  <option value="Single">Single</option>
                  <option value="Album">Album</option>
                  <option value="EP">EP</option>
                  <option value="Mixtape">Mixtape</option>
                  <option value="Freestyle">Freestyle</option>
                  <option value="Instrumental">Instrumental</option>
                </select>
              </div>

              {/* Songs List */}
              {songs.length === 0 ? (
                <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#181818] border border-[#282828] flex items-center justify-center mx-auto mb-4 text-[#d4af37]">
                    <Music className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 font-display">
                    Votre bibliothèque est vide
                  </h3>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto mb-6">
                    Importez des musiques ou des dossiers entiers depuis votre ordinateur pour les écouter et les organiser.
                  </p>
                  <button
                    onClick={() => setCurrentView('import')}
                    className="px-5 py-2.5 bg-[#d4af37] text-black font-bold text-xs rounded-lg hover:bg-[#e2c14f] transition-all inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4 stroke-[2.5]" />
                    <span>Importer des musiques</span>
                  </button>
                </div>
              ) : (
                <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl overflow-hidden divide-y divide-[#1c1c1c]">
                  {filteredSongs.map((s, idx) => {
                    const isPlayingThis =
                      currentTrack?.song?.id === s.id && playbackState.isPlaying;

                    return (
                      <div
                        key={s.id}
                        className="p-3.5 flex items-center justify-between gap-4 hover:bg-[#151515] transition-colors"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <button
                            onClick={() => handlePlaySong(s, filteredSongs)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md ${
                              isPlayingThis
                                ? 'bg-white text-black'
                                : 'bg-[#d4af37] text-black hover:bg-[#e2c14f]'
                            }`}
                          >
                            {isPlayingThis ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">{s.title}</h4>
                            <div className="text-xs text-neutral-400 flex items-center gap-2 truncate">
                              <span>{s.artist}</span>
                              {s.featuring && <span>ft. {s.featuring}</span>}
                              <span>·</span>
                              <span className="text-[#d4af37]">{s.type}</span>
                              {s.folderName && (
                                <span className="text-neutral-500 font-medium">· 📁 {s.folderName}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="hidden md:flex items-center gap-5 text-xs font-mono-numbers text-neutral-400">
                          <span>{s.bpm} BPM</span>
                          <span>{s.duration}</span>
                          <span className="text-[#d4af37]">{s.status}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedSongDetails(s)}
                            className="p-2 text-neutral-400 hover:text-white rounded hover:bg-[#202020]"
                            title="Détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSong(s.id)}
                            className="p-2 text-neutral-500 hover:text-rose-400 rounded hover:bg-[#202020]"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW: FOLDERS (MES DOSSIERS)                              */}
          {/* ======================================================== */}
          {currentView === 'folders' && (
            <FolderManager
              folders={folders}
              songs={songs}
              currentFolderId={activeFolderId}
              onSelectFolder={setActiveFolderId}
              onCreateFolder={handleCreateFolder}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
              onMoveSongsToFolder={handleMoveSongsToFolder}
              onImportFolderFromDisk={handleImportFolderFromDisk}
              onPlaySong={handlePlaySong}
              showToast={showToast}
            />
          )}

          {/* ======================================================== */}
          {/* VIEW: PROJECTS & ALBUMS                                  */}
          {/* ======================================================== */}
          {currentView === 'projects' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Mes Albums & EPs</h2>
                  <p className="text-xs text-neutral-400">
                    Structurez vos projets artistiques complets.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddProjectOpen(true)}
                  className="px-4 py-2 bg-[#d4af37] text-black font-semibold text-xs rounded-lg hover:bg-[#e2c14f]"
                >
                  + Nouveau Projet
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-8 text-center text-xs text-neutral-400">
                  Aucun album ou projet créé pour l'instant.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {projects.map(p => {
                    const projectSongs = songs.filter(s => s.projectId === p.id);
                    return (
                      <div key={p.id} className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-5">
                        <div className="flex justify-between items-center text-xs mb-2">
                          <span className="text-[#d4af37] font-semibold">{p.type}</span>
                          <span className="text-neutral-400">{p.status}</span>
                        </div>
                        <h3 className="text-base font-bold text-white mb-1">{p.name}</h3>
                        <p className="text-xs text-neutral-400 mb-4">{p.description}</p>
                        <div className="text-xs text-[#d4af37] font-semibold">
                          {projectSongs.length} morceau(x)
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW: PLAYLISTS                                          */}
          {/* ======================================================== */}
          {currentView === 'playlists' && (
            <PlaylistsManager
              playlists={playlists}
              songs={songs}
              onPlaySongList={handlePlaySongList}
              onRefreshPlaylists={refreshAllData}
              showToast={showToast}
            />
          )}

          {/* ======================================================== */}
          {/* VIEW: IMPORTER (AUDIO BATCH IMPORTER)                    */}
          {/* ======================================================== */}
          {currentView === 'import' && (
            <AudioBatchImporter
              folders={folders}
              existingSongs={songs}
              onImportComplete={newSongs => {
                setSongs(prev => [...newSongs, ...prev]);
                refreshAllData();
              }}
              showToast={showToast}
            />
          )}

          {/* ======================================================== */}
          {/* VIEW: EXPORTER (AUDIO EXPORTER)                          */}
          {/* ======================================================== */}
          {currentView === 'export' && (
            <AudioExporter
              songs={songs}
              folders={folders}
              projects={projects}
              showToast={showToast}
            />
          )}

          {/* ======================================================== */}
          {/* VIEW: VISUALIZER (ESPACE VISUALIZER LUMINEUX)            */}
          {/* ======================================================== */}
          {currentView === 'visualizer' && (
            <div className="max-w-6xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-display font-bold text-white">Visualizer Studio</h2>
                  <p className="text-xs text-neutral-400">
                    8 modes lumineux en temps réel synchronisés avec le son (Web Audio AnalyserNode).
                  </p>
                </div>
              </div>
              <StudioVisualizer
                currentTrackTitle={currentTrack?.title || 'MEYZI BRO OFFICIEL'}
                currentTrackArtist={currentTrack?.artist || 'STOCK PROJECT'}
                bpm={currentTrack?.bpm || 140}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW: SETTINGS & BACKUP                                  */}
          {/* ======================================================== */}
          {currentView === 'settings' && (
            <LibrarySettings
              songCount={songs.length}
              folderCount={folders.length}
              playlistCount={playlists.length}
              onRefreshAllData={refreshAllData}
              showToast={showToast}
            />
          )}

          {/* ======================================================== */}
          {/* VIEW: PACKAGE XAMPP / SQL                                */}
          {/* ======================================================== */}
          {currentView === 'package_xampp' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="bg-gradient-to-r from-[#17130a] to-[#111111] border border-[#d4af37]/40 rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-[#d4af37] font-semibold uppercase tracking-wider">
                      Exportation XAMPP Locale
                    </span>
                    <h2 className="text-2xl font-display font-bold text-white mt-1">
                      Package Complet PHP 8+ & MySQLi
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                      Téléchargez l'archive ZIP prête à extraire dans{' '}
                      <code className="text-white bg-black px-1.5 py-0.5 rounded font-mono">
                        C:\xampp\htdocs\meyzi-bro-stock
                      </code>{' '}
                      avec code PHP complet, base MySQLi et guide d'installation.
                    </p>
                  </div>

                  <button
                    onClick={async () => {
                      showToast('Génération du package XAMPP ZIP...');
                      await downloadXamppZip();
                      showToast('Package ZIP téléchargé !');
                    }}
                    className="px-5 py-3 bg-[#d4af37] text-black font-bold text-xs rounded-lg hover:bg-[#e2c14f] transition-all flex items-center gap-2 shrink-0 shadow-lg"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Télécharger l'archive XAMPP (.ZIP)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ======================================================== */}
        {/* 3. PROFESSIONAL AUDIO PLAYER BAR                         */}
        {/* ======================================================== */}
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#0e0e0e]/95 backdrop-blur-xl border-t border-[#d4af37]/30 z-50 px-6 flex items-center justify-between gap-6 shadow-2xl">
          {/* Left Track Info */}
          <div className="flex items-center gap-3.5 w-64 min-w-0">
            <div className="w-12 h-12 rounded-lg bg-black border border-[#282828] overflow-hidden shrink-0 relative group">
              <img
                src={currentTrack?.cover || SCORPION_LOGO}
                alt="Track Cover"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setCurrentView('visualizer')}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[#d4af37] transition-opacity"
                title="Ouvrir Visualizer"
              >
                <Activity className="w-4 h-4" />
              </button>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {currentTrack?.title || 'Aucun morceau sélectionné'}
              </div>
              <div className="text-[11px] text-[#d4af37] truncate">
                {currentTrack?.artist || 'MEYZI BRO OFFICIEL'}
              </div>
            </div>
          </div>

          {/* Center Playback Controls, Repeat, Shuffle, Seek Bar */}
          <div className="flex-1 max-w-xl flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-4">
              {/* Shuffle Button */}
              <button
                onClick={() => {
                  setIsShuffle(!isShuffle);
                  showToast(isShuffle ? 'Lecture aléatoire désactivée' : 'Lecture aléatoire activée');
                }}
                className={`transition-colors ${
                  isShuffle ? 'text-[#d4af37]' : 'text-neutral-500 hover:text-white'
                }`}
                title={isShuffle ? 'Aléatoire actif' : 'Activer aléatoire'}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Previous Track */}
              <button
                onClick={handlePrevTrack}
                className="text-neutral-400 hover:text-white transition-colors"
                title="Morceau précédent"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Play / Pause Button */}
              <button
                onClick={() => {
                  if (!currentTrack && songs.length > 0) {
                    handlePlaySong(songs[0]);
                  } else {
                    studioAudio.togglePlay();
                  }
                }}
                className="w-10 h-10 rounded-full bg-[#d4af37] text-black flex items-center justify-center hover:bg-[#e2c14f] transition-transform active:scale-95 shadow-md shadow-[#d4af37]/20"
                title={playbackState.isPlaying ? 'Pause' : 'Play'}
              >
                {playbackState.isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              {/* Next Track */}
              <button
                onClick={handleNextTrack}
                className="text-neutral-400 hover:text-white transition-colors"
                title="Morceau suivant"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Repeat Button */}
              <button
                onClick={toggleRepeat}
                className={`transition-colors ${
                  repeatMode !== 'off' ? 'text-[#d4af37]' : 'text-neutral-500 hover:text-white'
                }`}
                title={
                  repeatMode === 'all'
                    ? 'Répéter tous'
                    : repeatMode === 'one'
                    ? 'Répéter ce morceau'
                    : 'Répétition désactivée'
                }
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Seek Bar with Elapsed & Remaining Time */}
            <div className="w-full flex items-center gap-3">
              <span className="text-[11px] font-mono-numbers text-neutral-400 w-10 text-right">
                {formatSeconds(playbackState.currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={playbackState.duration || 180}
                value={playbackState.currentTime}
                onChange={e => studioAudio.seek(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-[#222222] rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
              />
              <span className="text-[11px] font-mono-numbers text-neutral-500 w-10">
                -{formatSeconds(Math.max(0, playbackState.duration - playbackState.currentTime))}
              </span>
            </div>
          </div>

          {/* Right Controls: Mini Spectrum, Queue Drawer, Visualizer Link, Volume */}
          <div className="flex items-center gap-3.5 w-72 justify-end">
            {/* Spectrum Canvas */}
            <canvas ref={canvasRef} width={50} height={20} className="hidden lg:block opacity-75" />

            {/* Visualizer Jump Button */}
            <button
              onClick={() => setCurrentView('visualizer')}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-[#d4af37] hover:bg-[#1a1a1a]"
              title="Ouvrir Visualizer Plein Écran"
            >
              <Activity className="w-4 h-4" />
            </button>

            {/* Queue Toggle Button */}
            <button
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              className={`p-1.5 rounded-lg transition-colors ${
                isQueueOpen ? 'text-[#d4af37] bg-[#1a170d]' : 'text-neutral-400 hover:text-white'
              }`}
              title="Liste d'attente (File de lecture)"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => studioAudio.setVolume(playbackState.volume === 0 ? 0.8 : 0)}
                className="text-neutral-400 hover:text-white"
              >
                {playbackState.volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#d4af37]" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={playbackState.volume}
                onChange={e => studioAudio.setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-[#222222] rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. PLAYLIST / QUEUE DRAWER                               */}
        {/* ======================================================== */}
        {isQueueOpen && (
          <div className="fixed bottom-20 right-6 w-80 max-h-96 bg-[#121212] border border-[#d4af37]/40 rounded-xl p-4 shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-[#222] mb-2">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-[#d4af37]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  File de lecture ({queue.length})
                </span>
              </div>
              <button
                onClick={() => setIsQueueOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#1c1c1c] pr-1">
              {queue.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-500">
                  La file d'attente est vide.
                </div>
              ) : (
                queue.map((s, idx) => {
                  const isCurrent = currentTrack?.song?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => handlePlaySong(s)}
                      className={`p-2 flex items-center justify-between text-xs cursor-pointer rounded ${
                        isCurrent ? 'bg-[#1a170d] text-[#d4af37]' : 'hover:bg-[#161616] text-white'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold truncate">{s.title}</div>
                        <div className="text-[11px] text-neutral-400 truncate">{s.artist}</div>
                      </div>
                      <span className="font-mono-numbers text-[11px] text-neutral-500">{s.duration}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. MODALS                                                */}
        {/* ======================================================== */}

        {/* Modal: New Song Form */}
        {isAddSongOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#121212] border border-[#d4af37]/40 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
              <button
                onClick={() => setIsAddSongOpen(false)}
                className="absolute right-4 top-4 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-display font-bold text-white mb-1">
                Ajouter un Morceau (Votre Fichier Audio)
              </h3>
              <p className="text-xs text-neutral-400 mb-5">
                Sélectionnez votre fichier audio (MP3, WAV, etc.) et donnez un titre pour le conserver dans l'application.
              </p>

              <form onSubmit={handleSaveNewSong} className="space-y-4">
                <div className="p-4 rounded-lg border border-[#2a2a2a] bg-[#161616]">
                  <label className="text-xs font-bold text-[#d4af37] flex items-center gap-2 mb-2">
                    <FileAudio className="w-4 h-4" />
                    <span>Fichier Audio Principal * (MP3, WAV, FLAC, AAC, M4A, OGG)</span>
                  </label>
                  <input
                    type="file"
                    accept="audio/*,.mp3,.wav,.flac,.aac,.m4a,.ogg"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setUploadedAudioFile(file);
                        if (!newSongForm.title) {
                          const clean = file.name.replace(/\.[^/.]+$/, '').replace(/[_]/g, ' ');
                          setNewSongForm(prev => ({ ...prev, title: clean }));
                        }
                      }
                    }}
                    className="w-full text-xs text-neutral-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#d4af37] file:text-black hover:file:bg-[#e2c14f] cursor-pointer"
                  />
                  {uploadedAudioFile && (
                    <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{uploadedAudioFile.name} ({(uploadedAudioFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Titre du Song *</label>
                    <input
                      type="text"
                      required
                      value={newSongForm.title}
                      onChange={e => setNewSongForm({ ...newSongForm, title: e.target.value })}
                      placeholder="Donnez un titre à votre morceau"
                      className="w-full h-8 bg-[#181818] border border-[#282828] rounded px-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Dossier de destination</label>
                    <select
                      value={newSongForm.folderId}
                      onChange={e => setNewSongForm({ ...newSongForm, folderId: e.target.value })}
                      className="w-full h-8 bg-[#181818] border border-[#282828] rounded px-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="">-- Aucun dossier (Racine) --</option>
                      {folders.map(f => (
                        <option key={f.id} value={f.id}>
                          📁 {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Format / Type</label>
                    <select
                      value={newSongForm.type}
                      onChange={e => setNewSongForm({ ...newSongForm, type: e.target.value as SongType })}
                      className="w-full h-8 bg-[#181818] border border-[#282828] rounded px-2 text-xs text-white"
                    >
                      <option value="Single">Single</option>
                      <option value="Album">Album</option>
                      <option value="EP">EP</option>
                      <option value="Mixtape">Mixtape</option>
                      <option value="Freestyle">Freestyle</option>
                      <option value="Instrumental">Instrumental</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Artiste Principal</label>
                    <input
                      type="text"
                      value={newSongForm.artist}
                      onChange={e => setNewSongForm({ ...newSongForm, artist: e.target.value })}
                      className="w-full h-8 bg-[#181818] border border-[#282828] rounded px-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">BPM</label>
                    <input
                      type="number"
                      value={newSongForm.bpm}
                      onChange={e => setNewSongForm({ ...newSongForm, bpm: parseInt(e.target.value, 10) || 140 })}
                      className="w-full h-8 bg-[#181818] border border-[#282828] rounded px-2.5 text-xs text-white font-mono-numbers"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Paroles (Lyrics)</label>
                  <textarea
                    rows={3}
                    value={newSongForm.lyrics}
                    onChange={e => setNewSongForm({ ...newSongForm, lyrics: e.target.value })}
                    placeholder="Collez vos paroles ici..."
                    className="w-full bg-[#181818] border border-[#282828] rounded p-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#202020]">
                  <button
                    type="button"
                    onClick={() => setIsAddSongOpen(false)}
                    className="px-4 py-2 bg-[#181818] text-neutral-300 text-xs rounded"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#d4af37] text-black font-bold text-xs rounded hover:bg-[#e2c14f]"
                  >
                    Garder ce Song dans l'App
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: New Project */}
        {isAddProjectOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#121212] border border-[#282828] rounded-xl max-w-md w-full p-6 shadow-2xl relative">
              <button
                onClick={() => setIsAddProjectOpen(false)}
                className="absolute right-4 top-4 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-display font-bold text-white mb-3">
                Créer un Nouveau Projet
              </h3>
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  const target = e.target as HTMLFormElement;
                  const nameInput = target.elements.namedItem('projName') as HTMLInputElement;
                  const typeInput = target.elements.namedItem('projType') as HTMLSelectElement;
                  if (!nameInput.value.trim()) return;

                  const newProj: Project = {
                    id: Date.now(),
                    name: nameInput.value.trim(),
                    type: typeInput.value as 'Album' | 'EP' | 'Mixtape' | 'Single',
                    description: 'Mon projet musical personnel.',
                    cover: SCORPION_LOGO,
                    status: 'En préparation',
                    progress: 0,
                    trackCount: 0
                  };
                  await saveToStore('projects', newProj);
                  setProjects(prev => [...prev, newProj]);
                  setIsAddProjectOpen(false);
                  showToast(`Projet « ${newProj.name} » créé.`);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Nom du Projet</label>
                  <input
                    name="projName"
                    required
                    placeholder="ex: PaPa Drill"
                    className="w-full h-8 bg-[#181818] border border-[#282828] rounded px-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Type</label>
                  <select
                    name="projType"
                    className="w-full h-8 bg-[#181818] border border-[#282828] rounded px-2 text-xs text-white"
                  >
                    <option value="Album">Album</option>
                    <option value="EP">EP</option>
                    <option value="Mixtape">Mixtape</option>
                    <option value="Single">Single</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddProjectOpen(false)}
                    className="px-3 py-1.5 bg-[#181818] text-neutral-300 text-xs rounded"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#d4af37] text-black font-semibold text-xs rounded hover:bg-[#e2c14f]"
                  >
                    Créer le Projet
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Song Details & Lyrics */}
        {selectedSongDetails && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#121212] border border-[#d4af37]/40 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
              <button
                onClick={() => setSelectedSongDetails(null)}
                className="absolute right-4 top-4 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-lg bg-black border border-[#282828] flex items-center justify-center text-[#d4af37]">
                  <Music className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-xs text-[#d4af37] font-semibold">
                    {selectedSongDetails.type} · {selectedSongDetails.status}
                  </div>
                  <h3 className="text-xl font-bold font-display text-white">
                    {selectedSongDetails.title}
                  </h3>
                  <div className="text-xs text-neutral-400">
                    {selectedSongDetails.artist}
                    {selectedSongDetails.featuring && ` ft. ${selectedSongDetails.featuring}`}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs py-3 border-y border-[#1f1f1f] text-neutral-400 font-mono-numbers mb-4">
                <div>BPM: <span className="text-white">{selectedSongDetails.bpm}</span></div>
                <div>Clé: <span className="text-white">{selectedSongDetails.keySignature}</span></div>
                <div>Durée: <span className="text-white">{selectedSongDetails.duration}</span></div>
              </div>

              <div className="mb-4">
                <h4 className="text-xs font-semibold text-[#d4af37] uppercase tracking-wider mb-2">
                  Paroles (Lyrics)
                </h4>
                <div className="bg-black border border-[#202020] rounded-lg p-4 font-mono text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                  {selectedSongDetails.lyrics || 'Aucune parole enregistrée pour ce morceau.'}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1f1f1f]">
                <button
                  onClick={() => handlePlaySong(selectedSongDetails)}
                  className="px-4 py-2 bg-[#d4af37] text-black font-semibold text-xs rounded-lg flex items-center gap-2 hover:bg-[#e2c14f]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Écouter</span>
                </button>
                <button
                  onClick={() => handleDeleteSong(selectedSongDetails.id)}
                  className="px-3 py-1.5 text-rose-400 text-xs hover:bg-rose-950/30 rounded"
                >
                  Supprimer du stockage
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Toast */}
        {toastMessage && (
          <div className="fixed bottom-24 right-6 bg-[#1a170d] border border-[#d4af37] text-[#f7e08c] px-4 py-2.5 rounded-lg text-xs font-semibold shadow-2xl flex items-center gap-2 z-50">
            <CheckCircle className="w-4 h-4 text-[#d4af37]" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
