<?php
$current_page = basename($_SERVER['PHP_SELF']);
$current_dir = basename(dirname($_SERVER['PHP_SELF']));
?>
<aside class="sidebar p-3 d-flex flex-column shrink-0">
    <!-- Brand / Artist Profile -->
    <div class="px-2 py-3 mb-4 border-bottom border-dark border-opacity-50">
        <div class="d-flex align-items-center gap-3">
            <div class="rounded-circle d-flex align-items-center justify-content-center" style="width: 44px; height: 44px; background: #1c1c1c; border: 1px solid #d4af37;">
                <i class="fa-solid fa-virus-covid fa-rotate-90 text-gold fs-5" title="Scorpion Emblem">🦂</i>
            </div>
            <div>
                <h6 class="mb-0 text-white font-cinzel fw-bold tracking-wide">MEYZI BRO</h6>
                <small class="text-gold" style="font-size: 0.72rem; letter-spacing: 0.1em;">STOCK PROJECT</small>
            </div>
        </div>
        <div class="mt-2 pt-2 border-top border-secondary border-opacity-10 text-muted small">
            <i class="fa-solid fa-microphone-lines text-gold me-1"></i> Artiste : <strong class="text-light">MEYZI BRO OFFICIEL</strong>
        </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="nav flex-column gap-1 flex-grow-1">
        <a href="../dashboard.php" class="sidebar-link <?= ($current_page == 'dashboard.php') ? 'active' : '' ?>">
            <i class="fa-solid fa-chart-pie"></i> <span>Dashboard</span>
        </a>
        <a href="../songs/index.php" class="sidebar-link <?= ($current_dir == 'songs') ? 'active' : '' ?>">
            <i class="fa-solid fa-music"></i> <span>Mes Songs</span>
        </a>
        <a href="../albums/index.php" class="sidebar-link <?= ($current_dir == 'albums') ? 'active' : '' ?>">
            <i class="fa-solid fa-compact-disc"></i> <span>Albums</span>
        </a>
        <a href="../eps/index.php" class="sidebar-link <?= ($current_dir == 'eps') ? 'active' : '' ?>">
            <i class="fa-solid fa-record-vinyl"></i> <span>EP</span>
        </a>
        <a href="../mixtapes/index.php" class="sidebar-link <?= ($current_dir == 'mixtapes') ? 'active' : '' ?>">
            <i class="fa-solid fa-tape"></i> <span>Mixtapes</span>
        </a>
        <a href="../songs/index.php?type=Single" class="sidebar-link">
            <i class="fa-solid fa-bolt"></i> <span>Singles</span>
        </a>
        <a href="../instrumentals/index.php" class="sidebar-link <?= ($current_dir == 'instrumentals') ? 'active' : '' ?>">
            <i class="fa-solid fa-sliders"></i> <span>Instrumentales</span>
        </a>
        <a href="../projects/index.php" class="sidebar-link <?= ($current_dir == 'projects') ? 'active' : '' ?>">
            <i class="fa-solid fa-folder-tree"></i> <span>Projets</span>
        </a>
        <a href="../files/index.php" class="sidebar-link <?= ($current_dir == 'files') ? 'active' : '' ?>">
            <i class="fa-solid fa-box-archive"></i> <span>Fichiers</span>
        </a>
        <a href="../collaborators/index.php" class="sidebar-link <?= ($current_dir == 'collaborators') ? 'active' : '' ?>">
            <i class="fa-solid fa-users"></i> <span>Artistes / Collaborateurs</span>
        </a>
        <a href="../collaborators/index.php?filter=Producer" class="sidebar-link">
            <i class="fa-solid fa-headphones"></i> <span>Producteurs</span>
        </a>
        <a href="../songs/index.php?status=Archivé" class="sidebar-link">
            <i class="fa-solid fa-archive"></i> <span>Archives</span>
        </a>
    </nav>

    <!-- Bottom User Bar -->
    <div class="pt-3 mt-auto border-top border-dark">
        <div class="d-flex align-items-center justify-content-between px-2">
            <div>
                <small class="text-white fw-bold d-block"><?= htmlspecialchars($_SESSION['username'] ?? 'Meyzi Bro') ?></small>
                <small class="text-muted" style="font-size: 0.75rem;">Propriétaire Studio</small>
            </div>
            <a href="../auth/logout.php" class="btn btn-sm btn-outline-danger" title="Déconnexion">
                <i class="fa-solid fa-right-from-bracket"></i>
            </a>
        </div>
    </div>
</aside>
