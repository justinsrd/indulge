import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import NavBar from './NavBar';
import Map from './Map';

class Home extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div>
				<NavBar/>
				<Map/>
			</div>
		);
	}
}

export default Home;