<?php
$page_title = "Mixtapes";
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';

$mixtapes = $conn->query("SELECT * FROM mixtapes ORDER BY year DESC, id DESC");
?>

<div class="flex-grow-1 d-flex flex-column" style="min-width: 0;">
    <?php require_once __DIR__ . '/../includes/navbar.php'; ?>

    <main class="p-4 flex-grow-1 overflow-auto" style="padding-bottom: 100px !important;">
        <div class="d-flex align-items-center justify-content-between mb-4">
            <div>
                <h3 class="font-cinzel text-white mb-1"><i class="fa-solid fa-tape text-gold me-2"></i> Mes Mixtapes</h3>
                <p class="text-secondary small mb-0">Mixtapes street, freestyles et projets bruts de MEYZI BRO OFFICIEL.</p>
            </div>
            <a href="../songs/add.php?type=Mixtape" class="btn btn-gold btn-sm"><i class="fa-solid fa-plus me-1"></i> Ajouter un Son Mixtape</a>
        </div>

        <div class="row g-4">
            <?php while($m = $mixtapes->fetch_assoc()): ?>
                <div class="col-md-6">
                    <div class="card-vault p-4 h-100">
                        <div class="d-flex gap-3 align-items-start">
                            <div class="rounded border border-dark d-flex align-items-center justify-content-center bg-black" style="width: 100px; height: 100px;">
                                <i class="fa-solid fa-tape fs-2 text-gold"></i>
                            </div>
                            <div class="flex-grow-1">
                                <span class="badge bg-gold text-black fw-bold mb-1"><?= htmlspecialchars($m['status']) ?></span>
                                <h5 class="text-white font-cinzel mb-1"><?= htmlspecialchars($m['name']) ?></h5>
                                <p class="text-muted small mb-2"><?= htmlspecialchars($m['description'] ?? 'Mixtape officielle.') ?></p>
                                <div class="text-secondary small font-mono-numbers">Année : <?= htmlspecialchars($m['year']) ?></div>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endwhile; ?>
        </div>
    </main>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
