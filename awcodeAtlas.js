//jshint esversion:8

// Import necessary NPM modules required for the application
const express = require("express"); // Express framework for handling HTTP requests
const bodyParser = require("body-parser"); // Middleware to parse the body of HTTP requests
const mongoose = require("mongoose"); // ODM library for MongoDB
const _ = require("lodash"); // Utility library for manipulating and working with arrays, numbers, objects, strings, etc.

// Initialize the express application
const app = express();

// Set EJS as the templating engine to dynamically render HTML pages
app.set('view engine', 'ejs');

// Configure body-parser middleware to parse form data and serve static files from the "public" directory
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Evita crear listas con las peticiones automáticas del navegador.
app.get("/favicon.ico", (req, res) => {
    res.status(204).end();
});

app.get("/robots.txt", (req, res) => {
    res.type("text/plain").send("User-agent: *\nDisallow: /");
});

// Esta ruta debe ir antes de la ruta de listas personalizadas.
app.get("/about", (req, res) => {
    res.render("about");
});
// Connect to a MongoDB database named todolistDB with a deprecation fix for the URL parser
//mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });
//const MONGODB_ATLAS_URI = "mongodb+srv://fjbanezares:Pepito123@cluster0.h5kauwo.mongodb.net/?retryWrites=true&w=majority"



const MONGODB_ATLAS_URI = process.env.MONGODB_URI;


// Define a schema for the items in the to-do list, consisting of a single field 'name'
// Each Item (task in a To Do List) will have only one field (a string)
const itemsSchema = {
    name: String
};

// Create a Mongoose model for items using the defined schema
// Mongoose uses a Model to read and write elements with a clear Schema
const Item = mongoose.model("Item", itemsSchema);

// Instantiate default items to populate the to-do list initially
const item1 = new Item({ name: "Welcome to your todolist!" });
const item2 = new Item({ name: "Hit the + button to add a new item." });
const item3 = new Item({ name: "<-- Hit this to delete an item." });
const defaultItems = [item1, item2, item3]; // Group default items into an array

// Define a schema for custom lists which includes a name and an array of itemSchema
const listSchema = {
    name: String,
    items: [itemsSchema]
};

// Create a model for custom lists using the defined schema
const List = mongoose.model("List", listSchema);

// Handle GET requests to the home route "/" which displays the default to-do list
app.get("/", async (req, res) => {
    try {
        // Attempt to find all items in the database
        const foundItems = await Item.find({});
        // If no items found, insert the default items and redirect to the home route
        if (foundItems.length === 0) {
            await Item.insertMany(defaultItems);
            res.redirect("/");
        } else {
            // If items are found, render the 'list' EJS template with the found items
            const allLists = await List.find({}, "name").sort({ name: 1 });

res.render("list", {
    listTitle: "Today",
    newListItems: foundItems,
    allLists: allLists
});
            
        }
    } catch (err) {
        // Log any errors and send a server error response
        console.log(err);
        res.status(500).send("Error retrieving items");
    }
});

// Handle GET requests for custom list names. This allows users to create and view custom lists
// async is the "promise" this anonymous function will use asynchroniciy
app.get("/:customListName", async (req, res) => {
    // Capitalize the custom list name to maintain consistent naming convention
    const customListName = _.capitalize(req.params.customListName);

    try {
        // Check if a list with the custom name already exists
        const foundList = await List.findOne({ name: customListName });
        // If not, create a new list with the custom name and default items, then redirect to it
        if (!foundList) {
            const list = new List({
                name: customListName,
                items: defaultItems
            });
            await list.save();
            res.redirect("/" + customListName);
        } else {
            // If the list exists, render it with its items
            const allLists = await List.find({}, "name").sort({ name: 1 });

res.render("list", {
    listTitle: foundList.name,
    newListItems: foundList.items,
    allLists: allLists
});
        }
    } catch (err) {
        // Log any errors and send a server error response
        console.log(err);
        res.status(500).send("Error finding the list");
    }
});

// Handle POST requests to add a new item to either the default or a custom list
app.post("/", async (req, res) => {
    const itemName = req.body.newItem; // Extract the new item's name from the request body
    const listName = req.body.list; // Determine which list to add the item to
    const item = new Item({ name: itemName }); // Create a new item document

    // If adding to the default 'Today' list, save the item and redirect to home
    if (listName === "Today") {
        await item.save();
        res.redirect("/");
    } else {
        // If adding to a custom list, find the list and push the new item to its items array
        try {
            const foundList = await List.findOne({ name: listName });
            foundList.items.push(item);
            await foundList.save();
            res.redirect("/" + listName);
        } catch (err) {
            // Log any errors and send a server error response
            // The code includes error handling for the case where there's an issue finding a custom list or saving the item. In such cases, 
            // an error message is logged to the console, and a 500 server error response is sent to the client.
            console.log(err);
            res.status(500).send("Error saving the item");
        }
    }
});

// Handle POST requests to delete an item from either the default or a custom list
app.post("/delete", async (req, res) => {
    const checkedItemId = req.body.checkbox; // Get the ID of the item to delete
    const listName = req.body.listName; // Determine from which list to delete the item

    try {
        // If deleting from the default 'Today' list, delete the item by its ID and redirect to home
        if (listName === "Today") {
            await Item.findByIdAndDelete(checkedItemId);
            res.redirect("/");
        } else {
            // If deleting from a custom list, update the list by pulling the item from its items array
            await List.findOneAndUpdate(
                { name: listName },
                { $pull: { items: { _id: checkedItemId } } }
            );
            res.redirect("/" + listName);
        }
    } catch (err) {
        // Log any errors and send a server error response
        console.log(err);
        res.status(500).send("Error deleting the item");
    }
});


const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    if (!MONGODB_ATLAS_URI) {
        console.error("Falta configurar la variable MONGODB_URI.");
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGODB_ATLAS_URI, {
            dbName: "todolistDB"
        });

        console.log("Conectado a MongoDB Atlas: todolistDB");

        app.listen(PORT, "0.0.0.0", () => {
            console.log("Servidor iniciado en el puerto", PORT);
        });
    } catch (error) {
        console.error(
            "No se ha podido conectar con Atlas. Revisa la conexión, las credenciales y el acceso de red."
        );
        process.exit(1);
    }
}

iniciarServidor();