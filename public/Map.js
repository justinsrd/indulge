import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MapConfig from './MapConfig';

class Map extends Component {
	constructor(props) {
		super(props);
	}

	componentWillMount() {
		function loadScriptAsync(src) {
			const tag = document.createElement('script');
			tag.async = true;
			tag.defer = true;
			tag.src = src;
			document.getElementsByTagName('body')[0].appendChild(tag);
		}

		loadScriptAsync('https://maps.googleapis.com/maps/api/js?key=AIzaSyDZXiq8rbR9uT8piyQrTMN1eT7ZT-WZYv8&callback=init');
	}

	componentDidMount() {
		window.init = function() {
			this.initMap();
		}.bind(this);
	}

	initMap() {
		const map = new google.maps.Map(document.getElementById('map'), {
			zoom: 3,
			center: {lat: -28.024, lng: 140.887},
			styles : MapConfig.styles
		});

		const markers = MapConfig.locations.map(function(location) {
			return new google.maps.Marker({
				position: location,
				label: String.fromCharCode(Math.floor(Math.random() * (91 - 65 + 1) + 65))
			});
		});

		// Add a marker clusterer to manage the markers.
		new MarkerClusterer(map, markers, {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
	}

	render() {
		return (
			<span/>
		);
	}
}

export default Map;