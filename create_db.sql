CREATE DATABASE recipebuddy;
USE recipebuddy;
CREATE USER 'appuser2'@'localhost' IDENTIFIED WITH mysql_native_password BY 'app2027';
GRANT ALL PRIVILEGES ON recipebuddy.* TO 'appuser'@'localhost';

