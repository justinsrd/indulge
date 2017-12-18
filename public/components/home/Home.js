import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../navbar/NavBar';
import List from '../list/List';
import Map from '../map/Map';

class Home extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showList: false
		};
		this.toggleList = this.toggleList.bind(this);
	}

	toggleList() {
		this.setState({'showList': !this.state.showList});
	};

	render() {
		return (
			<div>
				<NavBar toggleHandler={this.toggleList} showList={this.state.showList}/>
				<List showList={this.state.showList}/>
				<Map/>
			</div>
		);
	}
}

export default Home;