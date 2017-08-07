//import libraries
var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');

// mySQL config variable
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon_db"
});

//Supervisor Welcome Screen
supervisorFront();

function supervisorFront() {
	console.log("Welcome to bAmazon Supervisor Screen! Pick from the menue below.");

menuScreen();

} 

//show user list of menu
//based on user input runs appropriate function.
function menuScreen() {
    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'Select an action:',
        choices: ['View Product Sales by Department', 'Create New Department', '***Exit***']
    }]).then((answers) => {
        switch (answers.action) {
            case 'View Product Sales by Department':
                productsSales();
                break;
            case 'Create New Department':
                newDepartment();
                break;
            case '***Exit***':
                connection.end();
                break;
        }
    })
}

//show data from departments table
//calculating total profit and add column to the output 
function productsSales() {
    //table variable for printing database data nicely
    var table = new Table({ head: ["Id", "Department Name", "Overhead Costs", "Product Sales", " Total Profit"] });

    connection.query('SELECT department_id, department_name, over_head_cost, total_sales, (total_sales - over_head_cost) as total_profit FROM departments',
        (err, row) => {
            if (err) throw err;
            row.forEach(function(data) {
                var elem = [];
                elem.push(data.department_id, data.department_name, data.over_head_cost, data.total_sales, data.total_profit);
                table.push(elem);
            });
            console.log(table.toString());
            menuScreen();
        })
}

//function to add new department
function newDepartment() {
    inquirer.prompt([{
        type: "input",
        name: "department_name",
        message: "department name: "
    }, {
        type: "input",
        name: "over_head_cost",
        message: "Overhead cost: "
    }]).then((item) => {
        connection.query("INSERT INTO departments(department_name,over_head_cost, total_sales) VALUES (?,?,0)", [item.department_name, item.over_head_cost],
            (err) => { if (error) throw error; });
        console.log('Department was successfully added.');
        console.log('******************************************************************');
        menuScreen();
    })
}
     
	

