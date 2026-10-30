<?php
$page_title = "Mes Songs";
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';

// Filtres et Recherche
$search = trim($_GET['search'] ?? '');
$filter_type = trim($_GET['type'] ?? '');
$filter_status = trim($_GET['status'] ?? '');
$filter_year = trim($_GET['year'] ?? '');

$sql = "SELECT s.*, p.name AS project_name FROM songs s LEFT JOIN projects p ON s.project_id = p.id WHERE 1=1";
$params = [];
$types = "";

if (!empty($search)) {
    $sql .= " AND (s.title LIKE ? OR s.artist LIKE ? OR s.producer LIKE ? OR s.genre LIKE ?)";
    $like = "%$search%";
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
    $types .= "ssss";
}

if (!empty($filter_type)) {
    $sql .= " AND s.type = ?";
    $params[] = $filter_type;
    $types .= "s";
}

if (!empty($filter_status)) {
    $sql .= " AND s.status = ?";
    $params[] = $filter_status;
    $types .= "s";
}

if (!empty($filter_year)) {
    $sql .= " AND s.year = ?";
    $params[] = $filter_year;
    $types .= "i";
}

$sql .= " ORDER BY s.id DESC";

$stmt = $conn->prepare($sql);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$songs_result = $stmt->get_result();
?>

