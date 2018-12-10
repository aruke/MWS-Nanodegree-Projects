/**
 * Initialize map as soon as the page is loaded.
 */
$(document).ready(function () {

    let getParameterByName = (name, url) => {
        if (!url)
            url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
            results = regex.exec(url);
        if (!results)
            return null;
        if (!results[2])
            return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    };

    let detailUI = {

        restaurant: {},
        map: null,

        init: (restaurant) => {

            detailUI.restaurant = restaurant;

            detailUI.initMap(restaurant);

            detailUI.fillRestaurantHTML(restaurant);

            // Fill breadcrumb navigation
            $('#breadcrumb').append($('<li>', {text: restaurant.name}));
        },

        initMap: (restaurant) => {
            this.map = L.map('map', {
                center: [restaurant.latlng.lat, restaurant.latlng.lng],
                zoom: 16,
                scrollWheelZoom: false
            });
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
                mapboxToken: MAPBOX_API_KEY,
                maxZoom: 18,
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                id: 'mapbox.streets'
            }).addTo(this.map);
            Helpers.map.mapMarkerForRestaurant(restaurant, this.map);
        },

        fillRestaurantHTML: (restaurant) => {
            const name = document.getElementById('restaurant-name');
            name.innerHTML = restaurant.name;

            const address = document.getElementById('restaurant-address');
            address.innerHTML = restaurant.address;

            const image = document.getElementById('restaurant-img');
            image.className = 'restaurant-img';
            image.src = Helpers.ui.imgSrc(restaurant);
            image.srcSet = Helpers.ui.imgSrcSet(restaurant);
            image.alt = restaurant.name + ' Restaurant';

            const cuisine = document.getElementById('restaurant-cuisine');
            cuisine.innerHTML = restaurant.cuisine_type;

            // fill operating hours
            if (restaurant.operating_hours) {
                detailUI.fillRestaurantHoursHTML(restaurant.operating_hours);
            }
        },

        fillRestaurantHoursHTML: (operatingHours) => {
            const hours = document.getElementById('restaurant-hours');
            for (let key in operatingHours) {
                const row = document.createElement('tr');

                const day = document.createElement('td');
                day.innerHTML = key;
                row.appendChild(day);

                const time = document.createElement('td');
                time.innerHTML = operatingHours[key];
                row.appendChild(time);

                hours.appendChild(row);
            }
        },

        fillReviewsHTML: (reviews) => {
            const container = document.getElementById('reviews-container');
            const title = document.createElement('h3');
            title.innerHTML = 'Reviews';
            container.appendChild(title);

            if (!reviews) {
                const noReviews = document.createElement('p');
                noReviews.innerHTML = 'No reviews yet!';
                container.appendChild(noReviews);
                return;
            }
            const ul = document.getElementById('reviews-list');
            reviews.forEach(review => {
                ul.appendChild(detailUI.createReviewHTML(review));
            });
            container.appendChild(ul);
        },

        createReviewHTML: (review) => {
            const li = document.createElement('li');
            const name = document.createElement('p');
            name.innerHTML = review.name;
            li.appendChild(name);

            var date = new Date(review.updatedAt);
            var options = {weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'};
            var formattedDateString = date.toLocaleDateString('us-EN', options);
            const dateElement = document.createElement('p');
            dateElement.innerHTML = formattedDateString;
            li.appendChild(dateElement);

            const rating = document.createElement('p');
            rating.innerHTML = `Rating: ${review.rating}`;
            li.appendChild(rating);

            const comments = document.createElement('p');
            comments.innerHTML = review.comments;
            li.appendChild(comments);

            return li;
        }
    };

    let id = getParameterByName('id');
    if (!id) { // no id found in URL
        console.error('No restaurant id in URL');
        // Fallback to some ID
        id = 1;
    }

    Helpers.db.restaurants.getById(id).then((restaurant) => {
        detailUI.init(restaurant);
    }).catch(error => {
        console.error(error);
    });

    Helpers.network.reviews.getForRestaurant(id).then(reviews => {
        Helpers.db.reviews.addAll(reviews);
        detailUI.fillReviewsHTML(reviews);
    }).catch(error => {
        Helpers.db.reviews.getForRestaurant(id).then(reviews => {
            detailUI.fillReviewsHTML(reviews);
        }).then(error => {
            // Show error
        });
    });
});
