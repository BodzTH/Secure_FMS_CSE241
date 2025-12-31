-- Security Information System Database Schema
-- Created by: Person 1 (User Authentication)
-- Date: December 31, 2025

-- Create Database
CREATE DATABASE IF NOT EXISTS security_project;
USE security_project;

-- Person 1: Users Table (Authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    login_attempts INT DEFAULT 0,
    last_login_attempt TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_username (username)
);

-- Person 2: Files Table (File Upload & Storage)
-- Uncomment when implementing Person 2 tasks
/*
CREATE TABLE IF NOT EXISTS files (
    file_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    encrypted_path VARCHAR(500) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner (owner_id),
    INDEX idx_hash (file_hash)
);
*/

-- Person 3: File Access Logs (Optional - for tracking downloads)
-- Uncomment when implementing Person 3 tasks
/*
CREATE TABLE IF NOT EXISTS file_access_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    file_id INT NOT NULL,
    user_id INT NOT NULL,
    access_type ENUM('download', 'view', 'delete') NOT NULL,
    access_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    FOREIGN KEY (file_id) REFERENCES files(file_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_file_access (file_id, access_time),
    INDEX idx_user_access (user_id, access_time)
);
*/
