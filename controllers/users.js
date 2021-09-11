const User = require('../models/user')

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register')
}

module.exports.register = async(req, res) => {
    try {
        const { email, username, password } = req.body
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, (err) => {
            if (err) return next(err)
            req.flash('success', 'Wellcomme to HAWAI Campground')
            res.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    req.flash('success', 'Wellcome back, beach!!!')
        // const redirectUrl ??= '/campgrounds'
    const redirectUrl = req.session.returnTo || '/campgrounds'
        // console.log(redirectUrl)
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res) => {
    req.logOut()
    req.flash('success', 'Bye,bye my love')
    res.redirect('/campgrounds')
}