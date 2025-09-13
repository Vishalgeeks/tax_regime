const express = require ("express");
const app = express();
const helmet = require('helmet');


const dotenv = require("dotenv");
const path = require('path');
const bcrypt = require('bcrypt');
var bodyParser = require("body-parser");
dotenv.config();

app.set("views engine","ejs");

const connection = require("./config/db");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/view"));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "https://cdn.tailwindcss.com"],
      "style-src": ["'self'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "'unsafe-inline'"],
      "font-src": ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
    },
  })
);

//route 
app.get("/",(req,res) =>{
    
    res.redirect( "/login.html");

});




app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
 



app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Query the database to find the user with the provided username
    const query = `SELECT * FROM table2 WHERE username = ?`;
    connection.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            res.status(500).send('Internal server error');
        } else if (results.length > 0) {
            const user = results[0];
            // Compare the provided password with the stored hashed password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    res.status(500).send('Internal server error');
                } else if (isMatch) {
                    res.redirect('/create.html');
                } else {
                    res.send("Invalid login credentials");
                }
            });
        } else {
            res.send('User not found');
        }
    });
});



//update route
app.get("/update-data" , (req,res) => {
    const updateQuery = " select * from table1 where id=?";

    connection.query(updateQuery,[req.query.id], (err,eachRow) => {
        if (err){
            console.log(err);
        }else{
            result = JSON.parse(JSON.stringify(eachRow[0]));  
            console.log(result)
            
            res.render("edit.ejs",{result});
        }
    });
});


//final update

app.post("/final_update",(req,res)=>{
   const id= req.body.hidden_id;
    const name = req.body.name;
    const email = req.body.email;
    const updateQuery2 = "update table1 set name=?, email=? where id=?";
    try{
        connection.query(updateQuery2,
            [name,email,id], 
            (err,rows) =>
        {
            if (err){
                console.log(err);
            }else{
                res.redirect("/data")
            }
        });
    }
    catch (err){
        console.log(err);
    }
});




//route delete
// Corrected delete route to handle POST requests
app.post("/delete-data", (req, res) => {
    const deleteQuery = "DELETE FROM table1 WHERE id = ?";
    // Get the ID from the form's hidden input via req.body
    const recordId = req.body.id; 

    connection.query(deleteQuery, [recordId], (err, result) => {
        if (err) {
            console.error("Database delete error:", err);
            return res.status(500).send("An error occurred while deleting the record.");
        }

        console.log("Record deleted successfully, ID:", recordId);
        // Redirect back to the report page to show the updated list
        res.redirect("/data");
    });
});


//output route
app.get("/data",(req,res)=>{
    connection.query("select * from table1 " , (err,rows)=>{
        if(err){
            console.log(err);
        }
        else{
            res.render("read.ejs",{rows});
        }
    });
});



//create operation route
//create operation route
app.post("/create", (req, res) => {
    // Read all four values from the form
    const { pno, name, level, option } = req.body; 

    // The SQL query now includes the 'option' column
    const insertQuery = "INSERT INTO table1 (pno, name, level, `option`) VALUES (?, ?, ?, ?)";

    // Pass all four values to the query
    connection.query(insertQuery, [pno, name, level, option], (err, results) => {
        if (err) {
            console.error("DATABASE INSERT ERROR:", err);
            res.status(500).send(`
                <div style="font-family: sans-serif; padding: 2rem;">
                    <h1>500 - Internal Server Error</h1>
                    <p>There was a problem saving your data. The server terminal has the detailed error.</p>
                    <p><strong>Error:</strong> ${err.message}</p>
                    <a href="/create.html">Go back and try again</a>
                </div>
            `);
            return;
        }
        
        console.log("Data inserted successfully!");
        res.redirect("/data");
    });
});
//register route

// Register route
app.post("/register", async (req, res) => {
    console.log(req.body);

    const { uid, username, email, contactno, password } = req.body;

    try {
        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, 10);
        connection.query("INSERT INTO table2 (uid, username, email, contactno, password) VALUES (?, ?, ?, ?, ?)",
            [uid, username, email, contactno, hashedPassword],
            (err, rows) => {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect("login.html");
                }
            });
    } catch (err) {
        console.log(err);
    }
});
app.listen(process.env.PORT || 4000 , (error)=>{
    if (error) throw error;

    console.log(`server running on ${process.env.PORT}`)
});
