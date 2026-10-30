<?php
$page_title = "Artistes & Collaborateurs";
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/sidebar.php';

// Filtre rôle
$filter_role = trim($_GET['role'] ?? '');
$sql = "SELECT * FROM collaborators WHERE 1=1";
$params = [];
$types = "";

if (!empty($filter_role)) {
    $sql .= " AND role = ?";
    $params[] = $filter_role;
    $types .= "s";
}
$sql .= " ORDER BY name ASC";

$stmt = $conn->prepare($sql);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$collabs = $stmt->get_result();
?>

<div class="flex-grow-1 d-flex flex-column" style="min-width: 0;">
    <?php require_once __DIR__ . '/../includes/navbar.php'; ?>

    <main class="p-4 flex-grow-1 overflow-auto" style="padding-bottom: 100px !important;">
        <div class="d-flex align-items-center justify-content-between mb-4">
            <div>
                <h3 class="font-cinzel text-white mb-1"><i class="fa-solid fa-users text-gold me-2"></i> Collaborateurs & Équipe Studio</h3>
                <p class="text-secondary small mb-0">Beatmakers, ingénieurs de son, studios d'enregistrement et featurings de MEYZI BRO.</p>
            </div>
            <button class="btn btn-gold btn-sm" data-bs-toggle="modal" data-bs-target="#newCollabModal">
                <i class="fa-solid fa-user-plus me-1"></i> Nouveau Collaborateur
            </button>
        </div>

        <div class="row g-4">
            <?php while($c = $collabs->fetch_assoc()): ?>
                <div class="col-md-6 col-xl-3">
                    <div class="card-vault p-4 h-100 d-flex flex-column">
                        <div class="d-flex align-items-center gap-3 mb-3">
                            <div class="rounded-circle d-flex align-items-center justify-content-center bg-black border border-dark text-gold" style="width: 48px; height: 48px; font-size: 1.2rem;">
                                <i class="fa-solid <?= $c['role'] == 'Beatmaker' ? 'fa-sliders' : ($c['role'] == 'Studio' ? 'fa-building' : 'fa-user') ?>"></i>
                            </div>
                            <div>
                                <h6 class="text-white mb-0 fw-bold"><?= htmlspecialchars($c['name']) ?></h6>
                                <span class="badge bg-gold text-black fw-bold" style="font-size: 0.7rem;"><?= htmlspecialchars($c['role']) ?></span>
                            </div>
                        </div>

                        <div class="small text-secondary mb-3 flex-grow-1">
                            <?php if (!empty($c['phone'])): ?>
                                <div class="mb-1"><i class="fa-solid fa-phone me-2 text-gold"></i> <?= htmlspecialchars($c['phone']) ?></div>
                            <?php endif; ?>
                            <?php if (!empty($c['email'])): ?>
                                <div class="mb-1"><i class="fa-solid fa-envelope me-2 text-gold"></i> <?= htmlspecialchars($c['email']) ?></div>
                            <?php endif; ?>
                            <?php if (!empty($c['social_media'])): ?>
                                <div class="mb-1"><i class="fa-solid fa-hashtag me-2 text-gold"></i> <?= htmlspecialchars($c['social_media']) ?></div>
                            <?php endif; ?>
                            <?php if (!empty($c['notes'])): ?>
                                <div class="mt-2 text-muted fst-italic"><?= htmlspecialchars($c['notes']) ?></div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            <?php endwhile; ?>
        </div>
    </main>
</div>

<!-- Modal Nouveau Collaborateur -->
<div class="modal fade" id="newCollabModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content bg-dark text-white border-secondary">
            <div class="modal-header border-secondary">
                <h5 class="modal-title font-cinzel text-gold">Ajouter un Collaborateur</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <form method="POST">
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label small text-secondary">Nom / Pseudo *</label>
                        <input type="text" name="name" class="form-control bg-black border-dark text-white" placeholder="ex: Scorpion Beats" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small text-secondary">Rôle *</label>
                        <select name="role" class="form-select bg-black border-dark text-white">
                            <option value="Beatmaker">Beatmaker</option>
                            <option value="Producteur">Producteur</option>
                            <option value="Ingénieur son">Ingénieur son</option>
                            <option value="Artiste">Artiste / Feat</option>
                            <option value="Compositeur">Compositeur</option>
                            <option value="Studio">Studio</option>
                            <option value="Autre">Autre</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small text-secondary">Téléphone</label>
                        <input type="text" name="phone" class="form-control bg-black border-dark text-white" placeholder="+33 6 ...">
                    </div>
                    <div class="mb-3">
                        <label class="form-label small text-secondary">Email</label>
                        <input type="email" name="email" class="form-control bg-black border-dark text-white">
                    </div>
                    <div class="mb-3">
                        <label class="form-label small text-secondary">Réseaux sociaux / Instagram</label>
                        <input type="text" name="social_media" class="form-control bg-black border-dark text-white" placeholder="@nom">
                    </div>
                </div>
                <div class="modal-footer border-secondary">
                    <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Annuler</button>
                    <button type="submit" class="btn btn-gold btn-sm">Enregistrer</button>
                </div>
            </form>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
