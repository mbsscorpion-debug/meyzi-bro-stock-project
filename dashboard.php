<?php
$page_title = "Dashboard";
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/includes/header.php';
require_once __DIR__ . '/includes/sidebar.php';

// Statistiques principales
$total_songs = $conn->query("SELECT COUNT(*) AS total FROM songs")->fetch_assoc()['total'] ?? 0;
$total_albums = $conn->query("SELECT COUNT(*) AS total FROM albums")->fetch_assoc()['total'] ?? 0;
$total_eps = $conn->query("SELECT COUNT(*) AS total FROM eps")->fetch_assoc()['total'] ?? 0;
$total_singles = $conn->query("SELECT COUNT(*) AS total FROM songs WHERE type = 'Single'")->fetch_assoc()['total'] ?? 0;
$total_instrumentals = $conn->query("SELECT COUNT(*) AS total FROM instrumentals")->fetch_assoc()['total'] ?? 0;
$total_projects = $conn->query("SELECT COUNT(*) AS total FROM projects")->fetch_assoc()['total'] ?? 0;
$total_files = $conn->query("SELECT COUNT(*) AS total FROM files")->fetch_assoc()['total'] ?? 0;

$projects_in_progress = $conn->query("SELECT COUNT(*) AS total FROM projects WHERE status NOT IN ('Terminé', 'Publié', 'Archivé')")->fetch_assoc()['total'] ?? 0;
$projects_completed = $conn->query("SELECT COUNT(*) AS total FROM projects WHERE status IN ('Terminé', 'Publié')")->fetch_assoc()['total'] ?? 0;

// Derniers songs ajoutés
$recent_songs = $conn->query("SELECT * FROM songs ORDER BY id DESC LIMIT 5");

// Derniers projets ajoutés
$recent_projects = $conn->query("SELECT * FROM projects ORDER BY id DESC LIMIT 4");
?>

