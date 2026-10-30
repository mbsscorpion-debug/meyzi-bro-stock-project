<?php
$page_title = "Albums";
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';

$albums = $conn->query("SELECT * FROM albums ORDER BY year DESC, id DESC");
?>

<div class="flex-grow-1 d-flex flex-column" style="min-width: 0;">
    <?php require_once __DIR__ . '/../includes/navbar.php'; ?>

    <main class="p-4 flex-grow-1 overflow-auto" style="padding-bottom: 100px !important;">
        <div class="d-flex align-items-center justify-content-between mb-4">
            <div>
                <h3 class="font-cinzel text-white mb-1"><i class="fa-solid fa-compact-disc text-gold me-2"></i> Mes Albums</h3>
                <p class="text-secondary small mb-0">Grands formats studio, tracklists complètes et archivage des masters.</p>
            </div>
            <a href="../songs/add.php?type=Album" class="btn btn-gold btn-sm"><i class="fa-solid fa-plus me-1"></i> Ajouter un Titre Album</a>
        </div>

        <div class="row g-4">
            <?php while($alb = $albums->fetch_assoc()): 
                // Songs de cet album
                $alb_name = $alb['name'];
                $songs_stmt = $conn->prepare("SELECT * FROM songs WHERE type = 'Album' ORDER BY id ASC");
                $songs_stmt->execute();
                $alb_songs = $songs_stmt->get_result();
            ?>
                <div class="col-12">
                    <div class="card-vault p-4">
                        <div class="row g-4">
                            <div class="col-md-3 text-center">
                                <img src="<?= !empty($alb['cover']) ? '../' . $alb['cover'] : '../assets/images/cover_resilience.jpg' ?>" class="rounded border border-dark img-fluid shadow mb-3" style="max-height: 200px; width: 100%; object-fit: cover;" alt="<?= htmlspecialchars($alb['name']) ?>">
                                <span class="badge bg-gold text-black fw-bold"><?= htmlspecialchars($alb['status']) ?></span>
                                <div class="text-muted small mt-1 font-mono-numbers">Année : <?= $alb['year'] ?></div>
                            </div>
                            <div class="col-md-9">
                                <h4 class="font-cinzel text-white mb-1"><?= htmlspecialchars($alb['name']) ?></h4>
                                <p class="text-secondary small mb-3"><?= htmlspecialchars($alb['description'] ?? 'Album officiel de MEYZI BRO.') ?></p>
                                
                                <h6 class="text-gold font-cinzel small mb-2"><i class="fa-solid fa-list-ol me-1"></i> Tracklist</h6>
                                <div class="table-responsive">
                                    <table class="table table-dark table-sm table-dark-custom align-middle">
                                        <thead>
                                            <tr class="text-muted small">
                                                <th>#</th>
                                                <th>Titre</th>
                                                <th>BPM</th>
                                                <th>Durée</th>
                                                <th>Statut</th>
                                                <th class="text-end">Écoute</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php $i=1; while($song = $alb_songs->fetch_assoc()): ?>
                                                <tr>
                                                    <td class="text-muted font-mono-numbers"><?= $i++ ?></td>
                                                    <td class="text-white fw-bold"><?= htmlspecialchars($song['title']) ?></td>
                                                    <td class="text-gold small font-mono-numbers"><?= htmlspecialchars($song['bpm'] ?? '-') ?></td>
                                                    <td class="text-secondary small font-mono-numbers"><?= htmlspecialchars($song['duration'] ?? '-') ?></td>
                                                    <td><span class="badge bg-secondary small"><?= htmlspecialchars($song['status']) ?></span></td>
                                                    <td class="text-end">
                                                        <button class="btn btn-sm btn-gold p-0 rounded-circle" style="width: 26px; height: 26px;" onclick="playAudio('<?= htmlspecialchars($song['audio_file'] ?? '') ?>', '<?= htmlspecialchars(addslashes($song['title'])) ?>', '<?= htmlspecialchars(addslashes($song['artist'])) ?>', '<?= htmlspecialchars($song['cover_file'] ?? '') ?>')">
                                                            <i class="fa-solid fa-play" style="font-size: 10px;"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            <?php endwhile; ?>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endwhile; ?>
        </div>
    </main>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
