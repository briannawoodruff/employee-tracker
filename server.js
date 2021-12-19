require('dotenv').config();
const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');

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
                choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role", "Quit", new inquirer.Separator()]
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
                case "Update an employee role":
                    // updateEmployee();
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

        employeeList.push("None");

        for (var i = 0; i < results.length; i++) {
            employeeList.push(results[i].first_name + " " + results[i].last_name);
        }

        employeeList.push(new inquirer.Separator());
    })
    return employeeList;
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
                choices: selectEmployee()
            },

        ])
        .then(data => {
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
                    const managerId = data.emp_manager.split(' ')
                    const removeLastName = managerId.pop()

                    db.query("SELECT id FROM employees WHERE first_name = ?", managerId, (err, results) => {
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