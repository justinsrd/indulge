import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class List extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		const listStyle = this.props.showList ? '' : "list-hidden";
		return (
			<div className={'list-container ' + listStyle}>
				<article/>
				<article/>
				<article/>
				<article/>
				<article/>
				<article/>
				<article/>
				<article/>
				<article/>
				<article/>
			</div>
		);
	}
}

export default List;