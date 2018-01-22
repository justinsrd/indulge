import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MapConfig from '../config/MapConfig';
import MapUtilities from './MapUtilities';
import io from 'socket.io-client';
const MARKER_CLUSTERER_URL = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m';
const MAPS_API_URL = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDZXiq8rbR9uT8piyQrTMN1eT7ZT-WZYv8&callback=tryMapsAccess';
const SERVER_URL = 'http://localhost:4444?loc=';
let socket;


class Map extends Component {
	constructor(props) {
		super(props);
        this.map = undefined;
        this.markerClusterer = undefined;
        this.activeInfoWindow = undefined;
        this.mapsAccessLoaded = false;
        this.selectedMapLocation = undefined;
        this.mapLoaded = false;
        this.locations = {};
	}

	componentWillMount() {
        window.tryMapsAccess = function() {
            this.mapsAccessLoaded = true;
            this.tryToInitMap();
        }.bind(this);
		this.loadScriptAsync(MAPS_API_URL);
	}

    componentWillReceiveProps(props) {
	    if (props.locations) {
	        this.locations = props.locations;
	        this.tryToInitMap();
        }

        if (props.currentLocation) {
            if (this.selectedMapLocation !== props.currentLocation.key && this.mapLoaded) {
                this.selectedMapLocation = props.currentLocation.key;
                this.changeCenter(props.currentLocation.key);
            } else {
                this.selectedMapLocation = props.currentLocation.key;
            }
            if (!socket) {
                socket = io(SERVER_URL + this.selectedMapLocation);
            }
            this.tryToInitMap();
        }
    }

    tryToInitMap() {
        if (this.mapsAccessLoaded === true && this.selectedMapLocation && Object.keys(this.locations) && !this.mapLoaded) {
            this.initMap();
        }
    }

	initMap() {
	    const self = this;
        self.map = new google.maps.Map(document.getElementById('map'), {
        	zoom: self.locations[self.selectedMapLocation].mapZoom,
            center: self.locations[self.selectedMapLocation].mapCenter,
        	styles : MapConfig.styles
        });

        self.markerClusterer = new MarkerClusterer(self.map, [], {
            imagePath: MARKER_CLUSTERER_URL,
            maxZoom: 20
        });

        socket.on('initLoad', function(tweets) {
            for (let i = 0; i < tweets.length; i++) {
                self.processNewTweet(tweets[i]);
            }
        });

        socket.on('newTweet', function(tweet) {
            self.processNewTweet(tweet);
        });
	}

	processNewTweet(tweet) {
	    const self = this;
        if (tweet.entities && tweet.entities.urls && tweet.entities.urls.length && MapUtilities.getMediaUrl(tweet.entities.urls)) {
            const urlInfo = MapUtilities.getMediaUrl(tweet.entities.urls);
            MapUtilities.findRedirectUrl({url: urlInfo.redirectUrl}).then(function(res) {
                self.renderNewTweet(tweet, urlInfo, res.responseURL);
            }, function(error) {
                console.log('error getting redirect URL', error);
                self.renderNewTweet(tweet);
            });
        } else {
            self.renderNewTweet(tweet);
        }
    }

	changeCenter(location) {
        if (this.locations.hasOwnProperty(location)) {
            const markers = this.markerClusterer.getMarkers();
            for (let i = markers.length - 1; i >= 0; i--) {
                this.markerClusterer.removeMarker(markers[i]);
            }
            socket.emit('setLocation', location);
            this.map.setCenter(this.locations[location].mapCenter);
            this.map.setZoom(this.locations[location].mapZoom)
        }
    }

    renderNewTweet(tweet, urlInfo, directImgUrl) {
        const newLoc = {lat: tweet.coordinates.lat, lng: tweet.coordinates.long, nombre: tweet.text};
        const newMarker = this.locationToMarker(newLoc, urlInfo, directImgUrl);
        this.markerClusterer.addMarker(newMarker);
    }

    loadScriptAsync(src) {
        const tag = document.createElement('script');
        tag.async = true;
        tag.defer = true;
        tag.src = src;
        document.getElementsByTagName('body')[0].appendChild(tag);
    }

    locationToMarker(location, urlInfo, directImgUrl) {
        const self = this;
        const marker = new google.maps.Marker({
            position: location,
            icon: '../../lib/marker.png'
        });

        marker.addListener('click', function() {
            if (self.activeInfoWindow) self.activeInfoWindow.close();
            let contentString = '<span>' + location.nombre + '</span>';
            if (directImgUrl) contentString += '<a href="' + urlInfo.extendedUrl + '" target="_blank"><img class="centered-image" src="' + directImgUrl + '" width="180"/></a>';

            self.activeInfoWindow = new google.maps.InfoWindow({
                content: contentString,
                maxWidth: 200
            });
            self.activeInfoWindow.open(map, marker);
        });
        return marker;
    }

	render() {
		return (
			<span/>
		);
	}
}

export default Map;