import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class List extends Component {
	constructor(props) {
		super(props);
		this.months = ['Jan ', 'Feb ', 'Mar ', 'Apr ', 'May ', 'Jun ', 'Jul ', 'Aug ', 'Sept ', 'Oct ', 'Nov ', 'Dec '];
	}

	formatTimeString(tweet) {
        const d = new Date(parseInt(tweet.date));
        const dateString = this.months[d.getMonth()] + d.getDate() + ', ' + d.getFullYear();
        const timeString = Math.abs(d.getHours() - 12) + ':' + (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes())  + (d.getHours() < 12 ? 'am' : 'pm');
        return dateString + ' ' + timeString;
	}

	render() {
        const self = this;
        const listStyle = self.props.showList ? '' : "list-hidden";
		return (
			<div className={'list-container ' + listStyle}>
				{this.props.tweets.map(function(tweet) {
					return (
						<article key={tweet._id} onClick={(evt) => self.props.findTweet(tweet, evt)}>
							<div className="list-content-container">
                                <span className="list-text" dangerouslySetInnerHTML={{__html: tweet.text}}/>
                                <span className="list-date logo-twitter">{self.formatTimeString(tweet)}</span>
							</div>
						</article>
					);
				})}
			</div>
		);
	}
}

export default List;