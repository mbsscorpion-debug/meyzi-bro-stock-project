<?php
$page_title = "EPs";
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';

$eps = $conn->query("SELECT * FROM eps ORDER BY year DESC, id DESC");
?>

<div class="flex-grow-1 d-flex flex-column" style="min-width: 0;">
    <?php require_once __DIR__ . '/../includes/navbar.php'; ?>

    <main class="p-4 flex-grow-1 overflow-auto" style="padding-bottom: 100px !important;">
        <div class="d-flex align-items-center justify-content-between mb-4">
            <div>
                <h3 class="font-cinzel text-white mb-1"><i class="fa-solid fa-record-vinyl text-gold me-2"></i> Mes EPs</h3>
                <p class="text-secondary small mb-0">Formats courts conceptuels (TIME, Olel EP...).</p>
            </div>
            <a href="../songs/add.php?type=EP" class="btn btn-gold btn-sm"><i class="fa-solid fa-plus me-1"></i> Ajouter un Titre EP</a>
        </div>

        <div class="row g-4">
            <?php while($ep = $eps->fetch_assoc()): ?>
                <div class="col-md-6">
                    <div class="card-vault p-4 h-100">
                        <div class="d-flex gap-3 align-items-start">
                            <img src="<?= !empty($ep['cover']) ? '../' . $ep['cover'] : '../assets/images/cover_time_ep.jpg' ?>" class="rounded border border-dark" style="width: 100px; height: 100px; object-fit: cover;" alt="EP Cover">
                            <div class="flex-grow-1">
                                <span class="badge bg-gold text-black fw-bold mb-1"><?= htmlspecialchars($ep['status']) ?></span>
                                <h5 class="text-white font-cinzel mb-1"><?= htmlspecialchars($ep['name']) ?></h5>
                                <p class="text-muted small mb-2"><?= htmlspecialchars($ep['description'] ?? 'EP Studio MEYZI BRO.') ?></p>
                                <div class="text-secondary small font-mono-numbers">Sortie : <?= htmlspecialchars($ep['release_date'] ?? '2026') ?></div>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endwhile; ?>
        </div>
    </main>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
