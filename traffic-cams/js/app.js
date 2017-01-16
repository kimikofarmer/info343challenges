/*
    app.js
    main script file for this mapping application
    source data URL: https://data.seattle.gov/resource/65fc-btcc.json
*/

$(function() {
	'use strict';

	var map = L.map('map').setView([47.6097, -122.3331], 12);

	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

	var marker;

	// Adds markers, color codes markers according to camera provider, and counts
	// how many of each WSDOT and SDOT cameras there are to output on the page
	function addMarkers(data) {
		var wsdot = 0;
		var sdot = 0;
		for (var i = 0; i < data.length; i++) {
			var lat = data[i].location.latitude;
			var long = data[i].location.longitude;
			var cam = data[i].ownershipcd;
			var label = data[i].cameralabel;
			var image = data[i].imageurl.url;
			marker = L.circleMarker([lat, long]).addTo(map).bindPopup('<h2>' + label + '</h2> <img src="' + image + '" class="view">');
			if (cam == "WSDOT") {
				marker.setStyle({fillColor: '#FF0000', color: '#FF0000'});
				wsdot++;
			} else {
				marker.setStyle({fillColor: '#0147FA', color: '#0147FA'})
				sdot++;
			}
		}
		$('#sdotCount').text(sdot);
		$('#wsdotCount').text(wsdot);
	}

	// Takes the user input from the search bar and will filter out the cameras 
	// with names that don't contain their input
	$.getJSON( "https://data.seattle.gov/resource/65fc-btcc.json").then(function(data) {
		addMarkers(data);
		var filtered = document.getElementById('marker-filter-field');
		filtered.addEventListener('keyup', function() {
			var filter = this.value.toLowerCase();
			var filteredCams = data.filter(function(data) {
				return data.cameralabel.toLowerCase().indexOf(filter) >= 0;
			});
			$(".leaflet-clickable").remove();
			addMarkers(filteredCams);
		});
	});
});