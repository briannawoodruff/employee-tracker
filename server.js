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
                    // addDepartment();
                    break;
                case "Add a role":
                    // addRole();
                    break;
                case "Add an employee":
                    // addEmployee();
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