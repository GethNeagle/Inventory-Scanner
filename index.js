
// Import the modules we need
const express = require ('express')
var ejs = require('ejs')
var bodyParser= require ('body-parser')
const mysql = require('mysql');
const session = require('express-session');
const path = require('path');
const bodyparser = require('body-parser')
var phpExpress = require('php-express')({
  binPath: 'php'});

// Create the express application object
const app = express();
const port = 8000
app.use(bodyParser.urlencoded({ extended: true }))

// Body-parser middleware
app.use(bodyparser.json())

// Set up css
app.use(express.static('public'));
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine('php', phpExpress.engine);
app.set('view engine', 'php');
app.use(express.static(path.join(__dirname, '/views')));
app.use('/images', express.static(process.cwd() + '/images'))

// Define the database connection
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'appuser',
    password: 'app2027',
    database: 'inventorydb'
});
// Connect to the database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;//testing comments

// Set the directory where Express will pick up HTML files
// __dirname will get the current directory
app.set('views', __dirname + '/views');

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs');

// Tells Express how we should process html files
// We want to use EJS's rendering engine
app.engine('html', ejs.renderFile);

// Define our data





// Requires the main.js file inside the routes folder passing in the Express app and data as arguments.  All the routes will go in this file
require("./routes/main")(app);

// Start the web app listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

//code to push
app.get('/api/items/:barcode_id', (req, res) => {
    const barcode_id = req.params.barcode_id;
  
    // Lookup the item name in the database using the barcode ID
    db.query(`SELECT name FROM items WHERE barcode_id = '${barcode_id}'`, (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send('Internal server error');
        return;
      }
      
      if (results.length === 0) {
        // If no item with the given barcode ID was found, return a 404 error
        res.status(404).send('Item not found');
      } else {
        // Return the item name as a response
        res.set('Content-Type', 'text/plain');
        res.send(results[0].name);
      }
    });
  });

  // app.get('/export', (req, res) => {
  //   let sqlquery = 'SELECT name, price, quantity FROM items';
  //   console.log("here");
  
  //   db.query(sqlquery, (err, rows) => {
  //     if (err) throw err;
  
  //     // Map rows to an array of objects with keys that match the column names
  //     const data = rows.map(row => {
  //       return {
  //         Name: row.name,
  //         Price: row.price,
  //         Quantity: row.quantity,
  //         Value: row.price * row.quantity
  //       }
  //     });
  
  //     // Create a new workbook and worksheet
  //     const workbook = XLSX.utils.book_new();
  //     const worksheet = XLSX.utils.json_to_sheet(data);
  
  //     // Add the worksheet to the workbook
  //     XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory List');
  
  //     // Save the workbook and send it as a response
  //     const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  //     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  //     res.attachment('inventory.xlsx');
  //     res.send(buffer);
  //   });
  // });
  

