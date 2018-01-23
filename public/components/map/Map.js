import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import List from '../list/List';
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
        this.state = {
            tweets: []
        };
        this.findTweet = this.findTweet.bind(this);
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
            this.mapLoaded = true;
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
                self.processNewTweet(tweets[i], true);
            }
        });

        socket.on('newTweet', function(tweet) {
            if (tweet.city === this.selectedMapLocation) {
                self.processNewTweet(tweet);
            }
        });
	}

	processNewTweet(tweet, isInitialLoad) {
	    const self = this;
        if (tweet.entities && tweet.entities.urls && tweet.entities.urls.length && MapUtilities.getMediaUrl(tweet.entities.urls)) {
            const urlInfo = MapUtilities.getMediaUrl(tweet.entities.urls);
            MapUtilities.findRedirectUrl({url: urlInfo.redirectUrl}).then(function(res) {
                self.renderNewTweet(tweet, isInitialLoad, urlInfo, res.responseURL);
            }, function(error) {
                console.log('error getting redirect URL', error);
                self.renderNewTweet(tweet, isInitialLoad);
            });
        } else {
            self.renderNewTweet(tweet, isInitialLoad);
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
            this.map.setZoom(this.locations[location].mapZoom);
            localStorage.setItem('currentLocation', location);
        }
    }

    renderNewTweet(tweet, isInitialLoad, urlInfo, directImgUrl) {
        const newLoc = {lat: tweet.coordinates.lat, lng: tweet.coordinates.long, nombre: tweet.text};
        const newMarker = this.locationToMarker(newLoc, urlInfo, directImgUrl);
        this.markerClusterer.addMarker(newMarker);
        if (isInitialLoad) {
            this.setState(prevState => ({
                tweets: [...prevState.tweets, tweet]
            }));
        } else {
            this.setState(prevState => ({
                tweets: [tweet, ...prevState.tweets]
            }));
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
            if (directImgUrl) contentString += '<a href="' + urlInfo.extendedUrl + '" target="_blank"><img class="infowindow-image" src="' + directImgUrl + '" width="180"/></a>';

            self.activeInfoWindow = new google.maps.InfoWindow({
                content: contentString,
                maxWidth: 200
            });
            self.activeInfoWindow.open(map, marker);
        });
        return marker;
    }

    findTweet(tweet, event) {
        this.map.setCenter({lat: tweet.coordinates.lat, lng: tweet.coordinates.long});
        this.map.setZoom(17);
    }

	render() {
		return (
            <List showList={this.props.showList} tweets={this.state.tweets} findTweet={this.findTweet}/>
		);
	}
}

export default Map;