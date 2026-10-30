<?php
session_start();
require_once __DIR__ . '/../config/database.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $identifier = trim($_POST['identifier'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (!empty($identifier) && !empty($password)) {
        // Préparation MySQLi sécurisée contre l'injection SQL
        $stmt = $conn->prepare("SELECT id, username, email, password, role FROM users WHERE username = ? OR email = ? LIMIT 1");
        $stmt->bind_param("ss", $identifier, $identifier);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($user = $result->fetch_assoc()) {
            if (password_verify($password, $user['password'])) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['role'] = $user['role'];
                header("Location: ../dashboard.php");
                exit();
            } else {
                $error = "Mot de passe incorrect.";
            }
        } else {
            $error = "Identifiant ou email introuvable.";
        }
        $stmt->close();
    } else {
        $error = "Veuillez remplir tous les champs.";
    }
}
?>
<!DOCTYPE html>
<html lang="fr" data-bs-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion — MEYZI BRO STOCK PROJECT</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            background-color: #0b0b0b;
            color: #f5f5f5;
            font-family: 'Plus Jakarta Sans', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .font-cinzel { font-family: 'Cinzel', serif; }
        .text-gold { color: #d4af37; }
        .btn-gold {
            background: linear-gradient(135deg, #d4af37, #b8860b);
            color: #000;
            font-weight: 700;
            border: none;
        }
        .btn-gold:hover {
            background: linear-gradient(135deg, #f7e08c, #d4af37);
        }
        .login-card {
            background-color: #121212;
            border: 1px solid #242424;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.8);
            width: 100%;
            max-width: 440px;
        }
    </style>
</head>
<body>
    <div class="login-card p-4 p-sm-5">
        <div class="text-center mb-4">
            <div class="d-inline-flex align-items-center justify-content-center p-3 rounded-circle mb-3 border border-warning" style="background: #181818; width: 64px; height: 64px;">
                <span style="font-size: 28px;">🦂</span>
            </div>
            <h3 class="font-cinzel text-white fw-bold mb-1">MEYZI BRO</h3>
            <p class="text-gold small tracking-widest text-uppercase mb-0" style="letter-spacing: 0.15em;">STOCK PROJECT</p>
            <small class="text-muted">Coffre-fort musical & Studio Vault</small>
        </div>

        <?php if (!empty($error)): ?>
            <div class="alert alert-danger py-2 small" role="alert">
                <i class="fa-solid fa-triangle-exclamation me-1"></i> <?= htmlspecialchars($error) ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="login.php">
            <div class="mb-3">
                <label class="form-label small text-secondary">Nom d'utilisateur ou Email</label>
                <div class="input-group">
                    <span class="input-group-text bg-black border-dark text-gold"><i class="fa-solid fa-user"></i></span>
                    <input type="text" name="identifier" class="form-control bg-black border-dark text-light" placeholder="meyzibro" required autofocus>
                </div>
            </div>

            <div class="mb-4">
                <label class="form-label small text-secondary">Mot de passe</label>
                <div class="input-group">
                    <span class="input-group-text bg-black border-dark text-gold"><i class="fa-solid fa-lock"></i></span>
                    <input type="password" name="password" class="form-control bg-black border-dark text-light" placeholder="••••••••" required>
                </div>
            </div>

            <button type="submit" class="btn btn-gold w-100 py-2 mb-3">
                <i class="fa-solid fa-key me-2"></i> Accéder au Studio
            </button>

            <div class="text-center">
                <small class="text-muted">Par défaut : meyzibro / admin123</small>
            </div>
        </form>
    </div>
</body>
</html>
