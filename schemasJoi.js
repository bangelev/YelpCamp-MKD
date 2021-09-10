const BaseJoi = require('joi')
const sanitizeHtml = require('sanitize-html')
const { validate } = require('./models/review')

//kreirame extenzija za JOi i mora da se dodade rules vo Joi validation
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!',
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                })
                if (clean !== value)
                    return helpers.error('string.escapeHTML', { value })
                return clean
            },
        },
    },
})
const Joi = BaseJoi.extend(extension)

//dodavame custem made validation od rules t.e. vo slucajov escapeHTML
module.exports.campgroundJoiSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        location: Joi.string().required().escapeHTML(),
        // image: Joi.string().required(),
        description: Joi.string().required().escapeHTML(),
    }).required(),
    deleteImages: Joi.array(),
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required(),
    }).required(),
})