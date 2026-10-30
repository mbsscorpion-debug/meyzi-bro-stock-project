<?php
$page_title = "Mes Projets";
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';

// Création rapide d'un projet
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $type = trim($_POST['type'] ?? 'Album');
    $description = trim($_POST['description'] ?? '');
    $status = trim($_POST['status'] ?? 'En préparation');
    $progress = (int)($_POST['progress'] ?? 0);

    if (!empty($name)) {
        $stmt = $conn->prepare("INSERT INTO projects (name, type, description, status, progress) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssi", $name, $type, $description, $status, $progress);
        $stmt->execute();
        $stmt->close();
    }
}

$projects = $conn->query("SELECT p.*, COUNT(s.id) AS song_count FROM projects p LEFT JOIN songs s ON p.id = s.project_id GROUP BY p.id ORDER BY p.id DESC");
?>

<div class="flex-grow-1 d-flex flex-column" style="min-width: 0;">
    <?php require_once __DIR__ . '/../includes/navbar.php'; ?>

    <main class="p-4 flex-grow-1 overflow-auto" style="padding-bottom: 100px !important;">
        <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
            <div>
                <h3 class="font-cinzel text-white mb-1"><i class="fa-solid fa-folder-tree text-gold me-2"></i> Mes Projets Musicaux</h3>
                <p class="text-secondary small mb-0">Suivi des albums, EPs, mixtapes et capsules (Résilience, TIME, Olel EP, PaPa Drill...).</p>
            </div>
            <button class="btn btn-gold" data-bs-toggle="modal" data-bs-target="#newProjectModal">
                <i class="fa-solid fa-plus me-1"></i> Nouveau Projet
            </button>
        </div>

        <div class="row g-4">
            <?php while($p = $projects->fetch_assoc()): ?>
                <div class="col-md-6 col-xl-4">
                    <div class="card-vault p-4 h-100 d-flex flex-column">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <span class="badge bg-black border border-warning text-gold"><?= htmlspecialchars($p['type']) ?></span>
                            <span class="badge bg-secondary"><?= htmlspecialchars($p['status']) ?></span>
                        </div>
                        <h5 class="text-white font-cinzel mb-2"><?= htmlspecialchars($p['name']) ?></h5>
                        <p class="text-secondary small flex-grow-1"><?= htmlspecialchars($p['description'] ?? 'Pas de description.') ?></p>

                        <div class="mt-3 pt-3 border-top border-dark">
                            <div class="d-flex justify-content-between small text-muted mb-1">
                                <span>Progression globale</span>
                                <span class="text-gold fw-bold"><?= (int)$p['progress'] ?>%</span>
                            </div>
                            <div class="progress bg-black mb-3" style="height: 6px;">
                                <div class="progress-bar bg-gold" style="width: <?= (int)$p['progress'] ?>%;"></div>
                            </div>

                            <div class="d-flex align-items-center justify-content-between">
                                <span class="text-muted small"><i class="fa-solid fa-music me-1 text-gold"></i> <?= (int)$p['song_count'] ?> titres associés</span>
                                <a href="../songs/index.php?project=<?= $p['id'] ?>" class="btn btn-sm btn-outline-gold">Ouvrir</a>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endwhile; ?>
        </div>
    </main>
</div>

<!-- Modal Nouveau Projet -->
<div class="modal fade" id="newProjectModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content bg-dark text-white border-secondary">
            <div class="modal-header border-secondary">
                <h5 class="modal-title font-cinzel text-gold">Créer un Projet</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <form method="POST">
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label small text-secondary">Nom du Projet</label>
                        <input type="text" name="name" class="form-control bg-black border-dark text-white" placeholder="ex: PaPa Drill" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small text-secondary">Type</label>
                        <select name="type" class="form-select bg-black border-dark text-white">
                            <option value="Album">Album</option>
                            <option value="EP">EP</option>
                            <option value="Mixtape">Mixtape</option>
                            <option value="Single">Single</option>
                            <option value="Autre">Autre</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small text-secondary">Statut</label>
                        <select name="status" class="form-select bg-black border-dark text-white">
                            <option value="Idée">Idée</option>
                            <option value="En préparation">En préparation</option>
                            <option value="Enregistrement">Enregistrement</option>
                            <option value="Mixage">Mixage</option>
                            <option value="Mastering">Mastering</option>
                            <option value="Terminé">Terminé</option>
                            <option value="Publié">Publié</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small text-secondary">Progression (%)</label>
                        <input type="number" name="progress" min="0" max="100" class="form-control bg-black border-dark text-white font-mono-numbers" value="10">
                    </div>
                    <div class="mb-3">
                        <label class="form-label small text-secondary">Description</label>
                        <textarea name="description" class="form-control bg-black border-dark text-white" rows="3"></textarea>
                    </div>
                </div>
                <div class="modal-footer border-secondary">
                    <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Annuler</button>
                    <button type="submit" class="btn btn-gold btn-sm">Créer le Projet</button>
                </div>
            </form>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
