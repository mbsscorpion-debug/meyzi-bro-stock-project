<?php
$page_title = "Mes Instrumentales";
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';

$instru_res = $conn->query("SELECT * FROM instrumentals ORDER BY id DESC");
?>

<div class="flex-grow-1 d-flex flex-column" style="min-width: 0;">
    <?php require_once __DIR__ . '/../includes/navbar.php'; ?>

    <main class="p-4 flex-grow-1 overflow-auto" style="padding-bottom: 100px !important;">
        <div class="d-flex align-items-center justify-content-between mb-4">
            <div>
                <h3 class="font-cinzel text-white mb-1"><i class="fa-solid fa-sliders text-gold me-2"></i> Mes Instrumentales & Beats</h3>
                <p class="text-secondary small mb-0">Catalogue de prods, beats UK Drill / Dark Trap, stems séparés et licences.</p>
            </div>
            <button class="btn btn-gold btn-sm" data-bs-toggle="modal" data-bs-target="#newInstruModal">
                <i class="fa-solid fa-plus me-1"></i> Ajouter une Instru
            </button>
        </div>

        <div class="row g-4">
            <?php while($ins = $instru_res->fetch_assoc()): ?>
                <div class="col-md-6 col-xl-4">
                    <div class="card-vault p-4 h-100 d-flex flex-column">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <span class="badge bg-black border border-warning text-gold font-mono-numbers"><?= htmlspecialchars($ins['bpm'] ?? '-') ?> BPM</span>
                            <span class="badge bg-secondary"><?= htmlspecialchars($ins['status']) ?></span>
                        </div>

                        <h5 class="text-white fw-bold mb-1"><?= htmlspecialchars($ins['title']) ?></h5>
                        <div class="text-gold small mb-2"><i class="fa-solid fa-headphones me-1"></i> Prod. <?= htmlspecialchars($ins['producer']) ?></div>

                        <div class="row g-2 small text-secondary mb-3 py-2 border-top border-bottom border-dark">
                            <div class="col-6">Genre : <span class="text-light"><?= htmlspecialchars($ins['genre']) ?></span></div>
                            <div class="col-6">Tonalité : <span class="text-light font-mono-numbers"><?= htmlspecialchars($ins['key_signature'] ?? '-') ?></span></div>
                            <div class="col-6">Tarif : <span class="text-gold font-mono-numbers"><?= number_format($ins['price'], 2) ?> €</span></div>
                            <div class="col-6">Stems : <span class="text-light"><?= !empty($ins['stems_file']) ? 'Inclus' : 'Non' ?></span></div>
                        </div>

                        <?php if (!empty($ins['notes'])): ?>
                            <p class="text-muted small flex-grow-1"><?= htmlspecialchars($ins['notes']) ?></p>
                        <?php endif; ?>

                        <div class="d-flex gap-2 mt-auto pt-2">
                            <button class="btn btn-gold btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2" onclick="playAudio('<?= htmlspecialchars($ins['audio_file'] ?? '') ?>', '<?= htmlspecialchars(addslashes($ins['title'])) ?> (Instru)', 'Prod. <?= htmlspecialchars(addslashes($ins['producer'])) ?>', '../assets/images/cover_placeholder.jpg')">
                                <i class="fa-solid fa-play"></i> Écouter
                            </button>
                            <?php if (!empty($ins['audio_file'])): ?>
                                <a href="../<?= htmlspecialchars($ins['audio_file']) ?>" download class="btn btn-outline-secondary btn-sm" title="Télécharger audio"><i class="fa-solid fa-download"></i></a>
                            <?php endif; ?>
                            <?php if (!empty($ins['stems_file'])): ?>
                                <a href="../<?= htmlspecialchars($ins['stems_file']) ?>" download class="btn btn-outline-warning btn-sm" title="Télécharger stems ZIP"><i class="fa-solid fa-file-zipper"></i></a>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            <?php endwhile; ?>
        </div>
    </main>
</div>

<!-- Modal Ajout Instru -->
<div class="modal fade" id="newInstruModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content bg-dark text-white border-secondary">
            <div class="modal-header border-secondary">
                <h5 class="modal-title font-cinzel text-gold">Ajouter une Instrumentale</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <form method="POST" enctype="multipart/form-data">
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label small text-secondary">Nom / Titre du Beat *</label>
                        <input type="text" name="title" class="form-control bg-black border-dark text-white" placeholder="ex: Bête Noire 140" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small text-secondary">Producteur / Beatmaker *</label>
                        <input type="text" name="producer" class="form-control bg-black border-dark text-white" value="Scorpion Beats" required>
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-6">
                            <label class="form-label small text-secondary">BPM</label>
                            <input type="number" name="bpm" class="form-control bg-black border-dark text-white font-mono-numbers" value="140">
                        </div>
                        <div class="col-6">
                            <label class="form-label small text-secondary">Tonalité</label>
                            <input type="text" name="key_signature" class="form-control bg-black border-dark text-white" value="D Minor">
                        </div>
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-6">
                            <label class="form-label small text-secondary">Genre</label>
                            <input type="text" name="genre" class="form-control bg-black border-dark text-white" value="UK Drill">
                        </div>
                        <div class="col-6">
                            <label class="form-label small text-secondary">Statut</label>
                            <select name="status" class="form-select bg-black border-dark text-white">
                                <option value="Disponible">Disponible</option>
                                <option value="Exclusif">Exclusif</option>
                                <option value="Vendu">Vendu</option>
                                <option value="En production">En production</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-secondary">
                    <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Annuler</button>
                    <button type="submit" class="btn btn-gold btn-sm">Enregistrer l'instru</button>
                </div>
            </form>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
