const express = require('express')
const router = express.Router()
const catchAsync = require('../utilities/catchAsync')
const ExpressError = require('../utilities/ExpressError')
const Campground = require('../models/campground')
const { campgroundJoiSchema } = require('../schemasJoi')
const { isLogedIn, isAuthor, validateCampground } = require('../middlewere')
const campgrounds = require('../controllers/campgrounds')
const { route } = require('./users')
const multer = require('multer')
const { storage } = require('../cloudinaryConfig/index') //ne mora /index - node avtomatski bara index.js
const upload = multer({ storage })

// index page

router
    .route('/')
    .get(catchAsync(campgrounds.index))
    .post(
        isLogedIn,
        upload.array('image'),
        validateCampground,
        catchAsync(campgrounds.createCampground)
    )

router.get('/new', isLogedIn, campgrounds.renderNewForm)

router
    .route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(
        isLogedIn,
        isAuthor,
        upload.array('image'),
        validateCampground,
        catchAsync(campgrounds.updateCampground)
    )
    .delete(isLogedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get(
    '/:id/edit',
    isLogedIn,
    isAuthor,
    catchAsync(campgrounds.renderEditForm)
)

module.exports = router