-- ==============================================================
-- DATABASE: meyzi_bro_stock
-- ARTISTE : MEYZI BRO OFFICIEL
-- APPLICATION : MEYZI BRO STOCK PROJECT
-- BASE VIERGE (SANS DÉMONSTRATIONS NI DONNÉES FACTICES)
-- ==============================================================

CREATE DATABASE IF NOT EXISTS `meyzi_bro_stock` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `meyzi_bro_stock`;

-- --------------------------------------------------------------
-- 1. Table users
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) DEFAULT 'admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Compte administrateur principal : meyzibro / admin123
INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`) VALUES
(1, 'meyzibro', 'mbsscorpion@gmail.com', '$2y$10$wO3t8c6Yg14xHh3yKjNlzeS5t5iJ9s0j3B6wM9yY6uK.gWqL4M6uq', 'admin')
ON DUPLICATE KEY UPDATE `username`=`username`;

-- --------------------------------------------------------------
-- 2. Table projects
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `type` ENUM('Album', 'EP', 'Mixtape', 'Single', 'Autre') NOT NULL DEFAULT 'Album',
  `description` TEXT NULL,
  `cover` VARCHAR(255) NULL,
  `start_date` DATE NULL,
  `release_date` DATE NULL,
  `status` ENUM('Idée', 'En préparation', 'Enregistrement', 'Mixage', 'Mastering', 'Terminé', 'Publié', 'Archivé') DEFAULT 'En préparation',
  `progress` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------
-- 3. Table albums
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `albums` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `cover` VARCHAR(255) NULL,
  `year` INT DEFAULT 2026,
  `release_date` DATE NULL,
  `status` ENUM('En préparation', 'Mixage', 'Mastering', 'Terminé', 'Publié') DEFAULT 'En préparation',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------
-- 4. Table eps
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `eps` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `cover` VARCHAR(255) NULL,
  `year` INT DEFAULT 2026,
  `release_date` DATE NULL,
  `status` ENUM('En préparation', 'Mixage', 'Mastering', 'Terminé', 'Publié') DEFAULT 'En préparation',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------
-- 5. Table mixtapes
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mixtapes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `cover` VARCHAR(255) NULL,
  `year` INT DEFAULT 2026,
  `release_date` DATE NULL,
  `status` ENUM('En préparation', 'Mixage', 'Mastering', 'Terminé', 'Publié') DEFAULT 'En préparation',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------
-- 6. Table songs
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `songs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(191) NOT NULL,
  `type` ENUM('Single', 'Album', 'EP', 'Mixtape', 'Freestyle', 'Instrumental', 'Autre') NOT NULL DEFAULT 'Single',
  `project_id` INT NULL,
  `artist` VARCHAR(150) NOT NULL DEFAULT 'MEYZI BRO OFFICIEL',
  `featuring` VARCHAR(200) NULL,
  `producer` VARCHAR(150) NULL,
  `composer` VARCHAR(150) NULL,
  `studio` VARCHAR(150) NULL,
  `genre` VARCHAR(100) DEFAULT 'Rap / Drill / Trap',
  `year` INT DEFAULT 2026,
  `bpm` INT NULL,
  `key_signature` VARCHAR(20) NULL,
  `duration` VARCHAR(20) DEFAULT '03:15',
  `status` ENUM('Brouillon', 'Enregistrement', 'Mixage', 'Mastering', 'Terminé', 'Publié', 'Archivé') DEFAULT 'Enregistrement',
  `description` TEXT NULL,
  `lyrics` LONGTEXT NULL,
  `notes` TEXT NULL,
  `audio_file` VARCHAR(255) NULL,
  `cover_file` VARCHAR(255) NULL,
  `instrumental_file` VARCHAR(255) NULL,
  `acapella_file` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (`project_id`),
  INDEX (`status`),
  INDEX (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------
-- 7. Table instrumentals
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `instrumentals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `producer` VARCHAR(150) NOT NULL,
  `bpm` INT NULL,
  `key_signature` VARCHAR(20) NULL,
  `genre` VARCHAR(100) DEFAULT 'Drill',
  `price` DECIMAL(10, 2) DEFAULT 0.00,
  `status` ENUM('Disponible', 'Exclusif', 'Vendu', 'En production') DEFAULT 'Disponible',
  `audio_file` VARCHAR(255) NULL,
  `stems_file` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------
-- 8. Table collaborators
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `collaborators` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `role` ENUM('Artiste', 'Beatmaker', 'Producteur', 'Ingénieur son', 'Compositeur', 'Studio', 'Autre') NOT NULL DEFAULT 'Beatmaker',
  `phone` VARCHAR(50) NULL,
  `email` VARCHAR(150) NULL,
  `social_media` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------
-- 9. Table song_collaborators
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `song_collaborators` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `song_id` INT NOT NULL,
  `collaborator_id` INT NOT NULL,
  `role` VARCHAR(100) NULL,
  FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`collaborator_id`) REFERENCES `collaborators`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------------
-- 10. Table files
-- --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `files` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(50) NOT NULL,
  `file_size` BIGINT DEFAULT 0,
  `category` ENUM('Audio', 'Covers', 'Paroles', 'Instrumentales', 'Acapella', 'Stems', 'Clips', 'Documents', 'Autres') NOT NULL,
  `song_id` INT NULL,
  `project_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`category`),
  INDEX (`song_id`),
  INDEX (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
