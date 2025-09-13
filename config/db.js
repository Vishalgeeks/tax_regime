const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.HOST,
    password: process.env.PASSWORD,
    user : process.env.USER,
    database : process.env.DATABASE,
});

connection.connect((error)=>{
    if (error) throw error;

    console.log("connection successfull");
});

module.exports = connection;
