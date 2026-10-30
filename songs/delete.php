<?php
session_start();
require_once __DIR__ . '/../config/database.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id > 0) {
    $stmt = $conn->prepare("DELETE FROM songs WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->close();
}

header("Location: index.php");
exit();
