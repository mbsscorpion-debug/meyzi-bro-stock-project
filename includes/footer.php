</div><!-- End d-flex wrapper -->

<!-- Global Audio Player Floating Bar -->
<div id="globalAudioPlayer" class="audio-player-bar d-none">
    <div class="container-fluid d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-3" style="min-width: 240px; max-width: 320px;">
            <img id="playerCover" src="" alt="Cover" class="rounded border border-dark" style="width: 48px; height: 48px; object-fit: cover;">
            <div class="overflow-hidden">
                <div id="playerTitle" class="text-white fw-bold text-truncate" style="font-size: 0.95rem;">Titre</div>
                <div id="playerArtist" class="text-gold small text-truncate">Artiste</div>
            </div>
        </div>

        <!-- Center Controls -->
        <div class="d-flex flex-column align-items-center flex-grow-1 mx-4" style="max-width: 600px;">
            <div class="d-flex align-items-center gap-3 mb-1">
                <button type="button" class="btn btn-sm text-secondary" id="playerRewind"><i class="fa-solid fa-backward-step"></i></button>
                <button type="button" class="btn btn-gold rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;" id="playerPlayBtn">
                    <i class="fa-solid fa-play" id="playerPlayIcon"></i>
                </button>
                <button type="button" class="btn btn-sm text-secondary" id="playerForward"><i class="fa-solid fa-forward-step"></i></button>
            </div>
            <div class="d-flex align-items-center gap-2 w-100">
                <span id="playerCurrentTime" class="text-muted small" style="font-size: 0.75rem; width: 36px; text-align: right;">0:00</span>
                <input type="range" class="form-range flex-grow-1" id="playerProgress" min="0" max="100" value="0" style="accent-color: #d4af37;">
                <span id="playerDuration" class="text-muted small" style="font-size: 0.75rem; width: 36px;">0:00</span>
            </div>
        </div>

        <!-- Right Side: Volume & Actions -->
        <div class="d-flex align-items-center gap-3">
            <div class="d-none d-md-flex align-items-center gap-2">
                <i class="fa-solid fa-volume-high text-muted small"></i>
                <input type="range" class="form-range" id="playerVolume" min="0" max="1" step="0.05" value="0.8" style="width: 80px; accent-color: #d4af37;">
            </div>
            <a id="playerDownloadBtn" href="#" download class="btn btn-sm btn-outline-secondary" title="Télécharger le fichier audio">
                <i class="fa-solid fa-download"></i>
            </a>
            <button type="button" class="btn-close btn-close-white btn-sm" id="playerCloseBtn"></button>
        </div>
    </div>
    <audio id="htmlAudioElement" class="d-none"></audio>
</div>

<!-- Bootstrap 5 JS Bundle -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

<!-- Audio Player Script -->
<script>
const audio = document.getElementById('htmlAudioElement');
const playerBar = document.getElementById('globalAudioPlayer');
const playBtn = document.getElementById('playerPlayBtn');
const playIcon = document.getElementById('playerPlayIcon');
const progressBar = document.getElementById('playerProgress');
const currentTimeEl = document.getElementById('playerCurrentTime');
const durationEl = document.getElementById('playerDuration');
const volumeSlider = document.getElementById('playerVolume');
const downloadBtn = document.getElementById('playerDownloadBtn');
const closeBtn = document.getElementById('playerCloseBtn');

function playAudio(url, title, artist, cover) {
    if (!url) {
        alert("Fichier audio non disponible.");
        return;
    }
    audio.src = url;
    document.getElementById('playerTitle').textContent = title || 'Titre inconnu';
    document.getElementById('playerArtist').textContent = artist || 'MEYZI BRO OFFICIEL';
    document.getElementById('playerCover').src = cover || '../assets/images/cover_placeholder.jpg';
    downloadBtn.href = url;
    playerBar.classList.remove('d-none');
    audio.play();
    playIcon.className = 'fa-solid fa-pause';
}

if (playBtn) {
    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playIcon.className = 'fa-solid fa-pause';
        } else {
            audio.pause();
            playIcon.className = 'fa-solid fa-play';
        }
    });
}

if (audio) {
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            progressBar.value = (audio.currentTime / audio.duration) * 100;
            currentTimeEl.textContent = formatTime(audio.currentTime);
            durationEl.textContent = formatTime(audio.duration);
        }
    });
    audio.addEventListener('ended', () => {
        playIcon.className = 'fa-solid fa-play';
    });
}

if (progressBar) {
    progressBar.addEventListener('input', () => {
        if (audio.duration) {
            audio.currentTime = (progressBar.value / 100) * audio.duration;
        }
    });
}

if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
    });
}

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        audio.pause();
        playerBar.classList.add('d-none');
    });
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}
</script>
</body>
</html>
