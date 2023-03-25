const barcode = require('barcode');
const session = require('express-session');
const ExcelJS = require('exceljs');
const XLSX = require('xlsx');
//test
//required for validation
const { check, validationResult }
    = require('express-validator');




      



module.exports = function(app, shopData) {

    // Handle our routes
    app.get('/',function(req,res){
        res.render('login.ejs', shopData)
    });
    app.get('/about',function(req,res){
        res.render('about.ejs', shopData);
    });

    app.get('/index',function(req,res){
        res.render('index.ejs', shopData);
    });

    app.get('/search',function(req,res){
        res.render('search.ejs', shopData);
    });
    app.get('/search-result', function (req, res) {
        //searching in the database
        let sqlquery = "SELECT * FROM items WHERE name LIKE '%" + req.query.keyword + "%'"; // query database to get all the itemss
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            //if no errors
            let newData = Object.assign({}, shopData, {availableitemss:result});
            console.log(JSON.stringify(req.body.keyword))
            if (newData.availableitemss.length > 0 && req.query.keyword.length > 0 ){
                res.render('list.ejs', newData)

            }else{
                res.send("No items")
            }
            
         });        
    });

    app.get('/listall', function(req, res) {
        let sqlquery = "SELECT * FROM items"; // query database to get all the itemss
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, shopData, {availableitemss:result});
            console.log(newData)
            res.render('listall.ejs', newData)
            //res.json({newData})
        });
    });

    app.post('/refinedsearch', function (req, res) {
        //searching in the database
        //res.send("You searched for: " + req.query.keyword);
        console.log(req.body.example);
        let sqlquery = "SELECT * FROM items WHERE name LIKE '%" + req.body.example+ "%'"; // query database to get all the itemss
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            //if no errors
            let newData = Object.assign({}, shopData, {availableitemss:result});
            console.log(JSON.stringify(req.body.keyword))
            if (newData.availableitemss.length > 0){
                res.render('list2.ejs', newData)

            }else{
                res.send("No items")
            }
            
         });        
    });


    //gets the register page
    app.get('/register', function (req,res) {
        res.render('register.ejs', shopData);                                                                     
    });


      //posts the registered page
    app.post('/registered',[
        check('username', 'Username should be more than 4 characters')//checks username is longer than 4 chars
                    .isLength({ min: 4, max: 30 }),
        check('email', 'Email should be more than 8 characters')//checks email is an email
                    .isEmail().isLength({ min: 8, max: 50 }),
        check('password', 'Password length should be 8 to 10 characters')//checks password is at least 8 chars long
                    .isLength({ min: 8, max: 10 })
    ], function (req,res) {
        //initialise bcrypt
        const bcrypt = require('bcryptjs');
        const saltRounds = 10;
        const plainPassword = req.body.password;
        //hashing the password
        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) { 
            console.log(hashedPassword);
            let sqlquery = "INSERT INTO users (username, hashedPassword, email) VALUES (?,?,?)";
            let newrecord = [req.body.username, hashedPassword, req.body.email];
            const errors = validationResult(req);//validation happens here
            if (!errors.isEmpty()){
                res.json(errors)//prints any errors with validation the to screen
            }
            else{
            db.query(sqlquery, newrecord, (err, result) => {
                if (err) {
                    return console.error(err.message);
                }
                else
                //result = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now registered! We will send an email to you at ' + req.body.email;
                //result += 'Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword;
                res.render('registered.ejs');
            })
        }})
    });


    //renders the items API
    app.get('/api', function (req,res) {
        res.render('api.ejs', shopData);                                                                     
    });

    app.get('/get_item_name', (req, res) => {
        const barcode = req.query.barcode_id;
        const query = `SELECT name FROM items WHERE barcode_id = ${db.escape(barcode)}`;
    
        db.query(query, (err, result) => {
            if (err) throw err;
            res.send(result[0] ? result[0].name : '');
        });
    });





    //Shows list of itemss in JSON format
    //  "/itemsapi?keyword=cream" will bring information for 'cream' in JSON format. 
    app.get('/itemsapi', function (req, res) {
        //searching in the database
        let sqlquery = "SELECT * FROM items WHERE name LIKE '%" + req.query.keyword + "%'"; // query database to get all the items
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            //if no errors
            let newData = Object.assign({}, shopData, {availableitemss:result});
            console.log(newData)
            res.json({newData})
         });        
    });



    //Show list of users on website. Needs to be logged in
    app.get('/listusers', function(req, res) {
        // If the user is loggedin
        if (req.session.loggedin) {
            let sqlquery = "SELECT * FROM users"; // query database to get all the users
            // execute sql query
            db.query(sqlquery, (err, result) => {
                let newData = Object.assign({}, shopData, {availableUsers:result});
                res.render('listusers.ejs', newData);
            });
        } else {
            // Not logged in
            res.send('Please login to view this page!');
        }
        //res.end();
    });

    //gets logout page    
    app.get('/logout', function (req, res) {
        res.render('logout.ejs', shopData);
     });

     //posts logges out - will post an error message if no user is logged in
     app.post('/loggedout', async (req, res) => {
        if (req.session.loggedin) {
            delete req.session.loggedin;
            res.send({result: 'SUCCESS'});
        } else {
            //if no user logged in, send error message
            res.json({result: 'ERROR', message: 'User is not logged in.'});
        }
    });

    //Renders login page
    app.get('/login', function (req, res) {
        res.render('login.ejs', shopData);
     });
     
    //  //render login page
    //  app.get('/', function(req, res) {
    //     // Render login template
    //     res.sendFile(path.join(__dirname + '/loggedin'));
    // });

    //WHen user has enetered details, will check if correct and log in user.
    app.post('/loggedin', (req, res) => {
        const bcrypt = require('bcryptjs');
        const username = req.body.username;
        const password = req.body.password;
        db.query('SELECT hashedPassword FROM users WHERE username = ?', [username], function (err, content, fields) {
          if (err) {
            console.error(err);
            res.status(500).json({ message: 'An error occurred while processing your request.', error: err.message });
          } else if (content.length === 0) {
            res.status(401).json({ message: 'Your Username or Password are incorrect.' });
          } else {
            const hashedPassword = content[0].hashedPassword;
            bcrypt.compare(password, hashedPassword, function(err, result) {
              if (result) {
                req.session.loggedin = true;
                req.session.username = username;
                res.status(200).json({ message: 'Login successful.' });
                //res.render('index.ejs');
              } else {
                res.status(401).json({ message: 'Your Username or Password are incorrect.' });
              }
            });
          }
        });
      });




    //renders additems page
    app.get('/additems', function (req, res) {
        //if (req.session.loggedin){
            res.render('additems.ejs', shopData);
        //}else{
            //if no users logged in, will prompt user to log in
        //    res.send("Please log in");
       // }
     });

     app.get('/updateitems', function (req,res) {
        var name = req.body.name;
        var quantity = req.body.quantity;
        var price = req.body.price;
        var barcode_id = req.body.barcode_id;
        // saving data in database
        let sqlquery = "UPDATE items SET quantity = '" + req.query.quanity +
         "', price = '" + req.query.price +
         "', barcode_id = '" +req.query.barcode_id +
         "' WHERE name = '" + req.query.name; 
         console.log(sqlquery);
        // execute sql query

        
        let newrecord = [quantity,price,barcode_id];
        //query database
        db.query(sqlquery, newrecord, (err, result) => {
          if (result.affectedRows < 1) {
            res.send("Only original user can change values.");
          }
          else
          //sends data for the list of items
          res.send(req.query.name+' Has been updated');
          });
    }); 
 
    app.post('/itemsadded', function (req,res) {
        // saving data in database
        let sqlquery = "INSERT INTO items (name, price, barcode_id) VALUES (?,?,?)";
      
        // execute sql query
        var name = req.body.name;
        var price = req.body.price;
        var barcode_id = req.body.barcode_id;
      
        let newrecord = [name,price, barcode_id];
      
        //query database
        db.query(sqlquery, newrecord, (err, result) => {
          if (err) {
            return console.error(err.message);
          }
          
          //render success message on webpage
          res.render('success', {name: req.body.name});
        });
      }); 
       
       app.post('/addinventory', function (req, res) {
        // update quantity in database
        let sqlquery = "UPDATE items SET quantity = quantity + ? WHERE barcode_id = ?";
        // execute sql query
        var quantity = req.body.quantity;
        var barcode_id = req.body.barcode_id;
      
        let updateRecord = [quantity, barcode_id];
        //query database
        db.query(sqlquery, updateRecord, (err, result) => {
          if (err) {
            return console.error(err.message);
          } else if (result.affectedRows === 0) {
            // If no rows were updated, send a 404 error
            
          } else {
            // Send a success message with the updated item details
            
          }
        });
      });

      

    //renders delete user page
     app.get('/deleteuser', function (req, res) {
        if (req.session.loggedin){
            res.render('deleteuser.ejs', shopData);
        }else{
            res.send("Please log in");
        }
     });
     //method to delete a items. 
    app.post('/deleted', function(req, res) {
        console.log(req.body.name);
          let sqlquery = 'DELETE FROM items WHERE name = ?';
          ///sql to delete the user.
          db.query(sqlquery, function (err, data) {
          if (err) throw err;
          console.log(data.affectedRows + " record(s) updated");
        });
        res.send("Deleted");
    });

    app.get('/export', (req, res) => {
        let sqlquery = 'SELECT name, price, quantity FROM items';
        console.log("here");
      
        db.query(sqlquery, (err, rows) => {
          if (err) throw err;
      
          // Map rows to an array of objects with keys that match the column names
          const data = rows.map(row => {
            return {
              Name: row.name,
              Price: row.price,
              Quantity: row.quantity,
              Value: row.price * row.quantity
            }
          });
      
          // Create a new workbook and worksheet
          const workbook = XLSX.utils.book_new();
          const worksheet = XLSX.utils.json_to_sheet(data);
      
          // Add the worksheet to the workbook
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory List');
      
          // Save the workbook and send it as a response
          const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
          res.attachment('inventory.xlsx');
          res.send(buffer);
        });
      });
      
      
      
}


