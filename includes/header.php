<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Vérification de la session utilisateur
if (!isset($_SESSION['user_id']) && basename($_SERVER['PHP_SELF']) !== 'login.php' && basename($_SERVER['PHP_SELF']) !== 'register.php') {
    header("Location: ../auth/login.php");
    exit();
}

$page_title = isset($page_title) ? $page_title : "MEYZI BRO STOCK PROJECT";
?>
<!DOCTYPE html>
<html lang="fr" data-bs-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($page_title) ?> — MEYZI BRO OFFICIEL</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome 6 Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <!-- Google Fonts Cinzel & Plus Jakarta Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --bs-dark-bg: #0b0b0b;
            --gold-primary: #d4af37;
            --gold-light: #f7e08c;
            --gold-dark: #aa8210;
            --surface-card: #141414;
            --surface-border: #222222;
        }
        body {
            background-color: #0b0b0b;
            color: #ececec;
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            min-height: 100vh;
        }
        h1, h2, h3, .font-cinzel {
            font-family: 'Cinzel', serif;
            letter-spacing: 0.04em;
        }
        .text-gold {
            color: var(--gold-primary) !important;
        }
        .bg-gold {
            background-color: var(--gold-primary) !important;
            color: #000 !important;
        }
        .btn-gold {
            background: linear-gradient(135deg, #d4af37, #b8860b);
            color: #0b0b0b;
            font-weight: 600;
            border: none;
            transition: all 0.2s ease;
        }
        .btn-gold:hover {
            background: linear-gradient(135deg, #f7e08c, #d4af37);
            color: #000;
            box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
            transform: translateY(-1px);
        }
        .btn-outline-gold {
            border: 1px solid var(--gold-primary);
            color: var(--gold-primary);
        }
        .btn-outline-gold:hover {
            background-color: var(--gold-primary);
            color: #0b0b0b;
        }
        .card-vault {
            background-color: #141414;
            border: 1px solid #222222;
            border-radius: 12px;
            transition: border-color 0.2s ease;
        }
        .card-vault:hover {
            border-color: rgba(212, 175, 55, 0.35);
        }
        .sidebar {
            width: 270px;
            background-color: #0e0e0e;
            border-right: 1px solid #1f1f1f;
            min-height: 100vh;
        }
        .sidebar-link {
            color: #a3a3a3;
            padding: 10px 16px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
            font-size: 0.92rem;
            transition: all 0.15s ease;
        }
        .sidebar-link:hover, .sidebar-link.active {
            color: #ffffff;
            background-color: #1a1a1a;
            border-left: 3px solid var(--gold-primary);
        }
        .sidebar-link i {
            width: 20px;
            text-align: center;
            color: var(--gold-primary);
        }
        .table-dark-custom {
            --bs-table-bg: #141414;
            --bs-table-border-color: #222222;
            color: #e5e5e5;
        }
        .audio-player-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(14, 14, 14, 0.95);
            backdrop-filter: blur(12px);
            border-top: 1px solid rgba(212, 175, 55, 0.25);
            z-index: 1050;
            padding: 12px 24px;
        }
    </style>
</head>
<body>
<div class="d-flex">
