-- Create or Even Delete the initial database
DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;
USE employee_db;

-- Tables in the Database

-- departments
CREATE TABLE departments(
    id INT NOT NULL AUTO_INCREMENT,
    dept_name VARCHAR(30) NOT NULL,
    PRIMARY KEY(id)

);

-- roles
CREATE TABLE roles(
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL,
    salary INT NOT NULL, 
    department_id INT, 
    PRIMARY KEY (id),
    FOREIGN KEY (department_id)
    REFERENCES departments(id)
    ON DELETE CASCADE

);

-- employee
CREATE TABLE employees(
    id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30) NOT NULL, 
    last_name VARCHAR(30) NOT NULL, 
    role_id INT, 
    manager_id INT, 
    PRIMARY KEY(id), 
    FOREIGN KEY (role_id)
    REFERENCES roles(id)
    ON DELETE CASCADE, 
    FOREIGN KEY (manager_id)
    REFERENCES employees(id)
    ON DELETE SET NULL
);