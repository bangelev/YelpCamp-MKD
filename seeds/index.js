const mongoose = require('mongoose')
const Campground = require('../models/campground')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')

const dbUrl = process.env.DB_URL || process.env.DB_LOCAL

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

const sample = (array) => array[Math.floor(Math.random() * array.length)]
const seedDB = async() => {
    await Campground.deleteMany({})
    for (let i = 0; i < 100; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            author: '62bc37a3ad3ff13ee4e2a2af',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ],
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [{
                    url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ahfnenvca4tha00h2ubt.png',
                    filename: 'YelpCamp/ahfnenvca4tha00h2ubt',
                },
                {
                    url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ruyoaxgf72nzpi4y6cdi.png',
                    filename: 'YelpCamp/ruyoaxgf72nzpi4y6cdi',
                },
            ],
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nesciunt amet, tenetur, doloribus odit sed, aliquam perspiciatis eum illo voluptatibus enim quibusdam delectus. Earum labore eveniet quibusdam reprehenderit. Aperiam, corrupti magni!',
            price,
        })
        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})