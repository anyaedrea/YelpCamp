const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
  title: String,
  price: Number,
  description: String,
  location: String,
  image: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

//middleware that is triggered after a campground is deleted
//so that the associated reviews are deleted as well
campgroundSchema.post("findOneAndDelete", async function (doc) {
  console.log("DELETED CAMPGROUND");
  console.log(doc.reviews);
  if (doc) {
    await Review.remove({ _id: { $in: doc.reviews } });
  }
});

module.exports = mongoose.model("Campground", campgroundSchema);
