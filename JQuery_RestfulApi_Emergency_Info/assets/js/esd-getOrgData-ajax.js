/*
 * @course ISTE.340.801 - Client Programming
 * @author Vjori Hoxha
 * @version 27.3.2019
 */

/**
 * Gets general data from Simon with given id and appends it to given path
 * @param {type} path Gets the container which appends the data retrieved from Simon
 * @param {type} id is the Organization Id which it will pull General data
 * @returns {undefined}
 */
function getGeneral(path, id) {
    $.ajax({
        method: "GET",
        cache: false,
        url: "proxy.php",
        data: {path: "/" + id + "/General"},
        dataType: "xml",
        success: function (response, status) {
            /*Appends to the given container, and loops through the response with each loop*/
            $(response).each(function () {
                path.append('Name: ' + $(this).find('name').text() + '<br>');
                path.append('Website: ' + $(this).find('website').text() + '<br>');
                path.append('Email: ' + $(this).find('email').text() + '<br>');
                path.append('Description: ' + $(this).find('description').text() + '<br>');
                path.append('Number of Members: ' + $(this).find('nummembers').text() + '<br>');
                path.append('Number of calls last year: ' + $(this).find('numcalls').text() + '<br>');
            });
        }
    });
}

/**
 * Function which takes id of container and coordinates, and creates a map with a marker on top of the location
 * @param {type} id The container id which this map is appended
 * @param {type} _lat The latitude needed for coordinates
 * @param {type} _lng The longitude needed for coordinates
 * @returns {undefined}
 */
function myMap(id, _lat, _lng) {
    let mapProp = {
        center: new google.maps.LatLng(_lat, _lng),
        zoom: 5
    };
    let map = new google.maps.Map(document.getElementById(id), mapProp);
    let marker = new google.maps.Marker({
        position: new google.maps.LatLng(_lat, _lng),
        map: map,
        title: 'Locations Map'
    });
}

/**
 * Gets the locations for the given organization type.
 * The locations are based on a logical dropdown select menu. For each
 * option chosen different data will be shown together with Google Maps.
 * These data use Show/Hide and stack containers on top of each other.
 * When you click an option it will show it and hide all the others
 * @param {type} path the container being appended to
 * @param {type} id the id of the org type
 * @returns {undefined}
 */
function getLocations(path, id) {
    let select = '';
    $.ajax({
        method: "GET",
        cache: false,
        url: "proxy.php",
        data: {path: "/" + id + "/Locations"},
        dataType: "xml",
        success: function (response, status) {
            let $count = $(response).find('count').text();
            path.append('<br><h3>Location Information</h3><br>');
            select += '<select onchange="testLocation()" id="locationSelect">'; //Sets onchange event on the dropdown select
            let locationId = 0;
            let mapId = 0;
            let initMap = 0;
            $('location', response).each(function () {
                select += '<option>' + 'Location: ' + $(this).find('type').text() + '</option>';
            });
            select += '</select>'; //appends the selects
            path.append(select);
            let dict = {};
            let addressArray = [];
            let records = '';
            let flag = 'block';
            records += '<h3>Locations</h3><br>';
            records += '<div class="container">';
            records += '<div class="row">'; // uses Bootstrap 4 table
            records += '<div class="col"><h4>Information</h4></div>';
            records += '<div class="col"><h4>Map</h4></div></div>';
            $('location', response).each(function () {
                records += '<div class="row">';
                records += '<div class="' + locationId++ + ' locations col" style="display:' + flag + ';">';
                records += 'Type: ' + $(this).find('type').text() + '<br>';
                records += 'Address: ' + $(this).find('address1').text() + ' ' + $(this).find('address2').text() + '<br>';
                records += 'City: ' + $(this).find('city').text() + '<br>';
                records += 'State: ' + $(this).find('state').text() + '<br>';
                records += 'County: ' + $(this).find('countyName').text() + '<br>';
                records += 'Zip: ' + $(this).find('zip').text() + '<br>';
                records += 'Phone: ' + $(this).find('phone').text() + '<br>';
                records += 'TTYPhone: ' + $(this).find('ttyPhone').text() + '<br>';
                records += 'Fax: ' + $(this).find('fax').text() + '<br>';
                records += 'Latitude: ' + $(this).find('latitude').text() + '<br>';
                /*Some time the latitude and longitude will be null, so we use the address in an array for later use
                 * so we can use geocoding api from google maps to convert the textual address to latitude and longitude*/
                if ($(this).find('latitude').text() === 'null' || $(this).find('longitude').text() === 'null') {
                    let address = $(this).find('state').text() + ' ' + $(this).find('city').text() + ' ' + $(this).find('address1').text();
                    addressArray.push(address);
                } else { /*means that we do not have latitude and longitude null, so we store the data into a javascript object as key value so we can
                 * access them later and use it*/
                    dict[$(this).find('latitude').text()] = $(this).find('longitude').text();
                }
                records += 'Longitude: ' + $(this).find('longitude').text() + '<br>';
                records += '</div>';
                //We give the map an id and a class
                records += '<div id="map' + initMap++ + '" class="' + mapId++ + ' locations col" style="display:' + flag + '; width: 300px; height: 300px;">Error occured with map ' + locationId + '</div>';
                flag = 'none'; // we keep only the first div display: block, so showed for the purpuse of having the first container showed, and the rest are hidden
                records += '</div>';
            });
            path.append(records);
            //key = latitude Value = longitude
            let num = 0;
            //If array that contains address is larger than 0, then we mean we are dealing with locations which have address and not longitude and latitude
            if (addressArray.length > 0) {
                for (let i = 0; i < addressArray.length; i++) {
                    //using the Geocoder, we go through addresses
                    let geocoder = new google.maps.Geocoder();
                    let address = addressArray[i];
                    geocoder.geocode({'address': address}, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            let latitude = results[0].geometry.location.lat();
                            let longitude = results[0].geometry.location.lng();
                            /*convert the address in latitude and longitude, and we pass to myMap function
                             the id of Map container together with latitude and longitude now translated from text to geo location number*/
                            myMap(("map" + i), latitude, longitude);
                        }
                    });
                }
            } else { //else we are dealing with plain latitude and longitude (records which have it not null
                for (const key of Object.keys(dict)) {
                    if (num === initMap) {
                        return;
                    }
                    myMap(("map" + num++), key, dict[key]); // get from the JS object the key and value
                }
            }
        }
    });
}