<div class="flex-grow-1 d-flex flex-column" style="min-width: 0;">
    <?php require_once __DIR__ . '/includes/navbar.php'; ?>

    <main class="p-4 flex-grow-1 overflow-auto" style="padding-bottom: 100px !important;">
        <!-- Banner Hero Artiste -->
        <div class="card-vault p-4 mb-4 border-0 position-relative overflow-hidden" style="background: linear-gradient(135deg, #18150d 0%, #0e0e0e 100%); border-left: 4px solid #d4af37 !important;">
            <div class="row align-items-center">
                <div class="col-lg-8">
                    <span class="badge bg-gold text-black fw-bold mb-2 text-uppercase">Coffre-fort Personnel</span>
                    <h2 class="font-cinzel text-white mb-1">MEYZI BRO STOCK PROJECT</h2>
                    <p class="text-secondary mb-0 small">
                        Plateforme centrale de gestion, écoute et archivage studio de l'artiste <strong>MEYZI BRO OFFICIEL</strong>.
                    </p>
                </div>
                <div class="col-lg-4 text-lg-end mt-3 mt-lg-0">
                    <a href="songs/add.php" class="btn btn-gold px-3 me-2">
                        <i class="fa-solid fa-cloud-arrow-up me-1"></i> Uploader un son
                    </a>
                    <a href="projects/index.php" class="btn btn-outline-gold px-3">
                        <i class="fa-solid fa-folder-plus me-1"></i> Nouveau projet
                    </a>
                </div>
            </div>
        </div>

        <!-- 1. Stats Counter Cards -->
        <div class="row g-3 mb-4">
            <div class="col-6 col-md-4 col-xl-2">
                <div class="card-vault p-3 text-center">
                    <div class="text-gold mb-1"><i class="fa-solid fa-music fs-4"></i></div>
                    <div class="fs-4 fw-bold text-white"><?= $total_songs ?></div>
                    <div class="text-muted small">Total Songs</div>
                </div>
            </div>
            <div class="col-6 col-md-4 col-xl-2">
                <div class="card-vault p-3 text-center">
                    <div class="text-gold mb-1"><i class="fa-solid fa-compact-disc fs-4"></i></div>
                    <div class="fs-4 fw-bold text-white"><?= $total_albums ?></div>
                    <div class="text-muted small">Albums</div>
                </div>
            </div>
            <div class="col-6 col-md-4 col-xl-2">
                <div class="card-vault p-3 text-center">
                    <div class="text-gold mb-1"><i class="fa-solid fa-record-vinyl fs-4"></i></div>
                    <div class="fs-4 fw-bold text-white"><?= $total_eps ?></div>
                    <div class="text-muted small">EPs</div>
                </div>
            </div>
            <div class="col-6 col-md-4 col-xl-2">
                <div class="card-vault p-3 text-center">
                    <div class="text-gold mb-1"><i class="fa-solid fa-bolt fs-4"></i></div>
                    <div class="fs-4 fw-bold text-white"><?= $total_singles ?></div>
                    <div class="text-muted small">Singles</div>
                </div>
            </div>
            <div class="col-6 col-md-4 col-xl-2">
                <div class="card-vault p-3 text-center">
                    <div class="text-gold mb-1"><i class="fa-solid fa-sliders fs-4"></i></div>
                    <div class="fs-4 fw-bold text-white"><?= $total_instrumentals ?></div>
                    <div class="text-muted small">Instrumentales</div>
                </div>
            </div>
            <div class="col-6 col-md-4 col-xl-2">
                <div class="card-vault p-3 text-center">
                    <div class="text-gold mb-1"><i class="fa-solid fa-folder-tree fs-4"></i></div>
                    <div class="fs-4 fw-bold text-white"><?= $total_projects ?></div>
                    <div class="text-muted small">Projets (<?= $projects_in_progress ?> en cours)</div>
                </div>
            </div>
        </div>

        <!-- 2. Derniers Projets & Projets en cours -->
        <div class="row g-4 mb-4">
            <div class="col-lg-8">
                <div class="card-vault p-4 h-100">
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <h5 class="text-white font-cinzel mb-0"><i class="fa-solid fa-fire text-gold me-2"></i> Derniers Projets</h5>
                        <a href="projects/index.php" class="text-gold small text-decoration-none">Voir tout &rarr;</a>
                    </div>
                    <div class="row g-3">
                        <?php while($p = $recent_projects->fetch_assoc()): ?>
                            <div class="col-md-6">
                                <div class="p-3 rounded border border-dark bg-black">
                                    <div class="d-flex align-items-center justify-content-between mb-2">
                                        <span class="badge bg-dark text-gold border border-warning border-opacity-25"><?= htmlspecialchars($p['type']) ?></span>
                                        <span class="small text-secondary"><?= htmlspecialchars($p['status']) ?></span>
                                    </div>
                                    <h6 class="text-white mb-1 fw-bold"><?= htmlspecialchars($p['name']) ?></h6>
                                    <p class="text-muted small text-truncate mb-2"><?= htmlspecialchars($p['description'] ?? 'Pas de description') ?></p>
                                    
                                    <div class="d-flex align-items-center justify-content-between small text-muted">
                                        <span>Progression</span>
                                        <span class="text-gold fw-bold"><?= (int)$p['progress'] ?>%</span>
                                    </div>
                                    <div class="progress bg-dark mt-1" style="height: 6px;">
                                        <div class="progress-bar bg-gold" role="progressbar" style="width: <?= (int)$p['progress'] ?>%;"></div>
                                    </div>
                                </div>
                            </div>
                        <?php endwhile; ?>
                    </div>
                </div>
            </div>

            <!-- Projets Terminés vs En Cours -->
            <div class="col-lg-4">
                <div class="card-vault p-4 h-100">
                    <h5 class="text-white font-cinzel mb-3"><i class="fa-solid fa-chart-simple text-gold me-2"></i> État du Studio</h5>
                    
                    <div class="p-3 rounded border border-dark bg-black mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="text-secondary small">Projets en cours</span>
                            <span class="text-white fw-bold"><?= $projects_in_progress ?></span>
                        </div>
                        <div class="progress bg-dark" style="height: 6px;">
                            <div class="progress-bar bg-warning" style="width: <?= $total_projects > 0 ? ($projects_in_progress / $total_projects * 100) : 0 ?>%;"></div>
                        </div>
                    </div>

                    <div class="p-3 rounded border border-dark bg-black mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="text-secondary small">Projets terminés / publiés</span>
                            <span class="text-white fw-bold"><?= $projects_completed ?></span>
                        </div>
                        <div class="progress bg-dark" style="height: 6px;">
                            <div class="progress-bar bg-success" style="width: <?= $total_projects > 0 ? ($projects_completed / $total_projects * 100) : 0 ?>%;"></div>
                        </div>
                    </div>

                    <div class="p-3 rounded border border-dark bg-black">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-secondary small"><i class="fa-solid fa-hard-drive me-1 text-gold"></i> Fichiers stockés</span>
                            <span class="badge bg-gold text-black fw-bold"><?= $total_files ?> fichiers</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 3. Derniers Songs Ajoutés (Tableau interactif avec Player) -->
        <div class="card-vault p-4">
            <div class="d-flex align-items-center justify-content-between mb-3">
                <h5 class="text-white font-cinzel mb-0"><i class="fa-solid fa-compact-disc text-gold me-2"></i> Derniers Songs au Stock</h5>
                <a href="songs/index.php" class="text-gold small text-decoration-none">Tous les songs &rarr;</a>
            </div>

            <div class="table-responsive">
                <table class="table table-dark table-hover table-dark-custom align-middle mb-0">
                    <thead>
                        <tr class="text-secondary small text-uppercase">
                            <th scope="col">Titre</th>
                            <th scope="col">Type</th>
                            <th scope="col">Producteur</th>
                            <th scope="col">BPM / Clé</th>
                            <th scope="col">Statut</th>
                            <th scope="col" class="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php while($s = $recent_songs->fetch_assoc()): ?>
                            <tr>
                                <td>
                                    <div class="d-flex align-items-center gap-3">
                                        <button type="button" class="btn btn-sm btn-gold rounded-circle p-0 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;" onclick="playAudio('<?= htmlspecialchars($s['audio_file'] ?? '') ?>', '<?= htmlspecialchars(addslashes($s['title'])) ?>', '<?= htmlspecialchars(addslashes($s['artist'])) ?>', '<?= htmlspecialchars($s['cover_file'] ?? '') ?>')">
                                            <i class="fa-solid fa-play" style="font-size: 11px;"></i>
                                        </button>
                                        <div>
                                            <strong class="text-white d-block"><?= htmlspecialchars($s['title']) ?></strong>
                                            <small class="text-muted"><?= htmlspecialchars($s['artist']) ?><?= !empty($s['featuring']) ? ' ft. ' . htmlspecialchars($s['featuring']) : '' ?></small>
                                        </div>
                                    </div>
                                </td>
                                <td><span class="badge bg-black border border-secondary text-secondary"><?= htmlspecialchars($s['type']) ?></span></td>
                                <td class="text-light small"><?= htmlspecialchars($s['producer'] ?? 'Non spécifié') ?></td>
                                <td class="text-gold small font-mono-numbers"><?= htmlspecialchars($s['bpm'] ?? '-') ?> BPM / <?= htmlspecialchars($s['key_signature'] ?? '-') ?></td>
                                <td>
                                    <span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 small">
                                        <?= htmlspecialchars($s['status']) ?>
                                    </span>
                                </td>
                                <td class="text-end">
                                    <a href="songs/view.php?id=<?= $s['id'] ?>" class="btn btn-sm btn-outline-secondary me-1" title="Voir détails">
                                        <i class="fa-solid fa-eye"></i>
                                    </a>
                                    <a href="songs/edit.php?id=<?= $s['id'] ?>" class="btn btn-sm btn-outline-warning" title="Modifier">
                                        <i class="fa-solid fa-pen"></i>
                                    </a>
                                </td>
                            </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </main>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
