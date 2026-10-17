CREATE DATABASE IF NOT EXISTS skylog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE skylog;

DROP TABLE IF EXISTS airlines;
CREATE TABLE airlines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  iata_code CHAR(2) NOT NULL UNIQUE,
  icao_code CHAR(3) NOT NULL UNIQUE,
  country VARCHAR(60) NOT NULL,
  hub_airport CHAR(3) NOT NULL,
  hub_city VARCHAR(60) NOT NULL,
  founded_year SMALLINT NOT NULL,
  status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  website VARCHAR(200) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO airlines (name, iata_code, icao_code, country, hub_airport, hub_city, founded_year, status, website) VALUES
('Philippine Airlines', 'PR', 'PAL', 'Philippines', 'MNL', 'Manila', 1941, 'Active', 'https://www.philippineairlines.com'),
('Cebu Pacific', '5J', 'CEB', 'Philippines', 'MNL', 'Manila', 1988, 'Active', 'https://www.cebupacificair.com'),
('AirAsia Philippines', 'Z2', 'APG', 'Philippines', 'MNL', 'Manila', 2010, 'Active', 'https://www.airasia.com');
