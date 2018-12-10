/**
 * UI controller for main screen.
 */
$(document).ready(function () {

    let mainUI = {

        map: null,
        markers: [],

        initMap: function () {
            this.map = L.map('map', {
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
            }).addTo(this.map);
        },

        showRestaurants: function (restaurants) {
            //this.restaurants = restaurants;
            this.updateNeighborhoods();
            this.updateCuisines();
            this.updateRestaurants();
        },

        showNoDataView: function () {
            // TODO Implement
        },

        showLoadingView: function () {
            // TODO Implement
        },

        updateNeighborhoods: function () {
            Helpers.db.restaurants.getNeighborhoods().then(neighborhoods => {
                neighborhoods.forEach(neighborhood => {
                    $('#neighborhoods-select').append($('<option>', {value: neighborhood, text: neighborhood}));
                });
                $('#neighborhoods-select').on('change', this.updateRestaurants)
            }).catch(error => {
                console.error(error);
            });
        },

        updateCuisines: function () {
            Helpers.db.restaurants.getCuisines().then(cuisines => {
                cuisines.forEach(cuisine => {
                    $('#cuisines-select').append($('<option>', {value: cuisine, text: cuisine}));
                });
                $('#cuisines-select').on('change', this.updateRestaurants)
            }).catch(error => {
                console.error(error);
            });
        },

        updateRestaurants: function () {
            let cuisine = $('#cuisines-select').find(":selected").val();
            let neighborhood = $('#neighborhoods-select').find(":selected").val();
            Helpers.db.restaurants
                .getFiltered({cuisine: cuisine, neighborhood: neighborhood})
                .then(restaurants => {
                    // Show restaurants in contents
                    $('#restaurants-grid').empty();
                    restaurants.forEach(restaurant => {
                        $('#restaurants-grid').append(Helpers.ui.restaurantElement(restaurant));
                    });

                    mainUI.updateMapMarkers(restaurants);

                }).catch(error => {
                console.error(error);
            });
        },

        updateMapMarkers: function (restaurants) {
            // Remove existing markers from map
            if (this.markers)
                this.markers.forEach(marker => marker.remove());
            this.markers = [];

            restaurants.forEach(restaurant => {
                const marker = Helpers.map.mapMarkerForRestaurant(restaurant, this.map);
                marker.on("click", () => window.location.href = marker.options.url);
                this.markers.push(marker);
            });
        }
    };

    mainUI.initMap();
    mainUI.showLoadingView();

    Helpers.network.restaurants.getAll()
        .then(function (restaurants) {
            Helpers.db.restaurants.addAll(restaurants);
            mainUI.showRestaurants(restaurants);
            // Fill reviews if possible
            restaurants.forEach(restaurant => {
                Helpers.network.reviews.getForRestaurant(restaurant.id).then(reviews => {
                    Helpers.db.reviews.addAll(reviews);
                });
            });
        })
        .catch(function (error) {
            // IF network fails, show data from local

            Helpers.db.restaurants.getAll().then(restaurants => {
                mainUI.showRestaurants(restaurants);
            }).then(error => {
                mainUI.showNoDataView();
            });

            console.log("NetworkHelper failed to load restaurants");
            console.log(error);
            M.toast({html: 'No Network! ＼(￣O￣)', classes: 'rounded'});
        });
});

