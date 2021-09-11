const express = require('express')
const router = express.Router({ mergeParams: true })
const catchAsync = require('../utilities/catchAsync')
const ExpressError = require('../utilities/ExpressError')
const Campground = require('../models/campground')
const Review = require('../models/review')
const { validateReview, isLogedIn, isReviewAuthor } = require('../middlewere')
const reviews = require('../controllers/reviews')

router.post('/', isLogedIn, validateReview, catchAsync(reviews.createReview))

// delete reviewa
router.delete(
    '/:reviewId',
    isLogedIn,
    isReviewAuthor,
    catchAsync(reviews.deleteReview)
)

module.exports = router