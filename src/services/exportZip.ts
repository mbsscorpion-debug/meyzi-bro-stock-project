import JSZip from 'jszip';

export async function downloadXamppZip() {
  const zip = new JSZip();

  // 1. database.php
  zip.file(
    'meyzi-bro-stock/config/database.php',
    `<?php
/**
 * MEYZI BRO STOCK PROJECT
 * Configuration MySQLi XAMPP
 */
$host = "localhost";
$user = "root";
$password = "";
$database = "meyzi_bro_stock";

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die("Erreur de connexion : " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");
?>`
  );

  // 2. Database SQL
  const sqlResp = await fetch('/database/meyzi_bro_stock.sql').then(r => r.text()).catch(() => '');
  zip.file('meyzi-bro-stock/database/meyzi_bro_stock.sql', sqlResp || '-- Voir meyzi_bro_stock.sql');

  // 3. README.md
  const readmeResp = await fetch('/README.md').then(r => r.text()).catch(() => '');
  zip.file('meyzi-bro-stock/README.md', readmeResp || '# MEYZI BRO STOCK PROJECT');

  // 4. Core PHP pages
  const filesToFetch = [
    'includes/header.php',
    'includes/sidebar.php',
    'includes/navbar.php',
    'includes/footer.php',
    'auth/login.php',
    'auth/logout.php',
    'dashboard.php',
    'songs/index.php',
    'songs/add.php',
    'songs/edit.php',
    'songs/view.php',
    'songs/delete.php',
    'projects/index.php',
    'albums/index.php',
    'eps/index.php',
    'mixtapes/index.php',
    'instrumentals/index.php',
    'collaborators/index.php',
    'files/index.php'
  ];

  for (const file of filesToFetch) {
    try {
      const resp = await fetch(`/${file}`);
      if (resp.ok) {
        const text = await resp.text();
        zip.file(`meyzi-bro-stock/${file}`, text);
      }
    } catch {
      // Continue
    }
  }

  // Create empty upload directory indicators
  zip.file('meyzi-bro-stock/uploads/audio/.gitkeep', '');
  zip.file('meyzi-bro-stock/uploads/covers/.gitkeep', '');
  zip.file('meyzi-bro-stock/uploads/instrumentals/.gitkeep', '');
  zip.file('meyzi-bro-stock/uploads/acapella/.gitkeep', '');
  zip.file('meyzi-bro-stock/uploads/stems/.gitkeep', '');
  zip.file('meyzi-bro-stock/uploads/videos/.gitkeep', '');
  zip.file('meyzi-bro-stock/uploads/documents/.gitkeep', '');

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'meyzi-bro-stock-xampp.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
