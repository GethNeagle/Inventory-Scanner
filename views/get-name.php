<?php
// Establish a connection to the database
$servername = 'localhost';
$username = 'appuser';
$password = 'app2027';
$dbname = 'inventorydb';
$conn = new mysqli($servername, $username, $password, $dbname);

// Check for errors in connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get the barcode ID sent from the AJAX request
$barcode_id = $_GET['barcode_id'];

// Prepare a SQL statement to retrieve the item name from the database based on the barcode ID
$stmt = $conn->prepare("SELECT name FROM items WHERE barcode_id = ?");
$stmt->bind_param("s", $barcode_id);

// Execute the prepared statement and get the result
$stmt->execute();
$stmt->bind_result($name);
$stmt->fetch();

// Close the statement and database connection
$stmt->close();
$conn->close();

// Return the item name as a response to the AJAX request
echo $name;
?>
