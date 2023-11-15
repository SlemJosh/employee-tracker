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
    // Fetch only managers dynamically from the database
    db.query(
        'SELECT DISTINCT manager.id, CONCAT(manager.first_name, " ", manager.last_name) AS manager_name ' +
        'FROM employees manager ' +
        'JOIN employees em ON manager.id = em.manager_id',
        function (err, managers) {
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
        }
    );
}



// View Employees by Department
function viewEmployeesByDepartment() {
    // Fetch departments dynamically from the database
    db.query('SELECT id, dept_name FROM departments', function (err, departments) {
        if (err) {
            console.error('Error fetching departments:', err);
            return;
        }

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
