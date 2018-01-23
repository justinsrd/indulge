import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';
import Logo from '../logo/Logo';
import Flag from '../flag/Flag';
const GITHUB_LINK = 'https://github.com/justinsrd/indulge';

class NavBar extends Component {
	constructor(props) {
		super(props);
        const DEFAULT_LOCATION = 'SEATTLE';
		this.state = {
			locations: [],
            currentLocation: localStorage.getItem('currentLocation') || DEFAULT_LOCATION,
			modalIsOpen: false
		};
        this.changeSelectedMenuItem = this.changeSelectedMenuItem.bind(this);
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
	}

	componentWillMount() {
        axios.get('/locations').then(function(res) {
        	const locations = [];
			for (let key in res.data) {
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

	openModal() {
		this.setState({modalIsOpen: true});
	}

    closeModal() {
        this.setState({modalIsOpen: false});
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
					<span>Visualizing Tweets Around You</span>
				</section>
				<section className="third about">
                    <div className="dropdown-wrapper">
						<select className="dropdown" onChange={this.changeSelectedMenuItem} value={this.state.currentLocation}>
							{this.state.locations.map(function(location) {
								return <option key={location.key} value={location.key}>{location.displayName}</option>;
							})};
						</select>
                        <span className="logo-info hover-color" onClick={this.openModal}/>
					</div>
				</section>
                <Modal isOpen={this.state.modalIsOpen} onRequestClose={this.closeModal} ariaHideApp={false}>
                    <div className="modal-content-wrapper">
						<section className="modal-top-row">
                            <h1 className="modal-title">Hello There!</h1>
							<a className="logo-github hover-color" href={GITHUB_LINK} target="_blank"/>
						</section>
						<p>Indulge is an application that visually displays tweets in various set locations.</p>
                        <p>Use it to discover exciting events around town, engage with others in the community, and see what your neighbors are talking about.</p>
						<span className="activate" onClick={this.closeModal}>Start Indulging</span>
					</div>
                </Modal>
			</header>
		);
	}
}

export default NavBar;