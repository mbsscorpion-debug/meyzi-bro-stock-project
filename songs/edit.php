<?php
$page_title = "Modifier Song";
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$stmt = $conn->prepare("SELECT * FROM songs WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$song = $stmt->get_result()->fetch_assoc();

if (!$song) {
    echo "<div class='p-5 text-white'>Song introuvable.</div>";
    require_once __DIR__ . '/../includes/footer.php';
    exit();
}

$error = '';
$success = '';
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
        $error = "Le titre est obligatoire.";
    } else {
        $stmt_up = $conn->prepare("UPDATE songs SET title=?, type=?, project_id=?, artist=?, featuring=?, producer=?, composer=?, studio=?, genre=?, year=?, bpm=?, key_signature=?, duration=?, status=?, description=?, lyrics=?, notes=? WHERE id=?");
        $stmt_up->bind_param("ssissssssiissssssi", $title, $type, $project_id, $artist, $featuring, $producer, $composer, $studio, $genre, $year, $bpm, $key_signature, $duration, $status, $description, $lyrics, $notes, $id);
        if ($stmt_up->execute()) {
            $success = "Song mis à jour avec succès !";
            // Refresh
            $song['title'] = $title;
            $song['type'] = $type;
            $song['status'] = $status;
        } else {
            $error = "Erreur : " . $conn->error;
        }
    }
}
?>

<div class="flex-grow-1 d-flex flex-column" style="min-width: 0;">
    <?php require_once __DIR__ . '/../includes/navbar.php'; ?>

    <main class="p-4 flex-grow-1 overflow-auto" style="padding-bottom: 100px !important;">
        <div class="d-flex align-items-center justify-content-between mb-4">
            <h3 class="font-cinzel text-white mb-0">Modifier : <?= htmlspecialchars($song['title']) ?></h3>
            <a href="view.php?id=<?= $id ?>" class="btn btn-outline-secondary btn-sm">&larr; Retour</a>
        </div>

        <?php if ($error): ?><div class="alert alert-danger py-2 small"><?= htmlspecialchars($error) ?></div><?php endif; ?>
        <?php if ($success): ?><div class="alert alert-success py-2 small"><?= htmlspecialchars($success) ?></div><?php endif; ?>

        <form method="POST">
            <div class="card-vault p-4 mb-4">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label small text-secondary">Titre *</label>
                        <input type="text" name="title" class="form-control bg-black border-dark text-white" value="<?= htmlspecialchars($song['title']) ?>" required>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label small text-secondary">Type</label>
                        <select name="type" class="form-select bg-black border-dark text-white">
                            <?php foreach(['Single', 'Album', 'EP', 'Mixtape', 'Freestyle', 'Instrumental', 'Autre'] as $t): ?>
                                <option value="<?= $t ?>" <?= $song['type'] == $t ? 'selected' : '' ?>><?= $t ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label small text-secondary">Statut</label>
                        <select name="status" class="form-select bg-black border-dark text-white">
                            <?php foreach(['Brouillon', 'Enregistrement', 'Mixage', 'Mastering', 'Terminé', 'Publié', 'Archivé'] as $st): ?>
                                <option value="<?= $st ?>" <?= $song['status'] == $st ? 'selected' : '' ?>><?= $st ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small text-secondary">Projet</label>
                        <select name="project_id" class="form-select bg-black border-dark text-white">
                            <option value="">-- Aucun --</option>
                            <?php while($p = $projects_list->fetch_assoc()): ?>
                                <option value="<?= $p['id'] ?>" <?= $song['project_id'] == $p['id'] ? 'selected' : '' ?>><?= htmlspecialchars($p['name']) ?></option>
                            <?php endwhile; ?>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small text-secondary">Featuring</label>
                        <input type="text" name="featuring" class="form-control bg-black border-dark text-white" value="<?= htmlspecialchars($song['featuring'] ?? '') ?>">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label small text-secondary">Producteur</label>
                        <input type="text" name="producer" class="form-control bg-black border-dark text-white" value="<?= htmlspecialchars($song['producer'] ?? '') ?>">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label small text-secondary">BPM</label>
                        <input type="number" name="bpm" class="form-control bg-black border-dark text-white font-mono-numbers" value="<?= htmlspecialchars($song['bpm'] ?? '') ?>">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label small text-secondary">Clé</label>
                        <input type="text" name="key_signature" class="form-control bg-black border-dark text-white" value="<?= htmlspecialchars($song['key_signature'] ?? '') ?>">
                    </div>
                    <div class="col-12">
                        <label class="form-label small text-secondary">Paroles</label>
                        <textarea name="lyrics" rows="5" class="form-control bg-black border-dark text-white"><?= htmlspecialchars($song['lyrics'] ?? '') ?></textarea>
                    </div>
                </div>
                <button type="submit" class="btn btn-gold mt-4"><i class="fa-solid fa-check me-2"></i> Enregistrer les modifications</button>
            </div>
        </form>
    </main>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
