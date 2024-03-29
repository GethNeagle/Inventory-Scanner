const barcode = require('barcode');
const session = require('express-session');
const ExcelJS = require('exceljs');
const XLSX = require('xlsx');
//test
//required for validation
const { check, validationResult }
    = require('express-validator');




      



module.exports = function(app) {

    // Handle our routes
    app.get('/',function(req,res){
        res.render('login.ejs')
    });
    app.get('/exportitems', function (req, res) {
      if (req.session.loggedin){
          res.render('exportitems.ejs');
      }else{
          res.render('notloggedin.ejs')
      }
   });

    app.get('/index', function (req, res) {
      if (req.session.loggedin){
          res.render('index.ejs');
      }else{
          res.render('notloggedin.ejs')
      }
   });
   app.get('/reset', function (req, res) {
    if (req.session.loggedin){
        res.render('reset.ejs');
    }else{
        res.render('notloggedin.ejs')
    }
 });


    app.get('/listall', function(req, res) {
        let sqlquery = "SELECT * FROM items"; // query database to get all the itemss
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({},{availableitemss:result});
            console.log(newData)
            res.render('listall.ejs', newData)
            //res.json({newData})
        });
    });



    //gets the register page
    app.get('/register', function (req,res) {
        res.render('register.ejs');                                                                     
    });


      //posts the registered page
    

      app.post('/registered', [
        check('username', 'Username should be more than 4 characters')
          .isLength({ min: 4, max: 30 }),
        check('email', 'Email should be more than 8 characters')
          .isEmail().isLength({ min: 8, max: 50 }),
        check('password', 'Password length should be 8 to 30 characters')
          .isLength({ min: 8, max: 30 })
      ], function (req, res) {
        // Initialise bcrypt
        const bcrypt = require('bcryptjs');
        const saltRounds = 10;
        const plainPassword = req.body.password;
      
        // Hashing the password
        bcrypt.hash(plainPassword, saltRounds, function (err, hashedPassword) {
          console.log(hashedPassword);
      
          const errors = validationResult(req); // Validation happens here
          if (!errors.isEmpty()) {
            res.json({ success: false, errors: errors.array() });
          } else {
            // Check if the username and email already exist in the database
            db.query('SELECT * FROM users WHERE username = ? OR email = ?', [req.body.username, req.body.email], (err, result) => {
              if (err) {
                return console.error(err.message);
              }
              if (result.length > 0) {
                const existingUsername = result.some(user => user.username === req.body.username);
                const existingEmail = result.some(user => user.email === req.body.email);
                const message = [];
                //let message = '';
                if (existingUsername) {
                  message.push({ msg: 'Username already exists.' });
                }
                if (existingEmail) {
                  message.push({ msg: 'Email already exists.' });
                }
                res.json({ success: false, errors: message });
              } else {
                // If the username and email are unique, insert the new record
                let sqlquery = "INSERT INTO users (username, hashedPassword, email) VALUES (?,?,?)";
                let newrecord = [req.body.username, hashedPassword, req.body.email];
      
                db.query(sqlquery, newrecord, (err, result) => {
                  if (err) {
                    return console.error(err.message);
                  } else {
                    res.json({ success: true, message: 'Registration successful.' }); // Send success response
                  }
                });
              }
            });
          }
        });
      });
      
      




    //renders the items API
    app.get('/scan', function (req, res) {
      if (req.session.loggedin){
          res.render('scan.ejs');
      }else{
          res.render('notloggedin.ejs')
      }
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
            let newData = Object.assign({},{availableitemss:result});
            console.log(newData)
            res.json({newData})
         });        
    });





    //gets logout page    
    app.get('/logout', function (req, res) {
      if (req.session.loggedin){
          res.render('logout.ejs');
      }else{
          res.render('notloggedin.ejs')
      }
   });

     //posts logges out - will post an error message if no user is logged in
     app.post('/loggedout', async (req, res) => {
        if (req.session.loggedin) {
            delete req.session.loggedin;
            res.render('login.ejs');
        } else {
            //if no user logged in, send error message
            res.json({result: 'ERROR', message: 'User is not logged in.'});
        }
    });

    //Renders login page
    app.get('/login', function (req, res) {
        res.render('login.ejs');
     });
     


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
      if (req.session.loggedin){
          res.render('additems.ejs');
      }else{
          res.render('notloggedin.ejs')
      }
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
     app.get('/deleteitem', function (req, res) {
        if (req.session.loggedin){
            res.render('deleteitem.ejs');
        }else{
            res.send("Please log in");
        }
     });
     //method to delete a items. 
    // app.post('/deleted', function(req, res) {
    //     console.log(req.body.name);
    //       let sqlquery = 'DELETE FROM items WHERE name = ?';
    //       ///sql to delete the user.
    //       db.query(sqlquery, function (err, data) {
    //       if (err) throw err;
    //       console.log(data.affectedRows + " record(s) updated");
    //     });
    //     res.send("Deleted");
    // });
    app.post('/deleted', (req, res) => {
      const itemId = req.body.item_name;
      const sqlquery = 'DELETE FROM items WHERE name = ?';
    
      db.query(sqlquery, [itemId], (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send('Internal server error');
          return;
        }
    
        res.redirect('http://www.doc.gold.ac.uk/usr/208/deleteitem');
      });
    });
    



    // app.get('/exportlist', (req, res) => {
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
    //     const workbook = new ExcelJS.Workbook();
    //     const worksheet = workbook.addWorksheet('Inventory List');
    //     console.log(data);
    
    //     // Add column headers
    //     worksheet.columns = [
    //       { header: 'Name', key: 'Name', width: 10 },
    //       { header: 'Price', key: 'Price', width: 10 },
    //       { header: 'Quantity', key: 'Quantity', width: 10 },
    //       { header: 'Value', key: 'Value', width: 10 }
    //     ];
    
    //     // Add data to the worksheet
    //     data.forEach((item) => {
    //       worksheet.addRow(item);
    //     });
    
    //     // Save the workbook and send it as a response
    //     workbook.xlsx.writeBuffer().then((buffer) => {
    //       res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    //       res.setHeader('Content-Disposition', 'attachment; filename=inventory.xlsx');  // Added Content-Disposition
    //       res.send(buffer);
    //     }).catch((err) => {
    //       console.error("Error writing buffer: ", err);  // Error handling for writeBuffer promise
    //     });
    //   });
    // });

    app.get('/exportlist', (req, res) => {
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
    
        // Prepare data for text file
        let textData = "Name, Price, Quantity, Value\n";  // Header
    
        // Add data to the textData string
        data.forEach((item) => {
          textData += `${item.Name}, ${item.Price}, ${item.Quantity}, ${item.Value}\n`;
        });
    
        // Convert to buffer
        const buffer = Buffer.from(textData, 'utf8');
        
        // Set headers and send response
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename=inventory.txt'); 
        res.send(buffer);
      });
    });
    








      app.get('/api/items', (req, res) => {
        const sqlquery = 'SELECT * FROM items';
      
        db.query(sqlquery, (err, rows) => {
          if (err) {
            console.error(err);
            res.status(500).send('Internal server error');
            return;
          }
      
          res.json(rows);
        });
      });

      app.post('/reset-quantity', (req, res) => {
        const sqlquery = 'UPDATE items SET quantity = 0';
      
       db.query(sqlquery, (error, results) => {
          if (error) {
            console.error('Error resetting quantities:', error);
            res.status(500).send('Error resetting quantities');
            return;
          }
          res.status(200).send('Item quantities reset successfully');
        });
      });

      
      
      
      
}


