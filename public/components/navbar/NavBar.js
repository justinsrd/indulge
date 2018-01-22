import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Logo from '../logo/Logo';
import Flag from '../flag/Flag';

class NavBar extends Component {
	constructor(props) {
		super(props);
        const DEFAULT_LOCATION = 'SEATTLE';
		this.state = {
			locations: [],
            currentLocation: localStorage.getItem('currentLocation') || DEFAULT_LOCATION
		};
        this.changeSelectedMenuItem = this.changeSelectedMenuItem.bind(this);
	}

	componentWillMount() {
        axios.get('/locations').then(function(res) {
        	const locations = [];
			for (let key in res.data) {
				res.data[key].key = key;
				locations.push(res.data[key]);
			}
			this.setState({locations: locations});
			this.props.setAllLocations(res.data);
			this.props.setNewLocation(res.data[this.state.currentLocation]);
        }.bind(this), function(err) {
            console.log('error loading locations', err);
        });
	}

	changeSelectedMenuItem(evt) {
        const target = evt.target;
        const newLocation = target[target.selectedIndex].value;
        this.setState({currentLocation: newLocation});
        this.props.setNewLocation(this.state.locations.filter(location => location.key === newLocation)[0]);
	}

	render() {
		return (
			<header>
				<section className="third menu">
					<div className="menu-icon-wrapper">
						{this.props.showList ?
							<span className="logo-cross hover-color" onClick={this.props.toggleHandler}/>:
							<span className="logo-menu hover-color" onClick={this.props.toggleHandler}/>
						}
					</div>
				</section>
				<section className="third title">
					<span style={{'fontStyle': 'italic', 'fontSize': '2.2rem'}}>Visualizing Tweets Around You</span>
				</section>
				<section className="third about">
					<select onChange={this.changeSelectedMenuItem} value={this.state.currentLocation}>
						{this.state.locations.map(function(location) {
							return <option key={location.key} value={location.key}>{location.key}</option>;
						})};
					</select>
				</section>
			</header>
		);
	}
}

export default NavBar;