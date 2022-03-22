const mongoose = require("mongoose");
const express = require("express");
const app = express();
const path = require("path");
const Campground = require("./models/campground");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

mongoose
  .connect("mongodb://localhost:27017/yelp-camp")
  .then(() => {
    console.log("Connection open!");
  })
  .catch((error) => {
    console.log("ERROR!", error);
  });

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/makecampground", async (req, res) => {
  const camp = new Campground({ title: "backyard" });
  await camp.save();
  res.send(camp);
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
