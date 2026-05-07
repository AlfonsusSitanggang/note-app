CREATE DATABASE IF NOT EXISTS notes_123230100;
USE notes_nim;

DROP TABLE IF EXISTS `notes_db`;
CREATE TABLE `notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `judul` varchar(255) NOT NULL,
  `isi` text NOT NULL,
  `tanggal_dibuat` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- data contoh
LOCK TABLES `notes` WRITE;
INSERT INTO `notes` VALUES 
(1,'Catatan Pertama','Ini adalah catatan pertama saya','2024-01-15 10:00:00'),
(2,'Belajar Node.js','Hari ini saya belajar Express.js','2024-01-15 11:30:00');
UNLOCK TABLES;