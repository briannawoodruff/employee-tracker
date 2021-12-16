INSERT INTO department (name)
VALUES ("Accounting"),
       ("Marketing"),
       ("Human Resources"),
       ("IT"),
       ("Operations");


INSERT INTO roles (title, salary, department_id)
VALUES ("Software Engineer", 100000, 4),
       ("Accountant", 80000, 1),
       ("Graphic Designer", 60000, 2),
       ("Project Manager", 120000, 5), 
       ("Data Analyst", 70000, 2),
       ("Network Security Specialist", 112000, 4),
       ("HR Coordinator", 60000, 3);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ("Joan", "Allen", 2, null),
       ("Anne", "Johnson", 3, 6),
       ("David", "Richmond", 6, null),
       ("Mary", "Thompson", 1, 3), 
       ("Josh", "Robert", 5, 3),
       ("Becca", "White", 4, null),
       ("Frank", "Markinson", 7, null);