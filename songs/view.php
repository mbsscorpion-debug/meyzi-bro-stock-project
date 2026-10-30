<?php
$page_title = "Détails du Song";
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$stmt = $conn->prepare("SELECT s.*, p.name AS project_name FROM songs s LEFT JOIN projects p ON s.project_id = p.id WHERE s.id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$song = $stmt->get_result()->fetch_assoc();

if (!$song) {
    echo "<div class='p-5 text-white'>Song introuvable. <a href='index.php'>Retour</a></div>";
    require_once __DIR__ . '/../includes/footer.php';
    exit();
}
?>

<div class="flex-grow-1 d-flex flex-column" style="min-width: 0;">
    <?php require_once __DIR__ . '/../includes/navbar.php'; ?>

    <main class="p-4 flex-grow-1 overflow-auto" style="padding-bottom: 100px !important;">
        <div class="d-flex align-items-center justify-content-between mb-4">
            <a href="index.php" class="btn btn-outline-secondary btn-sm">&larr; Tous les songs</a>
            <div class="d-flex gap-2">
                <a href="edit.php?id=<?= $song['id'] ?>" class="btn btn-sm btn-outline-warning"><i class="fa-solid fa-pen me-1"></i> Modifier</a>
                <a href="delete.php?id=<?= $song['id'] ?>" class="btn btn-sm btn-outline-danger" onclick="return confirm('Confirmer la suppression ?');"><i class="fa-solid fa-trash me-1"></i> Supprimer</a>
            </div>
        </div>

        <div class="card-vault p-4 mb-4">
            <div class="row align-items-center">
                <div class="col-md-3 text-center mb-3 mb-md-0">
                    <img src="<?= htmlspecialchars(!empty($song['cover_file']) ? '../' . $song['cover_file'] : '../assets/images/cover_placeholder.jpg') ?>" class="rounded border border-dark img-fluid shadow" style="max-height: 220px; object-fit: cover;" alt="Cover">
                </div>
                <div class="col-md-9">
                    <div class="d-flex align-items-center gap-2 mb-2">
                        <span class="badge bg-gold text-black fw-bold"><?= htmlspecialchars($song['type']) ?></span>
                        <span class="badge bg-secondary"><?= htmlspecialchars($song['status']) ?></span>
                        <?php if ($song['project_name']): ?>
                            <span class="text-secondary small">&bull; Projet : <strong class="text-white"><?= htmlspecialchars($song['project_name']) ?></strong></span>
                        <?php endif; ?>
                    </div>
                    <h2 class="font-cinzel text-white mb-1"><?= htmlspecialchars($song['title']) ?></h2>
                    <h5 class="text-gold mb-3"><?= htmlspecialchars($song['artist']) ?><?= !empty($song['featuring']) ? ' <span class="text-light">ft. ' . htmlspecialchars($song['featuring']) . '</span>' : '' ?></h5>

                    <div class="row g-3 py-2 border-top border-bottom border-dark small text-secondary">
                        <div class="col-6 col-md-3"><strong>Producteur :</strong> <span class="text-light"><?= htmlspecialchars($song['producer'] ?? '—') ?></span></div>
                        <div class="col-6 col-md-3"><strong>Genre :</strong> <span class="text-light"><?= htmlspecialchars($song['genre'] ?? '—') ?></span></div>
                        <div class="col-6 col-md-3"><strong>BPM / Clé :</strong> <span class="text-gold font-mono-numbers"><?= htmlspecialchars($song['bpm'] ?? '-') ?> BPM / <?= htmlspecialchars($song['key_signature'] ?? '-') ?></span></div>
                        <div class="col-6 col-md-3"><strong>Durée :</strong> <span class="text-light font-mono-numbers"><?= htmlspecialchars($song['duration'] ?? '-') ?></span></div>
                    </div>

                    <!-- Actions d'écoute -->
                    <div class="d-flex flex-wrap gap-2 mt-3">
                        <?php if ($song['audio_file']): ?>
                            <button class="btn btn-gold btn-sm d-flex align-items-center gap-2" onclick="playAudio('../<?= htmlspecialchars($song['audio_file']) ?>', '<?= htmlspecialchars(addslashes($song['title'])) ?>', '<?= htmlspecialchars(addslashes($song['artist'])) ?>', '../<?= htmlspecialchars($song['cover_file'] ?? '') ?>')">
                                <i class="fa-solid fa-play"></i> Écouter Master Audio
                            </button>
                            <a href="../<?= htmlspecialchars($song['audio_file']) ?>" download class="btn btn-outline-secondary btn-sm">
                                <i class="fa-solid fa-download me-1"></i> Télécharger Master
                            </a>
                        <?php endif; ?>

                        <?php if ($song['instrumental_file']): ?>
                            <button class="btn btn-outline-warning btn-sm" onclick="playAudio('../<?= htmlspecialchars($song['instrumental_file']) ?>', '<?= htmlspecialchars(addslashes($song['title'])) ?> (Instru)', '<?= htmlspecialchars(addslashes($song['artist'])) ?>', '../<?= htmlspecialchars($song['cover_file'] ?? '') ?>')">
                                <i class="fa-solid fa-sliders me-1"></i> Écouter Instru
                            </button>
                        <?php endif; ?>

                        <?php if ($song['acapella_file']): ?>
                            <button class="btn btn-outline-light btn-sm" onclick="playAudio('../<?= htmlspecialchars($song['acapella_file']) ?>', '<?= htmlspecialchars(addslashes($song['title'])) ?> (Acapella)', '<?= htmlspecialchars(addslashes($song['artist'])) ?>', '../<?= htmlspecialchars($song['cover_file'] ?? '') ?>')">
                                <i class="fa-solid fa-microphone me-1"></i> Écouter Acapella
                            </button>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>

        <!-- Paroles & Notes -->
        <div class="row g-4">
            <div class="col-lg-7">
                <div class="card-vault p-4 h-100">
                    <h5 class="text-gold font-cinzel mb-3"><i class="fa-solid fa-align-left me-2"></i> Paroles (Lyrics)</h5>
                    <?php if (!empty($song['lyrics'])): ?>
                        <div class="bg-black p-3 rounded border border-dark text-light font-mono small" style="white-space: pre-wrap; line-height: 1.8;">
<?= htmlspecialchars($song['lyrics']) ?>
                        </div>
                    <?php else: ?>
                        <p class="text-muted small">Aucune parole enregistrée pour ce morceau.</p>
                    <?php endif; ?>
                </div>
            </div>

            <div class="col-lg-5">
                <div class="card-vault p-4 h-100">
                    <h5 class="text-gold font-cinzel mb-3"><i class="fa-solid fa-clipboard-list me-2"></i> Notes & Métadonnées Studio</h5>
                    <div class="p-3 bg-black rounded border border-dark mb-3">
                        <div class="text-secondary small mb-1">Studio :</div>
                        <div class="text-white"><?= htmlspecialchars($song['studio'] ?? 'Non spécifié') ?></div>
                    </div>
                    <div class="p-3 bg-black rounded border border-dark mb-3">
                        <div class="text-secondary small mb-1">Compositeur :</div>
                        <div class="text-white"><?= htmlspecialchars($song['composer'] ?? 'MEYZI BRO') ?></div>
                    </div>
                    <?php if (!empty($song['notes'])): ?>
                        <div class="p-3 bg-black rounded border border-dark">
                            <div class="text-secondary small mb-1">Notes de production :</div>
                            <div class="text-light small"><?= nl2br(htmlspecialchars($song['notes'])) ?></div>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </main>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
