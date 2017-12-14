import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class NavBar extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<header>
				<section className="third">MENU</section>
				<section className="third">INDULGE</section>
				<section className="third">ABOUT US</section>
			</header>
		);
	}
}

export default NavBar;