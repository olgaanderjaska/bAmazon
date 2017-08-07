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

// Manager Welcome Screen
managerFront();

function managerFront() {
	console.log("Welcom to bAmazon Manager portal!Pick from the menu below.");


menuQuestions();
}

//show user list of actions
//based on user input runs appropriate function.
function menuQuestions(params) {
    inquirer.prompt([{
        type: 'list',
        name: 'input',
        message: 'Manager menu options:',
        choices: ['View Products', 'View Low Inventory', 'Add to Inventory', 'Add New Product', "** Exit **"]
    }]).then((action) => {
        switch (action.input) {
            case 'View Products':
                productsForSale();
                break;
            case 'View Low Inventory':
                lowInventory();
                break;
            case 'Add to Inventory':
                addToInventory();
                break;
            case 'Add New Product':
                addNewItem();
                break;
            case '** Exit **':
                connection.end();
                // productsForSale();
                break;
        }
    });
};

//show all available products from database
function viewProducts() {
    //table variable for printing database data nicely
    var table = new Table({ head: ["Id", "Product", "Price", "Stock Quantity"] });

    //Querying database for all data
    //Using INNER JOIN for selecting department name based on department_id from products table
    connection.query("SELECT products.item_id, products.product, products.price, products.stock_quantity FROM products INNER JOIN departments ON products.department_id = departments.department_id",
        (err, items) => {
            if (error) throw error;
            items.forEach((data) => {
                var elem = [];
                elem.push(data.item_id, data.product, data.price, data.stock_quantity);
                table.push(elem);
            });
            console.log(table.toString());
            menuQuestions();
        });
}

//show all products which quantity les than 5
function lowInventory() {
    //table variable for printing database data nicely
    var table = new Table({ head: ["Id", "Product", "Price", "Stock Quantity"] });

    connection.query("SELECT products.item_id, products.product, products.price, products.stock_quantity FROM products INNER JOIN departments ON products.department_id = departments.department_id",
        (err, items) => {
            if (error) throw error;
            items.forEach((data) => {
                var elem = [];
                if (data.stock_quantity < 5) {
                    elem.push(data.item_id, data.product, data.price, data.stock_quantity);
                    table.push(elem);
                }
            });
            console.log(table.toString());
            menuQuestions();
        });
}

//get user input (amount of new items and product id) and updating appropriate product quantity.
function addToInventory() {
    connection.query('SELECT * FROM products', (err, items) => {
        if (error) throw error;
        //saving list of all products to an array
        var choicesArray = [];
        items.forEach((item) => {
            choicesArray.push({ name: item.product_name + " | Quantity: " + item.stock_quantity, value: item.item_id });
        })

         //prompting user which product to update
        inquirer.prompt([{
            type: 'list',
            name: 'id',
            message: 'Select an item:',
            choices: choicesArray
        }, {
            type: "input",
            name: "amount",
            message: "How many items you want to add?"
        }]).then((action) => {
            //update product quantity based on id
            connection.query('UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id = ?', [action.amount, action.id], (err) => {
                if (error) throw error
                else console.log('Items quantity was successfully updated!');
                console.log('******************************************************************');
                menuQuestions();
            });
        });
    });
}

//add new product to products table.
function addNewItem() {
    connection.query('SELECT * FROM departments', (err, items) => {
        if (error) throw error;
        //saving list of all products to an array
        var choicesArray = [];
        items.forEach((item) => {
            choicesArray.push({ name: item.department_name, value: item.department_id });
        })
        inquirer.prompt([{
            type: "input",
            name: "product_name",
            message: "Name: "
        }, {
            type: 'list',
            name: 'department_id',
            message: 'Department: ',
            choices: choicesArray
        }, {
            type: "input",
            name: "price",
            message: "Price: "
        }, {
            type: "input",
            name: "quantity",
            message: "Quantity: "
        }]).then((item) => {
            connection.query("INSERT INTO products(product_name, department_id, price, stock_quantity) VALUES (?,?,?,?,0)", [item.name, item.department_id, item.price, item.quantity],
                (err) => { if (error) throw error; });
            console.log('Product was successfully added.');
            console.log('******************************************************************');
            menuQuestions();
        });
    });
}