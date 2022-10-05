const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground')
const Review = require('../models/review')

const reviews = require('../controllers/reviews')
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware')

const catchAsync = require('../utils/catchAsync')
const expressError = require('../utils/ExpressError')


//post review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.newReview))

//delete review
router.delete('/:reviewId', isReviewAuthor, isLoggedIn, catchAsync(reviews.deleteReview))

module.exports = router;