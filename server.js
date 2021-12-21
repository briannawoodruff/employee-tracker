require('dotenv').config();
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');

// asciiart logo
const logo = require('asciiart-logo');
const res = require('express/lib/response');
console.log(
    logo({
        name: 'Employee Tracker',
        font: 'Slant',
        lineChars: 10,
        padding: 2,
        margin: 3,
        borderColor: 'grey',
        logoColor: 'bold-green',
        textColor: 'green',
    })
        .render()
);

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username,
        user: process.env.DB_USER,
        // TODO: Add MySQL password
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
    console.log(`Connected to the employee_db database.`)
);

// Prompt when connection is created
db.connect(err => {
    if (err) console.error(err);
    firstPrompt();
});

function firstPrompt() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'options',
                message: "What would you like to do?",
                choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee", "Quit"],
                loop: false,
            }
        ])
        .then(data => {
            switch (data.options) {
                case "View all departments":
                    showAllDepartments();
                    break;
                case "View all roles":
                    showAllRoles();
                    break;
                case "View all employees":
                    showAllEmployees();
                    break;
                case "Add a department":
                    addDepartment();
                    break;
                case "Add a role":
                    addRole();
                    break;
                case "Add an employee":
                    addEmployee();
                    break;
                case "Update an employee":
                    updateEmployee();
                    break;
                case "Quit":
                    db.end()
                    break;
            }
        })
}

// Display list from database functions
var employeeList = [];
function selectEmployee() {
    db.query("SELECT first_name, last_name FROM employees", function (err, results) {
        if (err) console.error(err);

        // loop through table
        for (var i = 0; i < results.length; i++) {
            // push the first_name and last_name into an array to be displayed
            employeeList.push(results[i].first_name + " " + results[i].last_name);
        }

        employeeList.push(new inquirer.Separator());
    })
    return employeeList;
}

var managerList = [];
function selectManager() {
    db.query("SELECT first_name, last_name FROM employees", function (err, results) {
        if (err) console.error(err);

        managerList.push("None");

        for (var i = 0; i < results.length; i++) {
            managerList.push(results[i].first_name + " " + results[i].last_name);
        }

        managerList.push(new inquirer.Separator());
    })
    return managerList;
}

var roleList = [];
function selectRole() {
    db.query("SELECT title FROM roles", function (err, results) {
        if (err) console.error(err);

        for (var i = 0; i < results.length; i++) {
            roleList.push(results[i].title);
        }

        roleList.push(new inquirer.Separator());
    })
    return roleList;
}

var departmentList = [];
function selectDepartment() {
    db.query("SELECT name FROM department", function (err, results) {
        if (err) console.error(err);

        for (var i = 0; i < results.length; i++) {
            departmentList.push(results[i].name);
        }

        departmentList.push(new inquirer.Separator());
    })
    return departmentList;
}

// Show all from database
function showAllDepartments() {
    db.query("SELECT * FROM department", (err, results) => {
        if (err) console.error(err);
        console.table(results);
        firstPrompt();
    });
}

function showAllRoles() {
    db.query("SELECT * FROM roles", (err, results) => {
        if (err) console.error(err);
        console.table(results);
        firstPrompt();
    });
}

function showAllEmployees() {
    db.query("SELECT * FROM employees", (err, results) => {
        if (err) console.error(err);
        console.table(results);
        firstPrompt();
    });
}

// Add into database
function addDepartment() {
    inquirer
        .prompt([
            {
                type: "input",
                message: "What is the name of the department?",
                name: "department_name"
            },
        ])
        .then(data => {
            const newDept = data.department_name;

            db.query("INSERT INTO department (name) VALUES (?)", newDept, (err, results) => {
                if (err) console.error(err);

                showAllDepartments();
                console.log(`-Added ${newDept} to the database-`)
            });
        });
}

