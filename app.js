const mongoose = require("mongoose");
const express = require("express");
const ejsMate = require("ejs-mate");
const app = express();
const path = require("path");
const Campground = require("./models/campground");
const Review = require("./models/review");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const catchAsync = require("./utils/catchAsync");
const { campgroundSchema, reviewSchema } = require("./joiSchemas");
const { findById, findByIdAndUpdate } = require("./models/campground");

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    console.log(error.message);
    throw new ExpressError(400, error.message);
  } else next();
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    console.log(error.message);
    throw new ExpressError(400, error.message);
  } else next();
};

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

app.get(
  "/campgrounds",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.post(
  "/campgrounds",
  validateCampground,
  catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render("campgrounds/edit", { campground });
  })
);

app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate("reviews");
    res.render("campgrounds/show", { campground });
  })
);

app.put(
  "/campgrounds/:id",
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(
      id,
      { ...req.body.campground },
      {
        runValidators: true,
        new: true,
      }
    );
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.post(
  "/campgrounds/:id/reviews",
  validateReview,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const review = new Review(req.body.review);
    const campground = await Campground.findById(id);
    campground.reviews.push(review);
    await campground.save();
    await review.save();
    res.redirect(`/campgrounds/${id}`);
  })
);

app.delete(
  "/campgrounds/:id/reviews/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    //delete the review's reference in the campground's reviews array
    await Campground.findByIdAndUpdate(id, {
      $pull: {
        reviews: reviewId,
      },
    });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
  })
);

app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

app.all("*", (req, res, next) => {
  //for any path that is not defined, this code will run
  return next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(status).render("error", { err });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
