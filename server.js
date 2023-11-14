// Bring in our npms
const mysql = require("mysql2")
const inquirer = require("inquirer") // In order to install inquirer, please use npm i inquirer@8.2.4.
require('dotenv').config(); // Bring in the private info, but don't share it.

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

// Connect to the database

db.connect((err) =>{
    if (err){
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the database');
});