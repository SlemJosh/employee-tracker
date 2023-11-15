// Bring in our npms
const mysql = require('mysql2');
const inquirer = require('inquirer'); // In order to install inquirer, please use npm i inquirer@8.2.4.
const Table = require('cli-table3'); // https://www.npmjs.com/package/cli-table3
require('dotenv').config(); // Bring in the private info, but don't share it.

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the database');
});

function start_up() {
    console.log("************************************************************");
    console.log("*                                                          *");
    console.log("*                    Employee Tracker                      *");
    console.log("*                                                          *");
    console.log("************************************************************");
}

function init() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'choice',
                message: 'What would you like to do?',
                choices: ['View All Employees', 'View All Roles', 'View All Departments', 'Administrative Options', 'Exit']
            },
        ])
        .then(answers => {
            const choiceContent = answers.choice;

            switch (choiceContent) {
                case 'View All Employees':
                    viewAllEmployees();
                    break;

                case 'View All Roles':
                    viewAllRoles();
                    break;

                case 'View All Departments':
                    viewAllDepartments();
                    break;

                case 'Administrative Options':
                    handleAdministrativeOptions();
                    break;

                case 'Exit':
                    console.log('Thank You! See You Next Time!')
                    process.exit(0);
                    break;

                default:
                    console.log('Invalid choice. Please choose a valid option.');
                    init();
            }
        });
}

function viewAllEmployees() {
    db.query(
        'SELECT em.id, em.first_name, em.last_name, ro.title, de.dept_name, ro.salary, ' +
        'IFNULL(CONCAT(manager.first_name, " ", manager.last_name), "N/A") AS manager ' +
        'FROM employees em ' +
        'JOIN roles ro ON em.role_id = ro.id ' +
        'JOIN departments de ON ro.department_id = de.id ' +
        'LEFT JOIN employees manager ON em.manager_id = manager.id',
        function (err, results) {
            if (err) {
                console.error('Error querying the database:', err);
                return;
            }

            const table = new Table({
                head: ['ID', 'First Name', 'Last Name', 'Title', 'Department', 'Salary', 'Manager'],
                colWidths: [5, 15, 15, 20, 15, 10, 20],
            });

            results.forEach(({ id, first_name, last_name, title, dept_name, salary, manager }) => {
                table.push([id, first_name, last_name, title, dept_name, salary, manager]);
            });

            console.log(table.toString());
            init();
        }
    );
}

function viewAllRoles() {
    db.query(
        'SELECT ro.id, ro.title, ro.salary, de.dept_name as Department ' +
        'FROM roles ro ' +
        'JOIN departments de ON ro.department_id = de.id',
        function (err, results) {
            if (err) {
                console.error('Error querying roles:', err);
                return;
            }

            const table = new Table({
                head: ['ID', 'Title', 'Salary', 'Department'],
                colWidths: [5, 20, 15, 20],
            });

            results.forEach(({ id, title, salary, Department }) => {
                table.push([id, title, salary, Department]);
            });

            console.log(table.toString());
            init();
        }
    );
}


function viewAllDepartments() {
    db.query(
        'SELECT id, dept_name as Department FROM departments',
        function (err, results) {
            if (err) {
                console.error('Error querying departments:', err);
                return;
            }

            const table = new Table({
                head: ['ID', 'Department'],
                colWidths: [5, 20],
            });

            results.forEach(({ id, Department }) => {
                table.push([id, Department]);
            });

            console.log(table.toString());
            init();
        }
    );
}

function handleAdministrativeOptions() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'adminChoice',
                message: 'Administrative Options - What would you like to do?',
                choices: ['Add Employee', 'Remove Employee', 'Add Role', 'Remove Role', 'Add Department', 'Remove Department', 'Go back']
            },
        ])
        .then(answers => {
            const adminChoice = answers.adminChoice;

            switch (adminChoice) {
                case 'Add Employee':
                    addEmployee();
                    break;

                // Add cases for other administrative options

                case 'Go back':
                    init();
                    break;

                default:
                    console.log('Invalid choice. Please choose a valid option.');
                    handleAdministrativeOptions();
            }
        });
}

function addEmployee() {
    inquirer
        .prompt([
            
        ])
        .then(employeeData => {
            db.query(
                'INSERT INTO employees SET ?',
                employeeData,
                function (err, result) {
                    if (err) {
                        console.error('Error adding the employee:', err);
                        return;
                    }
                    console.log(`Employee ${employeeData.first_name} ${employeeData.last_name} added successfully!`);
                    init();
                }
            );
        });
}



start_up();
init();
