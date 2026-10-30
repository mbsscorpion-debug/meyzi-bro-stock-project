<header class="navbar navbar-expand border-bottom border-dark px-4 py-3" style="background-color: #101010;">
    <div class="container-fluid p-0">
        <div class="d-flex align-items-center gap-3">
            <span class="badge border border-warning text-gold bg-transparent py-1 px-2" style="font-size: 0.75rem;">
                <i class="fa-solid fa-shield-halved me-1"></i> COFFRE-FORT ACTIF
            </span>
            <span class="text-secondary small d-none d-md-inline">Base MySQLi locale XAMPP</span>
        </div>

        <div class="d-flex align-items-center gap-3 ms-auto">
            <!-- Global quick search -->
            <form action="../songs/index.php" method="GET" class="d-none d-lg-flex position-relative">
                <input type="text" name="search" class="form-control form-control-sm bg-black border-dark text-light ps-4" placeholder="Rechercher song, projet, instru..." style="width: 260px;">
                <i class="fa-solid fa-magnifying-glass position-absolute top-50 translate-middle-y text-muted small" style="left: 10px;"></i>
            </form>

            <a href="../songs/add.php" class="btn btn-sm btn-gold d-flex align-items-center gap-2">
                <i class="fa-solid fa-plus"></i> <span class="d-none d-sm-inline">Nouveau Song</span>
            </a>
        </div>
    </div>
</header>
