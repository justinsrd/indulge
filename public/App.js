'use strict';

import styles from './styles/main.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Switch, Route, Link } from 'react-router-dom';
import Home from './Home';


const App = () => (
	<HashRouter hashType="noslash">
		<div>
			<Switch>
				<Route exact path='/' component={Home} />
			</Switch>
		</div>
	</HashRouter>

);

ReactDOM.render(<App/>, document.getElementById('root'));