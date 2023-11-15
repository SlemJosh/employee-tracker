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
                choices: ['View All Employees', 'View All Roles', 'View All Departments', 'View Employees by Manager', 'View Employees by Department', 'Administrative Options', 'Exit']
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
                    viewAllDepartments();
                    break;
                
                case 'View Employees by Department':
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

// View All Employees
function viewAllEmployees() {
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
    db.query(
        'SELECT id, dept_name as Department ' +
        'FROM departments ' +
        'ORDER BY id',
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

// View Employees by Manager
function viewEmployeesByManager() {
    // Fetch managers dynamically from the database
    db.query('SELECT id, CONCAT(first_name, " ", last_name) AS manager_name FROM employees', function (err, managers) {
        if (err) {
            console.error('Error fetching managers:', err);
            return;
        }

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


// View Employees by Department


// Administrative Options
function handleAdministrativeOptions() {
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

            switch (adminChoice) {
                case 'Add Employee':
                    addEmployee();
                    break;

                case 'Remove Employee':
                    removeEmployee();
                    break;

                case 'Update Employee':
                    updateEmployee();
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
    // Fetch roles and managers dynamically from the database
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

// Update Employee
function updateEmployee() {
    // Fetch employees dynamically from the database
    db.query('SELECT e.id, CONCAT(e.first_name, " ", e.last_name) AS employee_name FROM employees e', function (err, employees) {
        if (err) {
            console.error('Error fetching employees:', err);
            return;
        }

        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'employee_id',
                    message: 'Select the employee to update:',
                    choices: employees.map(employee => ({
                        name: employee.employee_name,
                        value: employee.id,
                    })),
                },
                {
                    type: 'confirm',
                    name: 'update_role',
                    message: 'Does this employee have a new role?',
                    default: false,
                },
            ])
            .then(answer => {
                if (answer.update_role) {
                    // Fetch roles dynamically from the database
                    const roleChoices = [];

                    db.query('SELECT id, title FROM roles', function (err, roles) {
                        if (err) {
                            console.error('Error fetching roles:', err);
                            return;
                        }

                        roleChoices.push(...roles);

                        inquirer
                            .prompt([
                                {
                                    type: 'list',
                                    name: 'role_id',
                                    message: "Select the employee's new role:",
                                    choices: roleChoices.map(role => ({
                                        name: role.title,
                                        value: role.id,
                                    })),
                                },
                                {
                                    type: 'confirm',
                                    name: 'update_manager',
                                    message: 'Does this employee have a new manager?',
                                    default: false,
                                },
                            ])
                            .then(roleAnswer => {
                                const updateData = {
                                    role_id: roleAnswer.role_id,
                                };

                                if (roleAnswer.update_manager) {
                                    // Fetch managers dynamically from the database
                                    const managerChoices = [{ name: 'None', value: null }];

                                    db.query('SELECT id, CONCAT(first_name, " ", last_name) AS manager_name FROM employees', function (err, managers) {
                                        if (err) {
                                            console.error('Error fetching managers:', err);
                                            return;
                                        }

                                        managerChoices.push(...managers.map(manager => ({
                                            name: manager.manager_name || 'None',
                                            value: manager.id,
                                        })));

                                        inquirer
                                            .prompt([
                                                {
                                                    type: 'list',
                                                    name: 'manager_id',
                                                    message: "Select the employee's new manager:",
                                                    choices: managerChoices,
                                                },
                                            ])
                                            .then(managerAnswer => {
                                                updateData.manager_id = managerAnswer.manager_id;

                                                // Update the employee in the database
                                                db.query(
                                                    'UPDATE employees SET ? WHERE id = ?',
                                                    [updateData, answer.employee_id],
                                                    function (err, result) {
                                                        if (err) {
                                                            console.error('Error updating the employee:', err);
                                                            return;
                                                        }
                                                        console.log('Employee updated successfully!');
                                                        init();
                                                    }
                                                );
                                            });
                                    });
                                } else {
                                    // Update the employee in the database without changing the manager
                                    db.query(
                                        'UPDATE employees SET ? WHERE id = ?',
                                        [updateData, answer.employee_id],
                                        function (err, result) {
                                            if (err) {
                                                console.error('Error updating the employee:', err);
                                                return;
                                            }
                                            console.log('Employee updated successfully!');
                                            init();
                                        }
                                    );
                                }
                            });
                    });
                } else {
                    // If the employee does not have a new role, check if they have a new manager
                    inquirer
                        .prompt([
                            {
                                type: 'confirm',
                                name: 'update_manager',
                                message: 'Does this employee have a new manager?',
                                default: false,
                            },
                        ])
                        .then(managerAnswer => {
                            const updateData = {};

                            if (managerAnswer.update_manager) {
                                // Fetch managers dynamically from the database
                                const managerChoices = [{ name: 'None', value: null }];

                                db.query('SELECT id, CONCAT(first_name, " ", last_name) AS manager_name FROM employees', function (err, managers) {
                                    if (err) {
                                        console.error('Error fetching managers:', err);
                                        return;
                                    }

                                    managerChoices.push(...managers.map(manager => ({
                                        name: manager.manager_name || 'None',
                                        value: manager.id,
                                    })));

                                    inquirer
                                        .prompt([
                                            {
                                                type: 'list',
                                                name: 'manager_id',
                                                message: "Select the employee's new manager:",
                                                choices: managerChoices,
                                            },
                                        ])
                                        .then(managerAnswer => {
                                            updateData.manager_id = managerAnswer.manager_id;

                                            // Update the employee in the database
                                            db.query(
                                                'UPDATE employees SET ? WHERE id = ?',
                                                [updateData, answer.employee_id],
                                                function (err, result) {
                                                    if (err) {
                                                        console.error('Error updating the employee:', err);
                                                        return;
                                                    }
                                                    console.log('Employee updated successfully!');
                                                    init();
                                                }
                                            );
                                        });
                                });
                            } else {
                                // If there are no updates, go back to the main menu
                                console.log('No updates were made.');
                                init();
                            }
                        });
                }
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
    const departmentChoices = [];

    // Fetch departments
    db.query('SELECT id, dept_name FROM departments', function (err, departments) {
        if (err) {
            console.error('Error fetching departments:', err);
            return;
        }
        departmentChoices.push(...departments);

        // Prompt user for role details
        inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'title',
                    message: "Enter the role's title:",
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: "Enter the role's salary:",
                },
                {
                    type: 'list',
                    name: 'department_id',
                    message: "Select the role's department:",
                    choices: departmentChoices.map(department => ({
                        name: department.dept_name,
                        value: department.id,
                    })),
                },
            ])
            .then(roleData => {
                // Exclude 'id' field to let MySQL auto-increment
                delete roleData.id;

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



// Remove Role
function removeRole() {
    // Fetch roles dynamically from the database
    db.query('SELECT id, title FROM roles', function (err, results) {
        if (err) {
            console.error('Error fetching roles:', err);
            return;
        }

        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'role_id',
                    message: 'Select the role to remove:',
                    choices: results.map(role => ({
                        name: role.title,
                        value: role.id,
                    })),
                },
                {
                    type: 'confirm',
                    name: 'confirm_remove',
                    message: 'Are you sure you wish to remove this role from the database?',
                    default: false,
                },
            ])
            .then(answer => {
                if (!answer.confirm_remove) {
                    console.log('Role removal canceled.');
                    init(); // Go back to the main menu
                    return;
                }

                db.query(
                    'DELETE FROM roles WHERE id = ?',
                    [answer.role_id],
                    function (err, result) {
                        if (err) {
                            console.error('Error removing the role:', err);
                            return;
                        }
                        console.log('Role removed successfully!');
                        init();
                    }
                );
            });
    });
}

// Add Department
function addDepartment() {
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

            db.query(
                'INSERT INTO departments SET ?',
                departmentData,
                function (err, result) {
                    if (err) {
                        console.error('Error adding the department:', err);
                        return;
                    }
                    console.log(`Department ${departmentData.dept_name} added successfully!`);
                    init();
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








start_up();
init();
