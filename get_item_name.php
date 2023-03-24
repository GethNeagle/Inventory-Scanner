<?php
// Initialize variables for database connection
$host = "localhost";
$username = "appuser";
$password = "app2027";
$dbname = "inventorydb";

// Connect to the database
$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if barcode ID is set in the query string
if (isset($_GET['barcode_id'])) {
    $barcode_id = $_GET['barcode_id'];
    
    // Query the database to get the name of the item associated with the barcode ID
    $sql = "SELECT name FROM items WHERE barcode_id = '$barcode_id'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $itemName = $row["name"];
    } else {
        $itemName = "";
    }
} else {
    $itemName = "";
}

// Close database connection
$conn->close();

// Set the response content type to JSON
header('Content-Type: application/json');

// Send the item name as a JSON response
echo json_encode(array('name' => $itemName));
?>