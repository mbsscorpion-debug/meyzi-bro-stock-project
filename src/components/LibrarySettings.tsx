/**
 * MEYZI BRO STOCK PROJECT — Settings, Backup & Library Restoration
 */

import React, { useRef, useState } from 'react';
import {
  ShieldCheck,
  Download,
  Upload,
  HardDrive,
  RefreshCw,
  Trash2,
  FileCode,
  CheckCircle,
  Database,
  Music,
  Folder
} from 'lucide-react';
import { exportLibraryBackupJSON, importLibraryBackupJSON } from '../services/storage';

interface LibrarySettingsProps {
  songCount: number;
  folderCount: number;
  playlistCount: number;
  onRefreshAllData: () => Promise<void>;
  showToast: (msg: string) => void;
}

export default function LibrarySettings({
  songCount,
  folderCount,
  playlistCount,
  onRefreshAllData,
  showToast
}: LibrarySettingsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Backup JSON
  const handleExportBackup = async () => {
    try {
      setIsProcessing(true);
      const json = await exportLibraryBackupJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MEYZI_BRO_LIBRARY_BACKUP_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Sauvegarde de la bibliothèque téléchargée avec succès !');
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la sauvegarde.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Restore JSON
  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const text = await file.text();
      const res = await importLibraryBackupJSON(text);
      if (res.success) {
        await onRefreshAllData();
        showToast(`Restauration réussie ! (${res.count} morceaux restaurés).`);
      } else {
        showToast(`Erreur : ${res.error}`);
      }
    } catch (err: any) {
      showToast(`Erreur de lecture du fichier : ${err.message}`);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-xs text-[#d4af37] font-semibold uppercase tracking-wider mb-1">
          <span>Paramètres & Persistance</span>
        </div>
        <h2 className="text-xl font-display font-bold text-white">
          Sauvegarde & Sécurité de la Bibliothèque
        </h2>
        <p className="text-xs text-neutral-400">
          Toutes vos musiques, métadonnées, dossiers et playlists sont conservés de manière permanente dans la base locale IndexedDB.
        </p>
      </div>

      {/* Storage Health Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#121212] border border-[#1f1f1f] p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#181818] border border-[#262626] flex items-center justify-center text-[#d4af37]">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-neutral-400">Morceaux au Stock</div>
            <div className="text-lg font-bold text-white font-mono-numbers">{songCount}</div>
          </div>
        </div>

        <div className="bg-[#121212] border border-[#1f1f1f] p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#181818] border border-[#262626] flex items-center justify-center text-[#d4af37]">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-neutral-400">Dossiers Créés</div>
            <div className="text-lg font-bold text-white font-mono-numbers">{folderCount}</div>
          </div>
        </div>

        <div className="bg-[#121212] border border-[#1f1f1f] p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#181818] border border-[#262626] flex items-center justify-center text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-neutral-400">Base Locale</div>
            <div className="text-xs font-bold text-emerald-400">IndexedDB v2 Active</div>
          </div>
        </div>
      </div>

      {/* Backup and Restore Box */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
            <span>Sauvegarde & Restauration Complète</span>
          </h3>
          <p className="text-xs text-neutral-400">
            Exportez l'état complet de vos projets, dossiers et métadonnées en fichier JSON pour le conserver ou le transférer.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportBackup}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#d4af37] text-black font-bold text-xs rounded-lg hover:bg-[#e2c14f] transition-all shadow-md disabled:opacity-50"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Exporter Sauvegarde (.JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#171717] border border-[#2a2a2a] hover:border-[#d4af37]/60 text-white font-semibold text-xs rounded-lg transition-all disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-[#d4af37]" />
            <span>Restaurer une Sauvegarde (.JSON)</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            className="hidden"
            onChange={handleRestoreBackup}
          />
        </div>
      </div>

      {/* Tech Specifications */}
      <div className="bg-[#121212] border border-[#1f1f1f] rounded-xl p-5 text-xs text-neutral-400 space-y-2">
        <div className="font-bold text-white uppercase tracking-wider mb-2">
          Architecture MEYZI BRO STOCK PROJECT :
        </div>
        <div>• Moteur de stockage : <span className="text-[#d4af37]">IndexedDB + Blob Storage</span> (aucun quota restreint de localStorage).</div>
        <div>• Formats audio supportés : <span className="text-white">MP3, WAV, FLAC, AAC, M4A, OGG</span>.</div>
        <div>• Analyseur spectral temps réel : <span className="text-white">Web Audio API AnalyserNode 256 bins</span>.</div>
        <div>• Exportations : <span className="text-white">Téléchargements natifs et archives ZIP via JSZip</span>.</div>
      </div>
    </div>
  );
}
