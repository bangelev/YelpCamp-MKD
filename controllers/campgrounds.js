const Campground = require('../models/campground')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
const { cloudinary } = require('../cloudinaryConfig/index')

module.exports.index = async(req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async(req, res, next) => {
    // if (!req.body.campground)
    //     throw new ExpressError('Invalid Capmground Data', 400)
    const geoData = await geocoder
        .forwardGeocode({
            query: req.body.campground.location,
            limit: 1,
        })
        .send()
    const campground = new Campground(req.body.campground)
    campground.geometry = geoData.body.features[0].geometry
    campground.images = req.files.map((f) => ({
        url: f.path,
        filename: f.filename,
    }))
    campground.author = req.user._id
    await campground.save()

    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async(req, res) => {
    const camp = await Campground.findById(req.params.id)
        .populate({ path: 'reviews', populate: { path: 'author' } })
        .populate('author')

    if (!camp) {
        req.flash('error', 'Cannot find campground')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { camp })
}

module.exports.renderEditForm = async(req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Cannot find campground')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async(req, res) => {
    const { id } = req.params
        //Geo nov
    const geoData = await geocoder
        .forwardGeocode({
            query: req.body.campground.location,
            limit: 1,
        })
        .send()

    const campground = await Campground.findByIdAndUpdate(id, {
        ...req.body.campground,
    })

    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }))
    campground.images.push(...imgs)

    await campground.save()

    if (req.body.deleteImages) {
        for (let file of req.body.deleteImages) {
            await cloudinary.uploader.destroy(file)
            await campground.updateOne({
                $pull: { images: { filename: file.trim() } },
            })
        }
    }
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async(req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'U delete campground')
    res.redirect('/campgrounds')
}