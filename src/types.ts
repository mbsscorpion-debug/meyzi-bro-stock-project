export type SongType = 'Single' | 'Album' | 'EP' | 'Mixtape' | 'Freestyle' | 'Instrumental' | 'Autre';

export type SongStatus = 'Brouillon' | 'Enregistrement' | 'Mixage' | 'Mastering' | 'Terminé' | 'Publié' | 'Archivé';

export type ProjectStatus = 'Idée' | 'En préparation' | 'Enregistrement' | 'Mixage' | 'Mastering' | 'Terminé' | 'Publié' | 'Archivé';

export interface Folder {
  id: string;
  name: string;
  parentId?: string | null;
  color?: string;
  createdAt: string;
  description?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  cover?: string;
  songIds: number[];
  createdAt: string;
}

export interface Song {
  id: number;
  title: string;
  type: SongType;
  projectId?: number | null;
  projectName?: string;
  folderId?: string | null;
  folderName?: string;
  artist: string;
  featuring?: string;
  producer?: string;
  composer?: string;
  studio?: string;
  genre: string;
  year: number;
  bpm: number;
  keySignature: string;
  duration: string;
  status: SongStatus;
  description?: string;
  lyrics?: string;
  notes?: string;
  audioFile?: string;
  originalFileName?: string;
  fileFormat?: string;
  fileSize?: number;
  coverFile?: string;
  instrumentalFile?: string;
  acapellaFile?: string;
  createdAt: string;
}

export interface Project {
  id: number;
  name: string;
  type: 'Album' | 'EP' | 'Mixtape' | 'Single' | 'Autre';
  description: string;
  cover: string;
  startDate?: string;
  releaseDate?: string;
  status: ProjectStatus;
  progress: number;
  trackCount?: number;
}

export interface Album {
  id: number;
  name: string;
  description: string;
  cover: string;
  year: number;
  releaseDate?: string;
  status: string;
  trackList: number[];
}

export interface EP {
  id: number;
  name: string;
  description: string;
  cover: string;
  year: number;
  releaseDate?: string;
  status: string;
  trackList: number[];
}

export interface Mixtape {
  id: number;
  name: string;
  description: string;
  cover: string;
  year: number;
  releaseDate?: string;
  status: string;
  trackList: number[];
}

export interface Instrumental {
  id: number;
  title: string;
  producer: string;
  bpm: number;
  keySignature: string;
  genre: string;
  price: number;
  status: 'Disponible' | 'Exclusif' | 'Vendu' | 'En production';
  audioFile?: string;
  stemsFile?: string;
  notes?: string;
  folderId?: string | null;
}

export interface Collaborator {
  id: number;
  name: string;
  role: 'Artiste' | 'Beatmaker' | 'Producteur' | 'Ingénieur son' | 'Compositeur' | 'Studio' | 'Autre';
  phone?: string;
  email?: string;
  socialMedia?: string;
  notes?: string;
}

export interface MediaFile {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  category: 'Audio' | 'Covers' | 'Paroles' | 'Instrumentales' | 'Acapella' | 'Stems' | 'Clips' | 'Documents' | 'Autres';
  songId?: number;
  songTitle?: string;
  folderId?: string | null;
  createdAt: string;
}

export type VisualizerMode =
  | 'spectrum'
  | 'waveform'
  | 'neon'
  | 'particles'
  | 'circle_bass'
  | 'laser'
  | 'frequency'
  | 'fullscreen';

export type VisualizerTheme =
  | 'gold'
  | 'rgb'
  | 'blue_neon'
  | 'purple_neon'
  | 'red';

export type RepeatMode = 'off' | 'all' | 'one';
