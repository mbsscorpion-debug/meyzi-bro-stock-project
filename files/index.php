<?php
$page_title = "Bibliothèque de Fichiers";
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';

$category = trim($_GET['category'] ?? '');
$sql = "SELECT f.*, s.title AS song_title FROM files f LEFT JOIN songs s ON f.song_id = s.id WHERE 1=1";
$params = [];
$types = "";

if (!empty($category)) {
    $sql .= " AND f.category = ?";
    $params[] = $category;
    $types .= "s";
}
$sql .= " ORDER BY f.id DESC";

$stmt = $conn->prepare($sql);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$files_res = $stmt->get_result();

function formatSize($bytes) {
    if ($bytes >= 1073741824) return number_format($bytes / 1073741824, 2) . ' GB';
    if ($bytes >= 1048576) return number_format($bytes / 1048576, 2) . ' MB';
    if ($bytes >= 1024) return number_format($bytes / 1024, 2) . ' KB';
    return $bytes . ' B';
}
?>

<div class="flex-grow-1 d-flex flex-column" style="min-width: 0;">
    <?php require_once __DIR__ . '/../includes/navbar.php'; ?>

    <main class="p-4 flex-grow-1 overflow-auto" style="padding-bottom: 100px !important;">
        <div class="d-flex align-items-center justify-content-between mb-4">
            <div>
                <h3 class="font-cinzel text-white mb-1"><i class="fa-solid fa-box-archive text-gold me-2"></i> Coffre-fort & Fichiers</h3>
                <p class="text-secondary small mb-0">Tous les assets studio : WAV masters, Stems, Projets, Covers 4K et Documents.</p>
            </div>
        </div>

        <!-- Filtres catégories -->
        <div class="d-flex flex-wrap gap-2 mb-4">
            <a href="index.php" class="btn btn-sm <?= empty($category) ? 'btn-gold' : 'btn-outline-secondary' ?>">Tous les fichiers</a>
            <?php foreach(['Audio', 'Covers', 'Paroles', 'Instrumentales', 'Acapella', 'Stems', 'Clips', 'Documents'] as $cat): ?>
                <a href="index.php?category=<?= $cat ?>" class="btn btn-sm <?= $category == $cat ? 'btn-gold' : 'btn-outline-secondary' ?>"><?= $cat ?></a>
            <?php endforeach; ?>
        </div>

        <div class="card-vault p-0 overflow-hidden">
            <div class="table-responsive">
                <table class="table table-dark table-hover table-dark-custom align-middle mb-0">
                    <thead>
                        <tr class="text-secondary small text-uppercase">
                            <th>Nom du fichier</th>
                            <th>Catégorie</th>
                            <th>Format</th>
                            <th>Taille</th>
                            <th>Song Associé</th>
                            <th>Date d'ajout</th>
                            <th class="text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if ($files_res->num_rows === 0): ?>
                            <tr><td colspan="7" class="text-center py-4 text-muted">Aucun fichier dans cette catégorie.</td></tr>
                        <?php else: ?>
                            <?php while($f = $files_res->fetch_assoc()): ?>
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center gap-2">
                                            <i class="fa-solid fa-file text-gold"></i>
                                            <span class="text-white fw-bold"><?= htmlspecialchars($f['file_name']) ?></span>
                                        </div>
                                    </td>
                                    <td><span class="badge bg-black border border-secondary text-secondary"><?= htmlspecialchars($f['category']) ?></span></td>
                                    <td class="text-secondary small"><?= htmlspecialchars($f['file_type']) ?></td>
                                    <td class="text-light small font-mono-numbers"><?= formatSize($f['file_size']) ?></td>
                                    <td class="text-gold small"><?= htmlspecialchars($f['song_title'] ?? '—') ?></td>
                                    <td class="text-secondary small font-mono-numbers"><?= substr($f['created_at'], 0, 10) ?></td>
                                    <td class="text-end">
                                        <a href="../<?= htmlspecialchars($f['file_path']) ?>" download class="btn btn-sm btn-outline-gold">
                                            <i class="fa-solid fa-download"></i>
                                        </a>
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
