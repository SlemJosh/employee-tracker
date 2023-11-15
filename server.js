// Bring in our npm packages
const mysql = require('mysql2');
const inquirer = require('inquirer'); // In order to install inquirer, please use npm i inquirer@8.2.4.
const Table = require('cli-table3'); // https://www.npmjs.com/package/cli-table3
require('dotenv').config(); // Bring in the private info, but don't share it.

// Create a MySQL connection
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

// A visual start to viewing our database queries.
function startUp() {
    console.log("************************************************************");
    console.log("*                                                          *");
    console.log("*                    Employee Tracker                      *");
    console.log("*                                                          *");
    console.log("************************************************************");
}

// Initialize the application
function init() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'choice',
                message: 'What would you like to do?',
                choices: ['View All Employees', 'View All Roles', 'View All Departments', 'View Employees by Manager', 'View Employees by Department', 'View Department Budget', 'Administrative Options', 'Exit']
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

                case 'View Employees by Manager':
                    viewEmployeesByManager();
                    break;

                case 'View Employees by Department':
                    viewEmployeesByDepartment();
                    break;

                case 'View Department Budget':
                    viewDepartmentBudget();
                    break;

                // We broke up the remaining options into another category such as to not make the menu so large.
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

// View All Employees
function viewAllEmployees() {
    // Query to fetch all employee details
    db.query(
        'SELECT em.id, em.first_name, em.last_name, ro.title, de.dept_name, ro.salary, ' +
        'IFNULL(CONCAT(manager.first_name, " ", manager.last_name), "N/A") AS manager ' +
        'FROM employees em ' +
        'JOIN roles ro ON em.role_id = ro.id ' +
        'JOIN departments de ON ro.department_id = de.id ' +
        'LEFT JOIN employees manager ON em.manager_id = manager.id ' +
        'ORDER BY em.id',
        function (err, results) {
            if (err) {
                console.error('Error querying the database:', err);
                return;
            }

            // Display employee details in a table
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

// View All Roles
function viewAllRoles() {
    // Query to fetch all roles
    db.query(
        'SELECT ro.id, ro.title, ro.salary, de.dept_name as Department ' +
        'FROM roles ro ' +
        'JOIN departments de ON ro.department_id = de.id ' +
        'ORDER BY ro.id',
        function (err, results) {
            if (err) {
                console.error('Error querying roles:', err);
                return;
            }

            // Display roles in a table
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

// View All Departments
function viewAllDepartments() {
    // Query to fetch all departments
    db.query(
        'SELECT id, dept_name as Department ' +
        'FROM departments ' +
        'ORDER BY id',
        function (err, results) {
            if (err) {
                console.error('Error querying departments:', err);
                return;
            }

            // Display departments in a table
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

// View Employees by Manager
function viewEmployeesByManager() {
    // Query to fetch all managers
    db.query(
        'SELECT DISTINCT manager.id, CONCAT(manager.first_name, " ", manager.last_name) AS manager_name ' +
        'FROM employees manager ' +
        'JOIN employees em ON manager.id = em.manager_id',
        function (err, managers) {
            if (err) {
                console.error('Error fetching managers:', err);
                return;
            }

            // Prompt user to select a manager
            inquirer
                .prompt([
                    {
                        type: 'list',
                        name: 'manager_id',
                        message: 'Select the manager:',
                        choices: managers.map(manager => ({
                            name: manager.manager_name,
                            value: manager.id,
                        })),
                    },
                ])
                .then(answer => {
                    // Query to fetch employees under the selected manager
                    db.query(
                        'SELECT em.id, em.first_name, em.last_name, ro.title, de.dept_name, ro.salary, ' +
                        'IFNULL(CONCAT(manager.first_name, " ", manager.last_name), "N/A") AS manager ' +
                        'FROM employees em ' +
                        'JOIN roles ro ON em.role_id = ro.id ' +
                        'JOIN departments de ON ro.department_id = de.id ' +
                        'LEFT JOIN employees manager ON em.manager_id = manager.id ' +
                        'WHERE em.manager_id = ? ' +
                        'ORDER BY em.id',
                        [answer.manager_id],
                        function (err, results) {
                            if (err) {
                                console.error('Error querying the database:', err);
                                return;
                            }

                            // Display employees under the selected manager in a table
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
                });
        }
    );
}


// View Employees by Department
function viewEmployeesByDepartment() {
    // Fetch departments from the database
    db.query('SELECT id, dept_name FROM departments', function (err, departments) {
        if (err) {
            console.error('Error fetching departments:', err);
            return;
        }

        // Prompt user to select a department
        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'department_id',
                    message: 'Select the department:',
                    choices: departments.map(department => ({
                        name: department.dept_name,
                        value: department.id,
                    })),
                },
            ])
            .then(answer => {
                // Query to fetch employees in the selected department
                db.query(
                    'SELECT em.id, em.first_name, em.last_name, ro.title, de.dept_name, ro.salary, ' +
                    'IFNULL(CONCAT(manager.first_name, " ", manager.last_name), "N/A") AS manager ' +
                    'FROM employees em ' +
                    'JOIN roles ro ON em.role_id = ro.id ' +
                    'JOIN departments de ON ro.department_id = de.id ' +
                    'LEFT JOIN employees manager ON em.manager_id = manager.id ' +
                    'WHERE ro.department_id = ? ' +
                    'ORDER BY em.id',
                    [answer.department_id],
                    function (err, results) {
                        if (err) {
                            console.error('Error querying the database:', err);
                            return;
                        }

                        // Display employees in the selected department in a table
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
            });
    });
}

// View Department Budget
function viewDepartmentBudget() {
    // Fetch departments dynamically from the database
    db.query('SELECT id, dept_name FROM departments', function (err, departments) {
        if (err) {
            console.error('Error fetching departments:', err);
            return;
        }

        // Create choices for inquirer prompt
        const choices = departments.map(department => ({
            name: department.dept_name,
            value: department.id,
        }));

        // Add "View All Departments" option
        choices.push({ name: 'View All Departments', value: 'all' });

        // Prompt user to select a department or view all departments
        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'department_id',
                    message: 'Select the department:',
                    choices: choices,
                },
            ])
            .then(answer => {
                if (answer.department_id === 'all') {
                    viewAllDepartmentsBudget();
                } else {
                    // Query to fetch the budget for the selected department
                    db.query(
                        'SELECT SUM(ro.salary) AS total_budget ' +
                        'FROM employees em ' +
                        'JOIN roles ro ON em.role_id = ro.id ' +
                        'WHERE ro.department_id = ?',
                        [answer.department_id],
                        function (err, results) {
                            if (err) {
                                console.error('Error querying the database:', err);
                                return;
                            }

                            if (results.length > 0 && 'total_budget' in results[0]) {
                                // Display the budget for the selected department in a table
                                const totalBudget = Number(results[0].total_budget); // Convert to number

                                const table = new Table({
                                    head: ['Department', 'Department Budget'],
                                    colWidths: [20, 20],
                                });

                                const departmentName = departments.find(d => d.id === answer.department_id).dept_name;

                                table.push([departmentName, totalBudget.toFixed(2)]);

                                console.log(table.toString());
                            } else {
                                console.log('No budget information available for the selected department.');
                            }
                            init();
                        }
                    );
                }
            });
    });
}

// Function to view all departments and their budgets
function viewAllDepartmentsBudget() {
    // Query to fetch all departments and their budgets
    db.query(
        'SELECT d.id, d.dept_name, COALESCE(SUM(r.salary), 0) AS total_budget ' +
        'FROM departments d ' +
        'LEFT JOIN roles r ON d.id = r.department_id ' +
        'LEFT JOIN employees e ON r.id = e.role_id ' +
        'GROUP BY d.id, d.dept_name ' +
        'ORDER BY total_budget DESC',
        function (err, departments) {
            if (err) {
                console.error('Error fetching departments:', err);
                return;
            }

            // Display all departments and their budgets in a table
            console.log('Departments:', departments);

            const table = new Table({
                head: ['Department', 'Department Budget'],
                colWidths: [20, 20],
            });

            departments.forEach(({ dept_name, total_budget }) => {
                console.log('Department:', dept_name, 'Budget:', total_budget);

                // Convert total_budget to number before using toFixed
                const budget = Number(total_budget) ? Number(total_budget).toFixed(2) : 'N/A';
                table.push([dept_name, budget]);
            });

            console.log(table.toString());
            init();
        }
    );
}

// Administrative Options
function handleAdministrativeOptions() {
    // Prompt user to select an administrative option
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'adminChoice',
                message: 'Administrative Options - What would you like to do?',
                choices: ['Add Employee', 'Update Employee', 'Remove Employee', 'Add Role', 'Remove Role', 'Add Department', 'Remove Department', 'Go back']
            },
        ])
        .then(answers => {
            const adminChoice = answers.adminChoice;

            // Switch based on the selected administrative option
            switch (adminChoice) {
                case 'Add Employee':
                    addEmployee();
                    break;

                case 'Update Employee':
                    updateEmployee();
                    break;

                case 'Remove Employee':
                    removeEmployee();
                    break;

                case 'Add Role':
                    addRole();
                    break;

                case 'Remove Role':
                    removeRole();
                    break;

                case 'Add Department':
                    addDepartment();
                    break;

                case 'Remove Department':
                    removeDepartment();
                    break;

                case 'Go back':
                    init();
                    break;

                default:
                    console.log('Invalid choice. Please choose a valid option.');
                    handleAdministrativeOptions();
            }
        });
}

// Add Employee
function addEmployee() {
    const roleChoices = [];
    const managerChoices = [{ name: 'None', value: null }];

    // Fetch roles
    db.query('SELECT id, title FROM roles', function (err, roles) {
        if (err) {
            console.error('Error fetching roles:', err);
            return;
        }
        roleChoices.push(...roles);

        // Fetch managers
        db.query('SELECT id, CONCAT(first_name, " ", last_name) AS manager_name FROM employees', function (err, managers) {
            if (err) {
                console.error('Error fetching managers:', err);
                return;
            }

            // Update managerChoices to set the name to "None" where the value is null
            managerChoices.push(...managers.map(manager => ({
                name: manager.manager_name || 'None',
                value: manager.id,
            })));

            // Prompt user for employee details
            inquirer
                .prompt([
                    {
                        type: 'input',
                        name: 'first_name',
                        message: "Enter the employee's first name:",
                    },
                    {
                        type: 'input',
                        name: 'last_name',
                        message: "Enter the employee's last name:",
                    },
                    {
                        type: 'list',
                        name: 'role_id',
                        message: "Select the employee's role:",
                        choices: roleChoices.map(role => ({
                            name: role.title,
                            value: role.id,
                        })),
                    },
                    {
                        type: 'list',
                        name: 'manager_id',
                        message: "Select the employee's manager:",
                        choices: managerChoices,
                    },
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
        });
    });
}

// Remove Employee
function removeEmployee() {
    // Fetch employees dynamically from the database, including those without managers
    db.query('SELECT e.id, CONCAT(e.first_name, " ", e.last_name) AS employee_name FROM employees e LEFT JOIN employees m ON e.manager_id = m.id', function (err, results) {
        if (err) {
            console.error('Error fetching employees:', err);
            return;
        }

        // Prompt user to select an employee to remove
        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'employee_id',
                    message: 'Select the employee to remove:',
                    choices: results.map(employee => ({
                        name: employee.employee_name,
                        value: employee.id
                    })),
                },
                {
                    type: 'confirm',
                    name: 'confirm_remove',
                    message: 'Are you sure you wish to remove this employee from the database?',
                    default: false,
                },
            ])
            .then(answer => {
                if (!answer.confirm_remove) {
                    console.log('Employee removal canceled.');
                    init(); // Go back to the main menu
                    return;
                }

                // Remove the selected employee from the database
                db.query(
                    'DELETE FROM employees WHERE id = ?',
                    [answer.employee_id],
                    function (err, result) {
                        if (err) {
                            console.error('Error removing the employee:', err);
                            return;
                        }
                        console.log('Employee removed successfully!');
                        init();
                    }
                );
            });
    });
}

// Add Role
function addRole() {
    // Fetch departments dynamically from the database
    db.query('SELECT id, dept_name FROM departments', function (err, departments) {
        if (err) {
            console.error('Error fetching departments:', err);
            return;
        }

        // Prompt user for role details and department selection
        inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'title',
                    message: 'Enter the title of the new role:',
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: 'Enter the salary for the new role:',
                },
                {
                    type: 'list',
                    name: 'department_id',
                    message: 'Select the department for the new role:',
                    choices: departments.map(department => ({
                        name: department.dept_name,
                        value: department.id,
                    })),
                },
            ])
            .then(roleData => {

                // Add the new role to the database
                db.query(
                    'INSERT INTO roles SET ?',
                    roleData,
                    function (err, result) {
                        if (err) {
                            console.error('Error adding the role:', err);
                            return;
                        }
                        console.log(`Role ${roleData.title} added successfully!`);
                        init();
                    }
                );
            });
    });
}

