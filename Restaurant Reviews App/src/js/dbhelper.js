/**
 * This file contains helper objects and methods within.
 * These methods depend on IDB, JQuery and Leaflet.js, so take care of including them before including this file.
 */

let dbPromise;

let DB_NAME = 'store';
let DB_VERSION = 1;

let RESTAURANT_STORE_NAME = 'restaurants';
let REVIEW_STORE_NAME = 'reviews';

let STORES = [RESTAURANT_STORE_NAME, REVIEW_STORE_NAME];

let IDBHelper = {

    init() {
        // Initialize if not already defined
        if (!dbPromise)
            dbPromise = idb.open(DB_NAME, DB_VERSION, upgradeDB => {
                let restaurantStore = upgradeDB.createObjectStore(RESTAURANT_STORE_NAME, {keyPath: 'id'});
                let reviewStore = upgradeDB.createObjectStore(REVIEW_STORE_NAME);
            });
    },

    restaurants: {

        addAll(restaurants) {
            return dbPromise.then(db => {
                const tx = db.transaction(STORES, 'readwrite');
                restaurants.forEach(restaurant => {
                    tx.objectStore(RESTAURANT_STORE_NAME).put(restaurant);
                });
                return tx.complete;
            });
        },

        getAll() {
            return dbPromise.then(db => {
                return new Promise(function (resolve, reject) {
                    dbPromise.then(db => {
                        const tx = db.transaction(STORES).objectStore(RESTAURANT_STORE_NAME).getAll();
                        return tx.then(function (restaurants) {
                            // Add URls
                            restaurants.map(r => r.url = `./restaurant.html?id=${r.id}`);
                            resolve(restaurants);

                        }).catch(function (error) {
                            reject(error);
                        });
                    })
                });
            });
        },

        getFiltered(filter = {}) {
            return new Promise(function (resolve, reject) {
                IDBHelper.restaurants.getAll().then(function (restaurants) {
                    // Filter here
                    let finalResults = restaurants;
                    if (filter.cuisine_type && filter.cuisine_type !== 'all') {
                        finalResults = finalResults.filter(r => r.cuisine_type === filter.cuisine)
                    }
                    if (filter.neighborhood && filter.neighborhood !== 'all') {
                        finalResults = finalResults.filter(r => r.neighborhood === filter.neighborhood)
                    }
                    if (filter.is_favorite) {
                        finalResults = finalResults.filter(r => r.is_favorite === filter.is_favorite)
                    }
                    resolve(finalResults);

                }).catch(function (error) {
                    reject(error);
                });
            });
        },

        getNeighborhoods() {
            return new Promise(function (resolve, reject) {
                IDBHelper.restaurants.getAll().then(function (restaurants) {
                    const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
                    // Remove duplicates from neighborhoods
                    const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) === i);
                    resolve(uniqueNeighborhoods);
                }).catch(function (error) {
                    reject(error);
                });
            });
        },

        getCuisines() {
            return new Promise(function (resolve, reject) {
                IDBHelper.restaurants.getAll().then(function (restaurants) {
                    const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
                    // Remove duplicates from cuisines
                    const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) === i);

                    resolve(uniqueCuisines);
                }).catch(function (error) {
                    reject(error);
                });
            });
        },

        getById(id) {
            return dbPromise.then(db => {
                return db.transaction(STORES).objectStore(RESTAURANT_STORE_NAME).get(id);
            });
        }
    },

    reviews: {
        getForRestaurant(restaurantId) {
            return dbPromise.then(db => {
                const tx = db.transaction(STORES, 'readwrite');

                return tx.complete;
            });
        }
    }
};

let NetworkHelper = {

    restaurants: {

        getAll() {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: DB_SERVER_BASE_URL + '/restaurants',
                    success(restaurants) {
                        resolve(restaurants)
                    },
                    error(xhr, status, error) {
                        console.log('XHR getAll() failed with error: ' + error);
                        reject(error)
                    }
                });
            });
        },

        getFavourites() {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: DB_SERVER_BASE_URL + '/restaurants?is_favorite=true',
                    success(favRestaurants) {
                        resolve(favRestaurants)
                    },
                    error(xhr, status, error) {
                        console.log('XHR getFavourites() failed with error :' + error);
                        reject(error)
                    }
                });
            });
        },

        getById(id) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: DB_SERVER_BASE_URL + '/restaurants/' + id,
                    success(restaurant) {
                        resolve(restaurant)
                    },
                    error(xhr, status, error) {
                        console.log('XHR getById() failed with error :' + error);
                        reject(error)
                    }
                });
            });
        }
    },

    reviews: {
        getForRestaurant(restaurantId) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: DB_SERVER_BASE_URL + '/reviews/?restaurant_id=' + restaurantId,
                    success(reviews) {
                        resolve(reviews)
                    },
                    error(xhr, status, error) {
                        console.log('XHR getForRestaurant() failed with error :' + error);
                        reject(error)
                    }
                });
            });
        }
    }
};

let UIHelper = {

    imgSrc(restaurant) {
        return (`/img/${restaurant.photograph}.jpg`);
    },

    imgSrcSet(restaurant) {
        return `/img/50/${restaurant.photograph}.jpg, /img/80/${restaurant.photograph}.jpg 1.5x, /img/${restaurant.photograph}.jpg  2x`;
    }
};

let MapHelper = {
    mapMarkerForRestaurant(restaurant, map) {
        // https://leafletjs.com/reference-1.3.0.html#marker
        const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
            {
                title: restaurant.name,
                alt: restaurant.name,
                url: restaurant.url
            });
        marker.addTo(newMap);
        return marker;
    }
};

let Helpers = {
    db: IDBHelper,
    network: NetworkHelper,
    ui: UIHelper,
    map: MapHelper
};

Helpers.db.init();