<div class="flex-grow-1 d-flex flex-column" style="min-width: 0;">
    <?php require_once __DIR__ . '/../includes/navbar.php'; ?>

    <main class="p-4 flex-grow-1 overflow-auto" style="padding-bottom: 100px !important;">
        <!-- Header Section -->
        <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
            <div>
                <h3 class="font-cinzel text-white mb-1"><i class="fa-solid fa-music text-gold me-2"></i> Mes Songs</h3>
                <p class="text-secondary small mb-0">Tous les morceaux, versions de travail, enregistrements et masters.</p>
            </div>
            <a href="add.php" class="btn btn-gold">
                <i class="fa-solid fa-cloud-arrow-up me-2"></i> Ajouter un Song
            </a>
        </div>

        <!-- Filtres & Barre de Recherche -->
        <div class="card-vault p-3 mb-4">
            <form method="GET" action="index.php" class="row g-2 align-items-center">
                <div class="col-md-4">
                    <div class="input-group">
                        <span class="input-group-text bg-black border-dark text-gold"><i class="fa-solid fa-magnifying-glass"></i></span>
                        <input type="text" name="search" class="form-control form-control-sm bg-black border-dark text-light" placeholder="Titre, artiste, producteur..." value="<?= htmlspecialchars($search) ?>">
                    </div>
                </div>
                <div class="col-6 col-md-2">
                    <select name="type" class="form-select form-select-sm bg-black border-dark text-light">
                        <option value="">Tous Types</option>
                        <option value="Single" <?= $filter_type == 'Single' ? 'selected' : '' ?>>Single</option>
                        <option value="Album" <?= $filter_type == 'Album' ? 'selected' : '' ?>>Album</option>
                        <option value="EP" <?= $filter_type == 'EP' ? 'selected' : '' ?>>EP</option>
                        <option value="Mixtape" <?= $filter_type == 'Mixtape' ? 'selected' : '' ?>>Mixtape</option>
                        <option value="Freestyle" <?= $filter_type == 'Freestyle' ? 'selected' : '' ?>>Freestyle</option>
                        <option value="Instrumental" <?= $filter_type == 'Instrumental' ? 'selected' : '' ?>>Instrumental</option>
                    </select>
                </div>
                <div class="col-6 col-md-2">
                    <select name="status" class="form-select form-select-sm bg-black border-dark text-light">
                        <option value="">Tous Statuts</option>
                        <option value="Brouillon" <?= $filter_status == 'Brouillon' ? 'selected' : '' ?>>Brouillon</option>
                        <option value="Enregistrement" <?= $filter_status == 'Enregistrement' ? 'selected' : '' ?>>Enregistrement</option>
                        <option value="Mixage" <?= $filter_status == 'Mixage' ? 'selected' : '' ?>>Mixage</option>
                        <option value="Mastering" <?= $filter_status == 'Mastering' ? 'selected' : '' ?>>Mastering</option>
                        <option value="Terminé" <?= $filter_status == 'Terminé' ? 'selected' : '' ?>>Terminé</option>
                        <option value="Publié" <?= $filter_status == 'Publié' ? 'selected' : '' ?>>Publié</option>
                        <option value="Archivé" <?= $filter_status == 'Archivé' ? 'selected' : '' ?>>Archivé</option>
                    </select>
                </div>
                <div class="col-6 col-md-2">
                    <input type="number" name="year" class="form-control form-control-sm bg-black border-dark text-light" placeholder="Année (ex: 2026)" value="<?= htmlspecialchars($filter_year) ?>">
                </div>
                <div class="col-6 col-md-2 d-flex gap-2">
                    <button type="submit" class="btn btn-sm btn-gold flex-grow-1">Filtrer</button>
                    <a href="index.php" class="btn btn-sm btn-outline-secondary" title="Réinitialiser"><i class="fa-solid fa-rotate-left"></i></a>
                </div>
            </form>
        </div>

        <!-- Tableau des Songs -->
        <div class="card-vault p-0 overflow-hidden">
            <div class="table-responsive">
                <table class="table table-dark table-hover table-dark-custom align-middle mb-0">
                    <thead class="bg-black">
                        <tr class="text-secondary small text-uppercase">
                            <th style="width: 50px;">#</th>
                            <th>Titre & Artiste</th>
                            <th>Type</th>
                            <th>Projet</th>
                            <th>Producteur</th>
                            <th>BPM / Clé</th>
                            <th>Statut</th>
                            <th class="text-end" style="width: 180px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if ($songs_result->num_rows === 0): ?>
                            <tr>
                                <td colspan="8" class="text-center py-5 text-muted">
                                    <i class="fa-solid fa-music fs-2 mb-2 d-block text-secondary"></i>
                                    Aucun song trouvé avec ces filtres.
                                </td>
                            </tr>
                        <?php else: ?>
                            <?php while($s = $songs_result->fetch_assoc()): ?>
                                <tr>
                                    <td class="text-muted small font-mono-numbers"><?= $s['id'] ?></td>
                                    <td>
                                        <div class="d-flex align-items-center gap-3">
                                            <button type="button" class="btn btn-sm btn-gold rounded-circle d-flex align-items-center justify-content-center p-0" style="width: 34px; height: 34px;" onclick="playAudio('<?= htmlspecialchars($s['audio_file'] ?? '') ?>', '<?= htmlspecialchars(addslashes($s['title'])) ?>', '<?= htmlspecialchars(addslashes($s['artist'])) ?>', '<?= htmlspecialchars($s['cover_file'] ?? '') ?>')">
                                                <i class="fa-solid fa-play" style="font-size: 11px;"></i>
                                            </button>
                                            <div>
                                                <strong class="text-white d-block"><?= htmlspecialchars($s['title']) ?></strong>
                                                <small class="text-muted"><?= htmlspecialchars($s['artist']) ?><?= !empty($s['featuring']) ? ' ft. ' . htmlspecialchars($s['featuring']) : '' ?></small>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span class="badge bg-black border border-secondary text-secondary"><?= htmlspecialchars($s['type']) ?></span></td>
                                    <td class="text-gold small"><?= htmlspecialchars($s['project_name'] ?? '—') ?></td>
                                    <td class="text-secondary small"><?= htmlspecialchars($s['producer'] ?? '—') ?></td>
                                    <td class="text-muted small font-mono-numbers"><?= htmlspecialchars($s['bpm'] ?? '-') ?> BPM &middot; <?= htmlspecialchars($s['key_signature'] ?? '-') ?></td>
                                    <td>
                                        <span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 small">
                                            <?= htmlspecialchars($s['status']) ?>
                                        </span>
                                    </td>
                                    <td class="text-end">
                                        <div class="btn-group btn-group-sm">
                                            <a href="view.php?id=<?= $s['id'] ?>" class="btn btn-outline-secondary" title="Détails"><i class="fa-solid fa-eye"></i></a>
                                            <a href="edit.php?id=<?= $s['id'] ?>" class="btn btn-outline-secondary" title="Modifier"><i class="fa-solid fa-pen"></i></a>
                                            <?php if (!empty($s['audio_file'])): ?>
                                                <a href="../<?= htmlspecialchars($s['audio_file']) ?>" download class="btn btn-outline-secondary" title="Télécharger Audio"><i class="fa-solid fa-download"></i></a>
                                            <?php endif; ?>
                                            <a href="delete.php?id=<?= $s['id'] ?>" class="btn btn-outline-danger" onclick="return confirm('Supprimer ce song ?');" title="Supprimer"><i class="fa-solid fa-trash"></i></a>
                                        </div>
                                    </td>
                                </tr>
                            <?php endwhile; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </main>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
