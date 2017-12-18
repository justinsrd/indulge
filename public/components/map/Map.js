import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MapConfig from '../config/MapConfig';

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
		let activeInfoWindow = undefined;

		const map = new google.maps.Map(document.getElementById('map'), {
			zoom: 14,
			center: {lat: 47.620883, lng: -122.331948},
			styles : MapConfig.styles
		});

		const markers = MapConfig.locations.map(function(location) {
			const marker = new google.maps.Marker({
				position: location,
				tweetText: location.nombre,
				icon: '../../lib/marker.png'
			});

			marker.addListener('click', function() {
				if (activeInfoWindow) {
					activeInfoWindow.close();
				}
				activeInfoWindow = new google.maps.InfoWindow({
					content: marker.tweetText
				});
				activeInfoWindow.open(map, marker);
			});
			return marker;
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