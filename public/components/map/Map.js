import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MapConfig from '../config/MapConfig';
import MapUtilities from './MapUtilities';
import io from 'socket.io-client';

const DEFAULT_LOCATION = 'SAN_FRANCISCO';
const currentLoc = localStorage.getItem('currentCity') || DEFAULT_LOCATION;
const serverUrl = 'http://localhost:4444?loc=';
const socket = io(serverUrl + currentLoc);

class Map extends Component {
	constructor(props) {
		super(props);
        this.map = undefined;
        this.markerClusterer = undefined;
        this.activeInfoWindow = undefined;
        this.locationsLoaded = false;
        this.mapsAccessLoaded = false;
        this.locations = {};
        this.markers = [];
	}

	componentWillMount() {
		this.loadScriptAsync('https://maps.googleapis.com/maps/api/js?key=AIzaSyDZXiq8rbR9uT8piyQrTMN1eT7ZT-WZYv8&callback=tryMapsAccess');
        axios.get('/locations').then(function(res) {
            this.locationsLoaded = true;
            this.locations = res.data;
            if (this.mapsAccessLoaded === true) {
                this.initMap();
            }
        }.bind(this), function(err) {
            console.log('error loading locations', err);
        });
	}

	componentDidMount() {
	    window.tryMapsAccess = function() {
	        this.mapsAccessLoaded = true;
	        if (this.locationsLoaded === true) {
	            this.initMap();
            }
        }.bind(this);
	}

	initMap() {
	    const self = this;

        self.map = new google.maps.Map(document.getElementById('map'), {
        	zoom: self.locations[currentLoc].mapZoom,
            center: self.locations[currentLoc].mapCenter,
        	styles : MapConfig.styles
        });

        self.markerClusterer = new MarkerClusterer(self.map, self.markers, {
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
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
        if (tweet.entities && tweet.entities.urls && tweet.entities.urls.length && self.getMediaUrl(tweet.entities.urls)) {
            const urlInfo = self.getMediaUrl(tweet.entities.urls);
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

    getMediaUrl(urls) {
        for (let i = 0; i < urls.length; i++) {
            if (urls[i].expanded_url.indexOf('www.instagram') > -1) {
                return {
                    redirectUrl: urls[i].expanded_url + 'media/?s=t',
                    extendedUrl: urls[i].expanded_url
                };
            }
        }
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