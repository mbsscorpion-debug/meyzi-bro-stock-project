<?php
$page_title = "Ajouter un Song";
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';

$error = '';
$success = '';

// Projets disponibles
$projects_list = $conn->query("SELECT id, name FROM projects ORDER BY name ASC");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim($_POST['title'] ?? '');
    $type = trim($_POST['type'] ?? 'Single');
    $project_id = !empty($_POST['project_id']) ? (int)$_POST['project_id'] : null;
    $artist = trim($_POST['artist'] ?? 'MEYZI BRO OFFICIEL');
    $featuring = trim($_POST['featuring'] ?? '');
    $producer = trim($_POST['producer'] ?? '');
    $composer = trim($_POST['composer'] ?? '');
    $studio = trim($_POST['studio'] ?? '');
    $genre = trim($_POST['genre'] ?? '');
    $year = !empty($_POST['year']) ? (int)$_POST['year'] : (int)date('Y');
    $bpm = !empty($_POST['bpm']) ? (int)$_POST['bpm'] : null;
    $key_signature = trim($_POST['key_signature'] ?? '');
    $duration = trim($_POST['duration'] ?? '');
    $status = trim($_POST['status'] ?? 'Brouillon');
    $description = trim($_POST['description'] ?? '');
    $lyrics = trim($_POST['lyrics'] ?? '');
    $notes = trim($_POST['notes'] ?? '');

    if (empty($title)) {
        $error = "Le titre du song est obligatoire.";
    } else {
        // Traitement sécurisé des uploads de fichiers
        $audio_file = null;
        $cover_file = null;
        $instrumental_file = null;
        $acapella_file = null;

        // Fonction d'upload sécurisée
        function processUpload($fileKey, $targetDir, $allowedExts) {
            if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
                return null;
            }
            $origName = $_FILES[$fileKey]['name'];
            $fileExt = strtolower(pathinfo($origName, PATHINFO_EXTENSION));

            if (!in_array($fileExt, $allowedExts)) {
                return false;
            }

            if (!is_dir(__DIR__ . '/../' . $targetDir)) {
                mkdir(__DIR__ . '/../' . $targetDir, 0755, true);
            }

            $cleanName = bin2hex(random_bytes(8)) . '_' . time() . '.' . $fileExt;
            $destPath = __DIR__ . '/../' . $targetDir . '/' . $cleanName;

            if (move_uploaded_file($_FILES[$fileKey]['tmp_name'], $destPath)) {
                return $targetDir . '/' . $cleanName;
            }
            return null;
        }

        $audio_exts = ['mp3', 'wav', 'm4a', 'flac'];
        $image_exts = ['jpg', 'jpeg', 'png', 'webp'];

        $audio_file = processUpload('audio_file', 'uploads/audio', $audio_exts);
        $cover_file = processUpload('cover_file', 'uploads/covers', $image_exts);
        $instrumental_file = processUpload('instrumental_file', 'uploads/instrumentals', $audio_exts);
        $acapella_file = processUpload('acapella_file', 'uploads/acapella', $audio_exts);

        // Insertion MySQLi avec requête préparée
        $stmt = $conn->prepare("INSERT INTO songs (title, type, project_id, artist, featuring, producer, composer, studio, genre, year, bpm, key_signature, duration, status, description, lyrics, notes, audio_file, cover_file, instrumental_file, acapella_file) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->bind_param(
            "ssissssssiissssssssss",
            $title, $type, $project_id, $artist, $featuring, $producer, $composer, $studio,
            $genre, $year, $bpm, $key_signature, $duration, $status, $description, $lyrics,
            $notes, $audio_file, $cover_file, $instrumental_file, $acapella_file
        );

        if ($stmt->execute()) {
            $song_id = $stmt->insert_id;
            
            // Enregistrement dans la table files
            if ($audio_file) {
                $f_stmt = $conn->prepare("INSERT INTO files (file_name, file_path, file_type, category, song_id, project_id) VALUES (?, ?, 'audio', 'Audio', ?, ?)");
                $f_name = basename($audio_file);
                $f_stmt->bind_param("ssii", $f_name, $audio_file, $song_id, $project_id);
                $f_stmt->execute();
            }

            $success = "Le song « " . htmlspecialchars($title) . " » a été ajouté avec succès au coffre-fort !";
        } else {
            $error = "Erreur SQL : " . $conn->error;
        }
        $stmt->close();
    }
}
?>

