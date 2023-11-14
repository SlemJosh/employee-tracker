// Bring in our npms
const mysql = require('mysql2')
const inquirer = require('inquirer'); // In order to install inquirer, please use npm i inquirer@8.2.4.
const { inherits } = require("util");
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

function start_up(){
console.log("************************************************************");
console.log("*                                                          *");
console.log("*                    Employee Tracker                      *");
console.log("*                                                          *");
console.log("************************************************************");
}

function init(){
    inquirer
    .prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'What would you like to do?',
            choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Exit']        
        },
    ])
    .then(answers => {
        const choiceContent = answers.choice;
        if (choiceContent === 'Exit'){
            console.log ("Thank You! See You Next Time!")
            process.exit(0);
        }
        if (choiceContent === 'View All Employees'){
            db.query('SELECT id, dept_name as Department FROM departments', function (err, results) {
                if (err){
                    console.error('Error pulling up that database', err);
                    return;
                }
                console.table(results)
                init();
            });
        }
        
    })

}

start_up();
init();