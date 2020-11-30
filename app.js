const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const ejs = require("ejs");


const app = express();
app.set('view engine', 'ejs');

const defaultItem = [{ //Items in case database is empty
  name: "Add your Name",
  location: "Add your location"
}];
const notFoundMess = { //message in case no item is found on search
  name: "No name",
  location: "No location"
};

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('public'));

mongoose.connect('mongodb+srv://admin-ayush:test123@cluster0.ay3lb.mongodb.net/gogagaDB?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const dbSchema = mongoose.Schema({
  name: String,
  location: String
});

const Item = mongoose.model("item", dbSchema);

app.get("/", (req, res) => {
  Item.find({}, (err, result) => {
    if (err) console.error(err);
    if (result.length === 0) {
      res.render("home", {
        heading: "Home",
        items: defaultItem
      });
    } else {
      res.render("home", {
        heading: "Home",
        items: result
      });
    }
  });

  console.log("Home route");
});

app.get("/add", (req, res) => {
  res.render("add", {
    heading: "Add"
  });
  console.log("Add route");
});

app.post("/add", (req, res) => {
  const name = req.body.name;
  const location = req.body.location;
  const newItem = new Item({
    name: name,
    location: location
  });
  newItem.save(() => {
    res.redirect("/");
  });
});

app.get("/search", (req, res) => {
  res.render("search", {
    heading: "Search"
  });
  console.log("Search route");
});

app.post("/search", (req, res) => {
  const matcher = _.lowerCase(req.body.search);
  Item.find({}, (err, result) => {
    result.forEach((foundItem) => {
      const name = _.lowerCase(foundItem.name);
      const location = _.lowerCase(foundItem.location);
      if (name === matcher || location === matcher) {
        res.render("searchResult", {
          heading: "Found",
          item: foundItem
        });
        console.log("Found " + matcher + " at " + foundItem._id);
      }
    });
    res.render("searchResult", {
      heading: "Not found",
      item: notFoundMess
    });
  });
});



app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