<div class="flex-grow-1 d-flex flex-column" style="min-width: 0;">
    <?php require_once __DIR__ . '/../includes/navbar.php'; ?>

    <main class="p-4 flex-grow-1 overflow-auto" style="padding-bottom: 100px !important;">
        <div class="d-flex align-items-center justify-content-between mb-4">
            <div>
                <h3 class="font-cinzel text-white mb-1"><i class="fa-solid fa-plus-circle text-gold me-2"></i> Ajouter un Nouveau Song</h3>
                <p class="text-secondary small mb-0">Renseignez les métadonnées de production et téléversez les pistes audio & stems.</p>
            </div>
            <a href="index.php" class="btn btn-outline-secondary btn-sm">&larr; Retour à la liste</a>
        </div>

        <?php if ($error): ?>
            <div class="alert alert-danger py-2 small mb-3"><?= htmlspecialchars($error) ?></div>
        <?php endif; ?>
        <?php if ($success): ?>
            <div class="alert alert-success py-2 small mb-3"><?= $success ?></div>
        <?php endif; ?>

        <form method="POST" action="add.php" enctype="multipart/form-data">
            <div class="row g-4">
                <!-- Colonne Gauche: Informations Générales & Musicales -->
                <div class="col-lg-7">
                    <div class="card-vault p-4 mb-4">
                        <h5 class="text-gold font-cinzel mb-3">1. Informations Générales</h5>
                        <div class="row g-3">
                            <div class="col-md-8">
                                <label class="form-label small text-secondary">Titre du Song *</label>
                                <input type="text" name="title" class="form-control bg-black border-dark text-white" placeholder="ex: PaPa Drill" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label small text-secondary">Type *</label>
                                <select name="type" class="form-select bg-black border-dark text-white">
                                    <option value="Single">Single</option>
                                    <option value="Album">Album</option>
                                    <option value="EP">EP</option>
                                    <option value="Mixtape">Mixtape</option>
                                    <option value="Freestyle">Freestyle</option>
                                    <option value="Instrumental">Instrumental</option>
                                    <option value="Autre">Autre</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small text-secondary">Projet Associé</label>
                                <select name="project_id" class="form-select bg-black border-dark text-white">
                                    <option value="">-- Aucun projet associé --</option>
                                    <?php while($p = $projects_list->fetch_assoc()): ?>
                                        <option value="<?= $p['id'] ?>"><?= htmlspecialchars($p['name']) ?></option>
                                    <?php endwhile; ?>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small text-secondary">Artiste Principal</label>
                                <input type="text" name="artist" class="form-control bg-black border-dark text-white" value="MEYZI BRO OFFICIEL">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small text-secondary">Featuring</label>
                                <input type="text" name="featuring" class="form-control bg-black border-dark text-white" placeholder="ex: K-Lord, Niska...">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small text-secondary">Genre Musical</label>
                                <input type="text" name="genre" class="form-control bg-black border-dark text-white" placeholder="ex: UK Drill / Dark Trap">
                            </div>
                        </div>
                    </div>

                    <div class="card-vault p-4 mb-4">
                        <h5 class="text-gold font-cinzel mb-3">2. Production & Studio</h5>
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label small text-secondary">Producteur / Beatmaker</label>
                                <input type="text" name="producer" class="form-control bg-black border-dark text-white" placeholder="ex: Scorpion Beats">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small text-secondary">Compositeur</label>
                                <input type="text" name="composer" class="form-control bg-black border-dark text-white" placeholder="ex: MEYZI BRO">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small text-secondary">Studio d'enregistrement</label>
                                <input type="text" name="studio" class="form-control bg-black border-dark text-white" placeholder="ex: Studio Gold Sound">
                            </div>
                            <div class="col-md-2">
                                <label class="form-label small text-secondary">BPM</label>
                                <input type="number" name="bpm" class="form-control bg-black border-dark text-white font-mono-numbers" placeholder="140">
                            </div>
                            <div class="col-md-2">
                                <label class="form-label small text-secondary">Tonalité</label>
                                <input type="text" name="key_signature" class="form-control bg-black border-dark text-white" placeholder="D min">
                            </div>
                            <div class="col-md-2">
                                <label class="form-label small text-secondary">Durée</label>
                                <input type="text" name="duration" class="form-control bg-black border-dark text-white" placeholder="03:20">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small text-secondary">Année</label>
                                <input type="number" name="year" class="form-control bg-black border-dark text-white" value="<?= date('Y') ?>">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small text-secondary">Statut du Projet</label>
                                <select name="status" class="form-select bg-black border-dark text-white">
                                    <option value="Brouillon">Brouillon</option>
                                    <option value="Enregistrement" selected>Enregistrement</option>
                                    <option value="Mixage">Mixage</option>
                                    <option value="Mastering">Mastering</option>
                                    <option value="Terminé">Terminé</option>
                                    <option value="Publié">Publié</option>
                                    <option value="Archivé">Archivé</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="card-vault p-4">
                        <h5 class="text-gold font-cinzel mb-3">3. Paroles & Notes</h5>
                        <div class="mb-3">
                            <label class="form-label small text-secondary">Paroles du morceau (Lyrics)</label>
                            <textarea name="lyrics" rows="6" class="form-control bg-black border-dark text-white" placeholder="Écrivez ou collez les lyrics complètes ici..."></textarea>
                        </div>
                        <div>
                            <label class="form-label small text-secondary">Notes personnelles & de mix</label>
                            <textarea name="notes" rows="3" class="form-control bg-black border-dark text-white" placeholder="Notes techniques, consignes pour le mixeur..."></textarea>
                        </div>
                    </div>
                </div>

                <!-- Colonne Droite: Uploads Audio & Stems -->
                <div class="col-lg-5">
                    <div class="card-vault p-4 mb-4">
                        <h5 class="text-gold font-cinzel mb-3"><i class="fa-solid fa-cloud-arrow-up me-2"></i> Téléversement des Fichiers</h5>
                        <p class="text-muted small">Formats acceptés : MP3, WAV, M4A, FLAC pour l'audio & JPG, PNG pour la cover.</p>

                        <div class="mb-3">
                            <label class="form-label small text-white fw-bold"><i class="fa-solid fa-file-audio text-gold me-1"></i> Fichier Audio Principal (Master / Mix)</label>
                            <input type="file" name="audio_file" accept=".mp3,.wav,.m4a,.flac" class="form-control bg-black border-dark text-light">
                        </div>

                        <div class="mb-3">
                            <label class="form-label small text-white fw-bold"><i class="fa-solid fa-image text-gold me-1"></i> Cover / Pochette</label>
                            <input type="file" name="cover_file" accept=".jpg,.jpeg,.png,.webp" class="form-control bg-black border-dark text-light">
                        </div>

                        <div class="mb-3">
                            <label class="form-label small text-white fw-bold"><i class="fa-solid fa-sliders text-gold me-1"></i> Fichier Instrumental (Instru seule)</label>
                            <input type="file" name="instrumental_file" accept=".mp3,.wav,.m4a,.flac" class="form-control bg-black border-dark text-light">
                        </div>

                        <div class="mb-4">
                            <label class="form-label small text-white fw-bold"><i class="fa-solid fa-microphone text-gold me-1"></i> Piste Acapella (Voix brute ou traitée)</label>
                            <input type="file" name="acapella_file" accept=".mp3,.wav,.m4a,.flac" class="form-control bg-black border-dark text-light">
                        </div>

                        <button type="submit" class="btn btn-gold w-100 py-2">
                            <i class="fa-solid fa-floppy-disk me-2"></i> Enregistrer et Stocker le Song
                        </button>
                    </div>
                </div>
            </div>
        </form>
    </main>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
