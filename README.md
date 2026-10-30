# 🦂 MEYZI BRO STOCK PROJECT

Plateforme web moderne de stockage, gestion et conservation de tous les projets musicaux, sons, albums, EP, mixtapes, instrumentales, versions audio et stems de l'artiste **MEYZI BRO OFFICIEL**.

---

## 🎨 IDENTITÉ VISUELLE ET DIRECTION ARTISTIQUE

* **Nom :** MEYZI BRO STOCK PROJECT
* **Artiste :** MEYZI BRO OFFICIEL
* **Couleurs :** Noir `#0b0b0b`, Or `#d4af37`, Gris foncé `#171717`, Blanc `#ffffff`
* **Emblème :** Scorpion & Studio Vault
* **Ambiance :** Studio d'enregistrement rap professionnel, mastering, drill & dark trap

---

## 🛠️ TECHNOLOGIES UTILISÉES

* **Frontend :** HTML5, CSS3, JavaScript ES6, Bootstrap 5.3, Font Awesome 6
* **Backend :** PHP 8+
* **Base de données :** MySQL / MariaDB (connexion exclusive via **MySQLi avec requêtes préparées `prepare()` et `bind_param()`**)
* **Lecteur audio :** Lecteur universel HTML5 / Web Audio avec formats acceptés MP3, WAV, M4A, FLAC
* **Environnement local :** XAMPP (`C:\xampp\htdocs\meyzi-bro-stock`)

---

## 📋 GUIDE D'INSTALLATION COMPLÈTE SUR XAMPP (ÉTAPES EXACTES)

### Étape 1 : Installer XAMPP
Téléchargez et installez **XAMPP pour Windows** (version avec PHP 8.1 ou supérieure) depuis [apachefriends.org](https://www.apachefriends.org/).

### Étape 2 : Démarrer Apache
Lancez le **XAMPP Control Panel** en mode administrateur et cliquez sur le bouton **Start** en face du module **Apache**.

### Étape 3 : Démarrer MySQL
Dans le XAMPP Control Panel, cliquez sur le bouton **Start** en face du module **MySQL**. Les deux indicateurs doivent passer au vert.

### Étape 4 : Créer la base de données `meyzi_bro_stock`
1. Ouvrez votre navigateur et accédez à : `http://localhost/phpmyadmin/`
2. Cliquez sur l'onglet **Bases de données** (ou *New* dans la barre latérale).
3. Saisissez le nom exact de la base : `meyzi_bro_stock`
4. Choisissez l'interclassement : `utf8mb4_unicode_ci` puis cliquez sur **Créer**.

### Étape 5 : Importer `database/meyzi_bro_stock.sql`
1. Cliquez sur la base `meyzi_bro_stock` tout juste créée.
2. Allez dans l'onglet **Importer**.
3. Cliquez sur **Choisir un fichier** et sélectionnez le fichier :
   `meyzi-bro-stock/database/meyzi_bro_stock.sql`
4. Cliquez sur le bouton **Importer** (ou *Exécuter*) en bas de page. Toutes les tables (`users`, `songs`, `projects`, `albums`, `eps`, `mixtapes`, `instrumentals`, `collaborators`, `files`) et les données de test s'installeront automatiquement.

### Étape 6 : Copier le projet dans `htdocs`
Copiez l'intégralité du dossier du projet dans le répertoire `htdocs` de votre installation XAMPP :
```text
C:\xampp\htdocs\meyzi-bro-stock
```
Assurez-vous que les répertoires d'uploads existent et disposent des droits d'écriture :
* `uploads/audio/`
* `uploads/covers/`
* `uploads/instrumentals/`
* `uploads/acapella/`
* `uploads/stems/`
* `uploads/videos/`
* `uploads/documents/`

### Étape 7 : Vérifier `config/database.php`
Ouvrez le fichier `config/database.php` et vérifiez que les paramètres correspondent bien à votre XAMPP par défaut :
```php
<?php
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
```

### Étape 8 : Ouvrir l'application dans le navigateur
Rendez-vous à l'adresse suivante :
```text
http://localhost/meyzi-bro-stock/auth/login.php
```
ou directement :
```text
http://localhost/meyzi-bro-stock/dashboard.php
```

#### Identifiants de connexion par défaut :
* **Nom d'utilisateur :** `meyzibro` (ou email `mbsscorpion@gmail.com`)
* **Mot de passe :** `admin123`

---

## 🔒 SÉCURITÉ INTÉGRÉE
* Hachage de mot de passe par `password_hash()` avec algorithme BCRYPT
* Validation avec `password_verify()`
* Requêtes préparées MySQLi systématiques contre les injections SQL (`bind_param`)
* Protection XSS par échappement `htmlspecialchars()`
* Validation des extensions et des types MIME pour les fichiers audio et les images
* Sessions PHP avec redirection sécurisée si l'utilisateur n'est pas authentifié.
