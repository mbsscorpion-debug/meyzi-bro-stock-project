<?php
/**
 * MEYZI BRO STOCK PROJECT
 * Configuration de la connexion MySQLi
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
?>
