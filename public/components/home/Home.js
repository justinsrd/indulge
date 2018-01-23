import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../navbar/NavBar';
import List from '../list/List';
import Map from '../map/Map';

class Home extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showList: false,
			currentLocation: undefined,
			locations: []
		};
		this.toggleList = this.toggleList.bind(this);
		this.setNewLocation = this.setNewLocation.bind(this);
        this.setAllLocations = this.setAllLocations.bind(this);
        this.hideList = this.hideList.bind(this);
	}

	toggleList() {
		this.setState({'showList': !this.state.showList});
	};

	hideList() {
        this.setState({'showList': false});
	}

	setNewLocation(location) {
        this.setState({currentLocation: location});
	}

	setAllLocations(locations) {
		this.setState({locations: locations})
	}

	render() {
		return (
			<div>
				<NavBar toggleHandler={this.toggleList} showList={this.state.showList} setNewLocation={this.setNewLocation} setAllLocations={this.setAllLocations}/>
				<Map currentLocation={this.state.currentLocation} hideList={this.hideList} locations={this.state.locations} showList={this.state.showList}/>
			</div>
		);
	}
}

export default Home;