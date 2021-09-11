if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const Campground = require('./models/campground')
const Review = require('./models/review')
    // const catchAsync = require('./utilities/catchAsync')
const ExpressError = require('./utilities/ExpressError')
const methodOverride = require('method-override')
const engine = require('ejs-mate')
const Joi = require('joi')
const session = require('express-session')
const flash = require('connect-flash')
const { campgroundJoiSchema, reviewSchema } = require('./schemasJoi')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')

// clean code
const userRoutes = require('./routes/users')
const campgroundsRoutes = require('./routes/campgrounds')
const reviewsRoutes = require('./routes/reviews')
    // const { Session } = require('inspector')

const MongoStore = require('connect-mongo')

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
    // const dbUrl = 'mongodb://localhost:27017/yelp-camp'

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
})
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
        console.log("We're connected do MONGODB!")
    })
    //mongoose deprication warning
mongoose.set('useFindAndModify', false)
    // start servet
const app = express()

// ejs mate setup
app.engine('ejs', engine)
    // ejs setap
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
    // encoding za params setup
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize())

//helmet config
const scriptSrcUrls = [
    'https://stackpath.bootstrapcdn.com',
    'https://api.tiles.mapbox.com',
    'https://api.mapbox.com',
    'https://kit.fontawesome.com',
    'https://cdnjs.cloudflare.com',
    'https://cdn.jsdelivr.net',
]
const styleSrcUrls = [
    'https://kit-free.fontawesome.com',
    'https://stackpath.bootstrapcdn.com',
    'https://api.mapbox.com',
    'https://api.tiles.mapbox.com',
    'https://fonts.googleapis.com',
    'https://use.fontawesome.com',
    'https://cdn.jsdelivr.net',
]
const connectSrcUrls = [
    'https://api.mapbox.com',
    'https://*.tiles.mapbox.com',
    'https://events.mapbox.com',
]
const fontSrcUrls = []
app.use(
        helmet.contentSecurityPolicy({
            directives: {
                defaultSrc: [],
                connectSrc: ["'self'", ...connectSrcUrls],
                scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
                styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
                workerSrc: ["'self'", 'blob:'],
                childSrc: ['blob:'],
                objectSrc: [],
                imgSrc: [
                    "'self'",
                    'blob:',
                    'data:',
                    'https://res.cloudinary.com/douqbebwk/', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                    'https://res.cloudinary.com/da1rwm8l6/', //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                    'https://images.unsplash.com',
                ],
                fontSrc: ["'self'", ...fontSrcUrls],
            },
        })
    )
    // Mongo Store Session Setup

const secret = process.env.SECRET || 'thisisbadsecret' // ZA DEVELOPMENT MODE
const store = new MongoStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 3600, // time period in seconds Lazy Session Update
})
store.on('error', function(e) {
        console.log('Mongo Store Errror', e)
    })
    // Session Config

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
}
app.use(session(sessionConfig))
app.use(flash())

//PASSPORT SETIGS
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
    //PASSPORT METHODS
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
app.use((req, res, next) => {
        // console.log(req.query)
        if (!['/login', '/'].includes(req.originalUrl)) {
            req.session.returnTo = req.originalUrl
        }
        res.locals.currentUser = req.user
        res.locals.success = req.flash('success')
        res.locals.error = req.flash('error')
        next()
    })
    // basic route
app.get('/', (req, res) => {
    res.render('home')
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)

// reviews

// If nothing hits the rout
app.all('*', (req, res, next) => {
        next(new ExpressError('Page NOT FOUND', 404))
    })
    // error handler middlewere
app.use((err, req, res, next) => {
        const { statusCode = 500 } = err
        if (!err.message) err.message = 'Neshto ne e ko sho trebit, ebate'
        res.status(statusCode).render('error', { err })
    })
    // app listen t.e server
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})