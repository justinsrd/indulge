import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../logo/Logo';

class Flag extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="flag-container">
				{/*<span className="logo-location"/>*/}
				{/*<span className="logo-twitter"/>*/}
				<div className="links-container clearfix">
					<Link to="#" style={{'float':'left'}} className="link-icon">
						<span className="logo-github hover-color"/>
					</Link>
					<Link to="#" style={{'float':'right'}} className="link-icon">
						<span className="logo-info hover-color"/>
					</Link>
				</div>
				<div className="logo-container">
					<Logo/>
				</div>
				<div className="title-container">
					<span className="title">Indulge</span>
				</div>

			</div>
		);
	}
}

export default Flag;