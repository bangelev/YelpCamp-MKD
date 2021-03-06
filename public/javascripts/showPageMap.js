// const campground = require('../../models/campground')

mapboxgl.accessToken = mapToken
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/outdoors-v11', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 7, // starting zoom
})

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h4>${campground.title}</h4><p>${campground.location}</p>`
        )
    )
    .addTo(map)

map.addControl(new mapboxgl.NavigationControl())