const barcode = require('barcode');
const e = require('express');
//test
//required for validation
const { check, validationResult }
    = require('express-validator');

module.exports = function(app, shopData) {

    // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', shopData)
    });
    app.get('/about',function(req,res){
        res.render('about.ejs', shopData);
    });

    app.get('/search',function(req,res){
        res.render('search.ejs', shopData);
    });
    app.get('/search-result', function (req, res) {
        //searching in the database
        let sqlquery = "SELECT * FROM food WHERE name LIKE '%" + req.query.keyword + "%'"; // query database to get all the foods
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            //if no errors
            let newData = Object.assign({}, shopData, {availableFoods:result});
            console.log(JSON.stringify(req.body.keyword))
            if (newData.availableFoods.length > 0 && req.query.keyword.length > 0 ){
                res.render('list.ejs', newData)

            }else{
                res.send("No items")
            }
            
         });        
    });

    app.get('/listall', function(req, res) {
        let sqlquery = "SELECT * FROM food"; // query database to get all the foods
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, shopData, {availableFoods:result});
            console.log(newData)
            res.render('listall.ejs', newData)
            //res.json({newData})
        });
    });

    app.post('/refinedsearch', function (req, res) {
        //searching in the database
        //res.send("You searched for: " + req.query.keyword);
        console.log(req.body.example);
        let sqlquery = "SELECT * FROM food WHERE name LIKE '%" + req.body.example+ "%'"; // query database to get all the foods
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            //if no errors
            let newData = Object.assign({}, shopData, {availableFoods:result});
            console.log(JSON.stringify(req.body.keyword))
            if (newData.availableFoods.length > 0){
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
        check('first', 'First name length should be more than')//checks first name is longer than 2 chars
                    .isLength({ min: 2, max: 50 }),
        check('last', 'Last name should be more than 2 characters')
                    .isLength({ min: 2, max: 50 }),
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
            let sqlquery = "INSERT INTO users (username, first, last, email, hashedPassword) VALUES (?,?,?,?,?)";
            let newrecord = [req.body.username, req.body.first, req.body.last, req.body.email, hashedPassword];
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


    //renders the Food API
    app.get('/api', function (req,res) {
        res.render('api.ejs', shopData);                                                                     
    });





    //Shows list of foods in JSON format
    //  "/foodapi?keyword=cream" will bring information for 'cream' in JSON format. 
    app.get('/foodapi', function (req, res) {
        //searching in the database
        let sqlquery = "SELECT * FROM food WHERE name LIKE '%" + req.query.keyword + "%'"; // query database to get all the food
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            //if no errors
            let newData = Object.assign({}, shopData, {availableFoods:result});
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
     
     //render login page
     app.get('/', function(req, res) {
        // Render login template
        res.sendFile(path.join(__dirname + '/loggedin'));
    });

    //WHen user has enetered details, will check if correct and log in user.
    app.post('/loggedin', (req, res)=> {
        const bcrypt = require('bcryptjs');
        const username = req.body.username;
        const password = req.body.password;
        db.query('SELECT hashedPassword FROM users WHERE username = ?', [username], function (err, content, fields) {
              //Throws error if any errors during excecution.
              if (err) throw err;
              // if there is no error, produces result.
              hashedPassword = content[0].hashedPassword;
              bcrypt.compare(req.body.password, hashedPassword, function(err, result) {
                if (err) {
                    res.send("Password does not match");
                }
                else if (result == true) {
                    //sets variabel to true, will allow access to otherwise limited pages      
                    req.session.loggedin = true;
                    console.log(req.session.loggedin);//to print to console that 'login' worked
				    req.session.username = username;
                    res.redirect('about');//sends users back to index
                }
                else {
                    res.send("Your Username or Password are incorrect");
                }
            });
        });
    });




    //renders addfood page
    app.get('/addfood', function (req, res) {
        if (req.session.loggedin){
            res.render('addfood.ejs', shopData);
        }else{
            //if no users logged in, will prompt user to log in
            res.send("Please log in");
        }
     });

     app.get('/updatefood', function (req,res) {
        var name = req.body.name;
        var quantity = req.body.quantity;
        var price = req.body.price;
        var barcodeid = req.body.barcodeid;
        // saving data in database
        let sqlquery = "UPDATE food SET quantity = '" + req.query.quanity +
         "', price = '" + req.query.price +
         "', barcodeid = '" +req.query.barcodeid +
         "' WHERE name = '" + req.query.name + "' AND user = '"+ req.session.username +"'";
         console.log(sqlquery);
        // execute sql query

        
        let newrecord = [quantity,price,barcodeid];
        //query database
        db.query(sqlquery, newrecord, (err, result) => {
          if (result.affectedRows < 1) {
            res.send("Only original user can change values.");
          }
          else
          //sends data for the list of food
          res.send(req.query.name+' Has been updated');
          });
    }); 
 
     app.post('/foodadded', function (req,res) {
           // saving data in database
           let sqlquery = "INSERT INTO food (name, quantity, price, barcodeid, user) VALUES (?,?,?,?,?)";
           // execute sql query
            var user = req.session.username;
            var name = req.body.name;
            var quantity = req.body.quantity;
            var price = req.body.price;
            var barcodeid = req.body.barcodeid;

           let newrecord = [name, quantity ,price, barcodeid, user ];
           //query database
           db.query(sqlquery, newrecord, (err, result) => {
             if (err) {
               return console.error(err.message);
             }
             else
             //sends data for th elist of food
             res.send(' This food is added to database, name: '+ req.body.name);
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
     //method to delete a food. 
    app.post('/deleted', function(req, res) {
        console.log(req.body.name);
          let sqlquery = 'DELETE FROM food WHERE name = ?';
          ///sql to delete the user.
          db.query(sqlquery, function (err, data) {
          if (err) throw err;
          console.log(data.affectedRows + " record(s) updated");
        });
        res.send("Deleted");
    });
}
