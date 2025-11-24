CREATE DATABASE IF NOT EXISTS taskpro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'taskpro_user'@'localhost' IDENTIFIED BY 'TaskPro@2025';
GRANT ALL PRIVILEGES ON taskpro_db.* TO 'taskpro_user'@'localhost';
GRANT PROCESS ON *.* TO 'taskpro_user'@'localhost';
FLUSH PRIVILEGES;