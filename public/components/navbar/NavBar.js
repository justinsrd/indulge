import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../logo/Logo';
import Flag from '../flag/Flag';

class NavBar extends Component {
	constructor(props) {
		super(props);
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
					{/*<Flag/>*/}
				</section>
			</header>
		);
	}
}

export default NavBar;