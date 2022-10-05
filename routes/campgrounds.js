const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const campgrounds = require('../controllers/campgrounds')

const passport = require('passport');
const LocalStrategy = require('passport-local')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')

const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')

router.route('/')
    .get(campgrounds.homepage)
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))


//view all of the camps
router.get('/all', catchAsync(campgrounds.index))

//new camp
router.get('/new', isLoggedIn, campgrounds.new)

//view a precise camp
router.route('/:id')
    .get(campgrounds.viewCampground)
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampgrounds))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
//edit campground
router.get('/:id/edit', isAuthor, isLoggedIn, catchAsync(campgrounds.editForm))
module.exports = router;