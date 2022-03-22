const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

mongoose
  .connect("mongodb://localhost:27017/yelp-camp")
  .then(() => {
    console.log("Connection open!");
  })
  .catch((error) => {
    console.log("ERROR!", error);
  });

const sample = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};
const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const city = sample(cities);
    const price = Math.floor(Math.random() * 20 + 10);
    const camp = new Campground({
      location: `${city.city}, ${city.state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: "https://source.unsplash.com/collection/484351",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur amet quae tempore quas. Delectus perspiciatis veniam sequi molestiae at et, ullam ipsum veritatis obcaecati natus ex quod nulla odit maiores?",
      price: price,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
