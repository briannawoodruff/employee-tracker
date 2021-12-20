-- Display list from database functions
SELECT first_name, last_name FROM employees;
SELECT title FROM roles;
SELECT name FROM department;

-- View all departments
SELECT * FROM department;

-- View all roles
SELECT * FROM roles;

-- View all employees
SELECT * FROM employees;

-- Add a department
INSERT INTO department (name) VALUES ("Social");

-- Add a role
SELECT id FROM department WHERE name = "IT";
INSERT INTO roles (title, salary, department_id) VALUES ("Software Engineer", 100000, 4);

-- Add an employee
SELECT id FROM roles WHERE title = "Accountant";
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ("Mary", "Thompson", 1, 3);
SELECT id FROM employees WHERE first_name = "Mary" and last_name = "Thompson";

-- Update an employee role
SELECT id FROM roles WHERE title = "Accountant";
SELECT id FROM employees WHERE first_name = "Mary" and last_name = "Thompson";
UPDATE employees SET role_id = 3 WHERE id = 1;