/**
 * Gets the training tab data for specific organization id and appends it to container
 * @param {type} path of the container that data will be appended
 * @param {type} id of the organization
 * @returns {undefined}
 */
function getTraining(path, id) {
    $.ajax({
        method: "GET",
        cache: false,
        url: "proxy.php",
        data: {path: "/" + id + "/Training"},
        dataType: "xml",
        success: function (response, status) {
            let records = '';
            records += '<h3>Training</h3><br>';
            records += '<div class="container">';
            records += '<div class="row">';
            records += '<div class="col"><h4>Type</h4></div>';
            records += '<div class="col"><h4>Abbreviation</h4></div></div>';
            $('training', response).each(function () {
                records += '<div class="row">';
                records += '<div class="col">' + $(this).find('type').text() + '</div>';
                records += '<div class="col">' + $(this).find('abbreviation').text() + '</div></div>';
            });

            records += '</div>';
            path.append(records);
        }
    });
}

/**
 * Gets the treatment tab data for specific organization id and appends it to container
 * @param {type} path of the container that data will be appended
 * @param {type} id of the organization
 * @returns {undefined}
 */
function getTreatment(path, id) {
    $.ajax({
        method: "GET",
        cache: false,
        url: "proxy.php",
        data: {path: "/" + id + "/Treatments"},
        dataType: "xml",
        success: function (response, status) {
            let records = '';
            records += '<h3>Treatments</h3><br>';
            records += '<div class="container">';
            records += '<div class="row">';
            records += '<div class="col"><h4>Type</h4></div>';
            records += '<div class="col"><h4>Abbreviation</h4></div></div>';
            $('treatment', response).each(function () {
                records += '<div class="row">';
                records += '<div class="col">' + $(this).find('type').text() + '</div>';
                records += '<div class="col">' + $(this).find('abbreviation').text() + '</div></div>';
            });

            records += '</div>';
            path.append(records);
        }
    });
}

/**
 * Gets the facilities tab data for specific organization id and appends it to container
 * @param {type} path of the container that data will be appended
 * @param {type} id of the organization
 * @returns {undefined}
 */
function getFacilities(path, id) {
    $.ajax({
        method: "GET",
        cache: false,
        url: "proxy.php",
        data: {path: "/" + id + "/Facilities"},
        dataType: "xml",
        success: function (response, status) {
            let records = '';
            records += '<h3>Facilities</h3><br>';
            records += '<div class="container">';
            records += '<div class="row">';
            records += '<div class="col"><h4>Name</h4></div>';
            records += '<div class="col"><h4>Quantity</h4></div>';
            records += '<div class="col"><h4>Description</h4></div></div>';
            $('facility', response).each(function () {
                records += '<div class="row">';
                records += '<div class="col">' + $(this).find('type').text() + '</div>';
                records += '<div class="col">' + $(this).find('quantity').text() + '</div>';
                records += '<div class="col">' + $(this).find('description').text() + '</div></div>';
            });

            records += '</div>';
            path.append(records);
        }
    });
}

