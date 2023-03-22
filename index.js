
// Import the modules we need
var express = require ('express')
var ejs = require('ejs')
var bodyParser= require ('body-parser')
const mysql = require('mysql');
const session = require('express-session');
const path = require('path');
const bodyparser = require('body-parser')

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
app.use(express.static(path.join(__dirname, 'static')));

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
var shopData = {shopName: "Recipe Buddy"}

// Requires the main.js file inside the routes folder passing in the Express app and data as arguments.  All the routes will go in this file
require("./routes/main")(app, shopData);

// Start the web app listening
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

//code to push