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

-- Update an employee role