/**
 * Gets the equipment tab data for specific organization id and appends it to container
 * @param {type} path of the container that data will be appended
 * @param {type} id of the organization
 * @returns {undefined}
 */
function getEquipment(path, id) {
    $.ajax({
        method: "GET",
        cache: false,
        url: "proxy.php",
        data: {path: "/" + id + "/Equipment"},
        dataType: "xml",
        success: function (response, status) {
            let records = '';
            records += '<h3>Equipments</h3><br>';
            records += '<div class="container">';
            records += '<div class="row">';
            records += '<div class="col"><h4>Type</h4></div>';
            records += '<div class="col"><h4>Quantity</h4></div>';
            records += '<div class="col"><h4>Description</h4></div></div>';
            $('equipment', response).each(function () {
                records += '<div class="row">';
                records += '<div class="col">' + $(this).find('type').text() + '</div>';
                records += '<div class="col">' + $(this).find('quantity').text() + '</div>';
                records += '<div class="col">' + $(this).find('description').text() + '</div></div>';
            });
            records += '</div>';
            path.append(records);
        }
    });
}

/**
 * Gets the physicians tab data for specific organization id and appends it to container
 * @param {type} path of the container that data will be appended
 * @param {type} id of the organization
 * @returns {undefined}
 */
function getPhysicians(path, id) {
    $.ajax({
        method: "GET",
        cache: false,
        url: "proxy.php",
        data: {path: "/" + id + "/Physicians"},
        dataType: "xml",
        success: function (response, status) {
            let records = '';
            records += '<h3>Physicians with Admitting Privileges</h3><br>';
            records += '<div class="container">';
            records += '<div class="row">';
            records += '<div class="col"><h4>Name</h4></div>';
            records += '<div class="col"><h4>License</h4></div>';
            records += '<div class="col"><h4>Contact</h4></div></div>';
            $('physician', response).each(function () {
                records += '<div class="row">';
                records += '<div class="col">' + $(this).find('fName').text() + ' ' + $(this).find('mName').text() + '. ' + $(this).find('lName').text() + '</div>';
                records += '<div class="col">' + $(this).find('license').text() + '</div>';
                records += '<div class="col">' + $(this).find('phone').text() + '</div></div>';
            });
            records += '</div>';
            path.append(records);
        }
    });
}
/**
 * Gets the people tab data for specific organization id and appends it to container
 * The people are collected in a logical way using select dropdown and each option is given an onchange event
 * each option is connected with an id# to a div container which holds data pulled from org id
 * @param {type} path of the container that data will be appended
 * @param {type} id of the organization
 * @returns {undefined}
 */
function getPeople(path, id) {
    let select = '';
    $.ajax({
        method: "GET",
        cache: false,
        url: "proxy.php",
        data: {path: "/" + id + "/People"},
        dataType: "xml",
        success: function (response, status) {
            let $count = $(response).find('siteCount').text();
            path.append('<br><h3>People</h3><br>');
            select += '<select onchange="peopleSelect()" id="peopleSelect">';
            let peopleId = 0;
            let records = '';
            let flag = 'block';
            $('site', response).each(function () {
                select += '<option value="' + $(this).attr('address') + $(this).attr('siteId') + '">' + $(this).attr('address') + '</option>';
            });
            select += '</select>';
            path.append(select);
            /*Uses key value for sites, so the item are the person data, so I can use it to pull the data later*/
            $('site', response).each(function (key, item) {
                records += '<div class="peep' + key + ' people" style="display:' + flag + ';">'; //same logic as locations
                records += '<table class="table table-striped">'; //bootstrap4 table
                records += '<thead><tr><th scope="col">Name</th><th scope="col">Role</th></tr></thead>';
                records += '<tbody>';
                $('person', item).each(function () {
                    /*We for each to the item in order to append to records variable the persons for that particular item
                     * note that a site might have more than one person, thats why this key,item logic works with my usual append, hide and show containers logic*/
                    records += '<tr><td id="w1">' + $(this).find('fName').text() + ' ' + $(this).find('lName').text() + '</td><td>' + $(this).find('role').text() + '</td></tr>';
                });
                records += '</tbody>';
                records += '</table>';
                records += '</div>';
                flag = 'none';
            });
            path.append(records);
        }
    });
}