function addRole() {
    inquirer
        .prompt([
            {
                type: "input",
                message: "What is the name of the role?",
                name: "role_name"
            },
            {
                type: "number",
                message: "What is the salary of the role?",
                name: "salary"
            },
            {
                type: "list",
                message: "Which department does this role belong to?",
                name: "role_department",
                choices: selectDepartment()
            },
        ])
        .then(data => {
            // find the id from the selected department to create an arrary with the inputed data and id of that department
            db.query("SELECT id FROM department WHERE name = ?", data.role_department, (err, results) => {
                if (err) console.error(err);

                const [{ id }] = results;

                const roleInput = [data.role_name, data.salary, id];

                db.query("INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)", roleInput, (err, results) => {
                    if (err) console.error(err);

                    showAllRoles();
                    console.log(`-Added ${data.role_name} to the database-`)
                });

            });

        });
}

function addEmployee() {
    inquirer
        .prompt([
            {
                type: "input",
                message: "What is the employee's first name?",
                name: "first_name"
            },
            {
                type: "input",
                message: "What is the employee's last name?",
                name: "last_name"
            },
            {
                type: "list",
                message: "What is the employee's role?",
                name: "emp_role",
                choices: selectRole()
            },
            {
                type: "list",
                message: "Who is the employee's manager?",
                name: "emp_manager",
                choices: selectManager()
            },

        ])
        .then(data => {
            // get id from the selected role for the employee to push into an array
            db.query("SELECT id FROM roles WHERE title = ?", data.emp_role, (err, results) => {
                if (err) console.error(err);

                const [{ id }] = results;

                const newEmployee = [data.first_name, data.last_name];
                newEmployee.push(id)

                // If statement for "None"
                if (data.emp_manager === "None") {
                    let empManager = null

                    newEmployee.push(empManager)

                    db.query("INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", newEmployee, (err, results) => {
                        if (err) console.error(err);

                        showAllEmployees();
                        console.log(`-Added ${data.first_name + " " + data.last_name} to the database-`)
                    });
                } else {
                    const manager = data.emp_manager.split(' ')

                    // get id from the specific manager selected to be pushed into array for query
                    db.query("SELECT id FROM employees WHERE first_name = ? and last_name = ?", manager, (err, results) => {
                        if (err) console.error(err);

                        const [{ id }] = results;

                        newEmployee.push(id)

                        db.query("INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", newEmployee, (err, results) => {
                            if (err) console.error(err);

                            showAllEmployees();
                            console.log(`-Added ${data.first_name + " " + data.last_name} to the database-`)
                        });
                    });
                }
            });

        });
}

// Update an employee
function updateEmployee() {
    inquirer
        .prompt([
            {
                type: "list",
                message: "What would you like to update?",
                name: "option",
                choices: ["Employee's role"]
            },
            {
                type: "list",
                message: "Which employee's role do you want to update?",
                name: "emp_name",
                choices: selectEmployee()
            },
            {
                type: "list",
                message: "Which role do you want to assign the selected employee?",
                name: "emp_newRole",
                choices: selectRole()
            },
        ])
        .then(data => {
            switch (data.option) {
                case "Employee's role":
                    updateRole();
                    break;
                // case "Employee's manager":
                //     updateManager();
                //     break;
            }

            function updateRole() {
                // get id from the new role to be assigned to an employee
                db.query("SELECT id FROM roles WHERE title = ?", data.emp_newRole, (err, results) => {
                    if (err) console.error(err);

                    const [{ id }] = results;

                    const updateEmployee = [];
                    updateEmployee.push(id)

                    const employee = data.emp_name.split(' ');

                    // select the id from the choosen employee
                    db.query("SELECT id FROM employees WHERE first_name = ? and last_name = ?", employee, (err, results) => {
                        if (err) console.error(err);

                        const [{ id }] = results;

                        updateEmployee.push(id)

                        db.query("UPDATE employees SET role_id = ? WHERE id = ?", updateEmployee, (err, results) => {
                            if (err) console.error(err);

                            showAllEmployees();
                            console.log(`-Updated ${data.emp_name + "'s role to " + data.emp_newRole} in the database-`)
                        });
                    });
                });
            }
        });
}