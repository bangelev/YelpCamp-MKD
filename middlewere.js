const ExpressError = require('./utilities/ExpressError')
const Campground = require('./models/campground')
const { campgroundJoiSchema, reviewSchema } = require('./schemasJoi')
const Review = require('./models/review')

module.exports.isLogedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'U must be signed!')
        return res.redirect('/login')
    }
    next()
}

// JOi validation
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundJoiSchema.validate(req.body)
    if (error) {
        const msg = error.details.map((el) => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else next()
}
module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'U do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map((el) => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else next()
}

module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'U do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}