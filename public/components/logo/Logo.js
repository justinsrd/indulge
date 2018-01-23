import React, { Component } from 'react';

class Logo extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="logo-container">
				<span className="header-logo logo-location"/>
			</div>
		);
	}
}

export default Logo;