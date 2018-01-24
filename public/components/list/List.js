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
        const timeString = this.formatHours(d) + ':' + this.formatMinutes(d);
        return dateString + ' ' + timeString;
	}

    formatHours(date) {
        return (date.getHours() + 24) % 12 || 12;
    }

    formatMinutes(date) {
        let minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
        return (date.getHours() < 12 ? (minutes += 'am') : (minutes += 'pm'));
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