// Add Department
function addDepartment() {
    // Prompt user for the new department's name
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'dept_name',
                message: "Enter the department's name:",
            },
        ])
        .then(departmentData => {
            // Exclude 'id' field to let MySQL auto-increment
            delete departmentData.id;

            // Insert the new department into the database
            db.query(
                'INSERT INTO departments SET ?',
                departmentData,
                function (err, result) {
                    if (err) {
                        console.error('Error adding the department:', err);
                        return;
                    }
                    console.log(`Department ${departmentData.dept_name} added successfully!`);
                    init(); // Go back to the main menu
                }
            );
        });
}

// Remove Department
function removeDepartment() {
    // Fetch departments dynamically from the database
    db.query('SELECT id, dept_name FROM departments', function (err, results) {
        if (err) {
            console.error('Error fetching departments:', err);
            return;
        }

        // Prompt user to select a department to remove
        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'department_id',
                    message: 'Select the department to remove:',
                    choices: results.map(department => ({
                        name: department.dept_name,
                        value: department.id,
                    })),
                },
                {
                    type: 'confirm',
                    name: 'confirm_remove',
                    message: 'Are you sure you wish to remove this department from the database?',
                    default: false,
                },
            ])
            .then(answer => {
                if (!answer.confirm_remove) {
                    console.log('Department removal canceled.');
                    init(); // Go back to the main menu
                    return;
                }

                // Remove the selected department from the database
                db.query(
                    'DELETE FROM departments WHERE id = ?',
                    [answer.department_id],
                    function (err, result) {
                        if (err) {
                            console.error('Error removing the department:', err);
                            return;
                        }
                        console.log('Department removed successfully!');
                        init();
                    }
                );
            });
    });
}

// Display the startup message and initiate the application
startUp();
init();
