# Employee Tracker
  ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## Description

This project creates a database for which we can use the terminal to monitor various aspects of our company. We can view departments, roles, employees, and even query some interesting things. We can assign different roles and departments to our employees, we can view what each role has for a salary, and we can even change who is a manager to who.  We also have the ability to create new roles, new employees, and new departments. And when we are feeling like we've had enough of them, we can delete those same things we created. If you wanna feel powerful, don't just remove an employee, remove an entire department. BAM!  This project was a lot of work, but also a lot of fun to see how we can manipulate and change a database using just functions and terminal commands to execute them.  The issue that I ran into with this project is that I ended up populating one file way way way too much.  When I looked at trying to splice it up and put it in different more manageable parts, it ended up just breaking left and right.  Something to keep in mind the next time I build a project like this from the ground up."

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Contributing](#contributing)
- [Tests](#tests)
- [Questions](#questions)

## Installation

This project is all backend stuff.  You will need to make sure to have node and install the appropriate npms.  Those npms include mysql2, inquirer (a specific version 8.2.4, cli-table3, and dotenv for keeping our personal files personal.

## Usage
![Employee Tracker example screenshot](/assets/employeetrackerdbexample1.png)
---
![Employee Tracker example screenshot](/assets/employeetrackerdbexample2.png)
---
![Employee Tracker example screenshot](/assets/employeetrackerdbexample3.png)
---
[Video link of demonstration](https://drive.google.com/file/d/1dKqDk0G-KdIYp2ki8z7iKVzLL1JkjgkV/view)

Start by doing npm installs for all our npms.  npm install, npm install mysql2, npm i inquirer@8.2.4, npm install cli-table3. You may also need to initialize the database.  You will run the mysql command on your terminal, followed by SOURCING the schema, and the seed files so that you have a basic db built.  After that you can exit mysql, and simply type in node server.js to start up the prompts that will lead you through your database.

## License

This project is licensed under the MIT license. ([MIT License](https://opensource.org/licenses/MIT)) for more details.

## Contributing

ASCII art.  
doh.flf by Curtis Wanner (cwanner@acs.bu.edu)
latest revision - 4/95

## Tests

Tests are not required for this project.

## Questions

If you have any questions, please contact me:

- GitHub: [slemjosh](https://github.com/slemjosh)
- Email: [joshua.slem@gmail.com](mailto:joshua.slem@gmail.com)