let restaurants,
    neighborhoods,
    cuisines;
var newMap;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
$(document).ready(function () {
    registerServiceWorker();
    initMap();
    fetchNeighborhoods();
    fetchCuisines();

    NetworkHelper.restaurants.getAll()
        .then(function (restaurants) {
            IDBHelper.restaurants.addAll(restaurants)
        })
        .catch(function (error) {
            // TODO Show network error
            console.log("NetworkHelper failed to load restaurants");
            console.log(error);
        });
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
    Helpers.db.restaurants.getNeighborhoods().then(neighborhoods => {
        self.neighborhoods = neighborhoods;
        fillNeighborhoodsHTML();
    }).catch(error => {
        console.error(error);
    });
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        select.append(option);
    });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
    Helpers.db.restaurants.getCuisines().then(cuisines => {
        self.cuisines = cuisines;
        fillCuisinesHTML();
    }).catch(error => {
        console.error(error);
    });
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
    });
};

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
    self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
    });
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: MAPBOX_API_KEY,
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(newMap);

    updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    Helpers.db.restaurants
        .getFiltered({cuisine: cuisine, neighborhood: neighborhood})
        .then(restaurants => {
            resetRestaurants(restaurants);
            fillRestaurantsHTML();
        }).catch(error => {
        console.error(error);
    });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
    // Remove all restaurants
    self.restaurants = [];
    const ul = document.getElementById('restaurants-grid');
    ul.innerHTML = '';

    // Remove all map markers
    if (self.markers) {
        self.markers.forEach(marker => marker.remove());
    }
    self.markers = [];
    self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
    const ul = document.getElementById('restaurants-grid');
    restaurants.forEach(restaurant => {
        ul.append(createRestaurantHTML(restaurant));
    });
    addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
    const element = document.createElement('div');
    element.classList.add("restaurant-item");

    const image = document.createElement('div');
    image.className = 'image';
    const img = document.createElement('img');
    img.alt = restaurant.name + ' Restaurant';
    img.src = Helpers.ui.imgSrc(restaurant);
    img.srcset = Helpers.ui.imgSrcSet(restaurant);
    image.append(img);
    element.append(image);

    const name = document.createElement('span');
    name.className = 'title';
    name.innerHTML = restaurant.name;
    element.append(name);

    const contents = document.createElement('div');
    contents.className = 'content';
    const information = document.createElement('p');
    information.innerHTML = restaurant.neighborhood + '</br>' + restaurant.address;
    contents.append(information);
    element.append(contents);

    const action = document.createElement('div');
    action.className = 'action';
    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.href = restaurant.url;
    action.append(more);
    element.append(action);

    return element
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
    restaurants.forEach(restaurant => {
        // Add marker to the map
        const marker = Helpers.map.mapMarkerForRestaurant(restaurant, self.newMap);
        marker.on("click", onClick);

        function onClick() {
            window.location.href = marker.options.url;
        }

        self.markers.push(marker);
    });

};

/**
 * Registers service worker.
 */
registerServiceWorker = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js', {scope: '/'})
            .then(function () {
                console.log("ServiceWorker registered.");
            }).catch(function () {
            console.log("Service worker registration failed.");
        });
    } else {
        console.log("ServiceWorker not available for current browser.");
    }
};

