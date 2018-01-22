'use strict';

const Twitter = require('twitter');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Utils = require('./utilities');
const locations = require('./location-config.js');
const MongoClient = require('mongodb').MongoClient;
const DB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'indulgedb';
const TWEET_COLLECTION_NAME = 'tweets';
const TWEET_FETCH_LIMIT = 120;
const RESET_CACHE_LIMIT = 150;

const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

app.use(express.static(__dirname.replace('/app', '/dist')));
app.set('port', (process.env.PORT || 4444));

app.get('/locations', function(req, res) {
	res.json(locations);
});

client.stream('statuses/filter', {locations: Utils.getLocationString(locations)}, function(stream) {
	console.log('Twitter stream has started...');

    MongoClient.connect(DB_URI, function(err, client) {
        console.log('Successfully connected to database...');
        const db = client.db(DB_NAME);
        const collection = db.collection(TWEET_COLLECTION_NAME);
        let cachedTweets = {};

        io.on('connection', function(socket) {
            const queriedCity = socket.handshake.query.loc;
            console.log('\nA new user has connected with queried city:', socket.handshake.query.loc);
            getLocationData(queriedCity);

            socket.on('setLocation', function(queriedCity) {
                console.log('getting for', queriedCity);
                getLocationData(queriedCity);
            });

            function getLocationData(queriedCity) {
                if (!cachedTweets[queriedCity] || !cachedTweets[queriedCity].length) {
                    collection.find({city: queriedCity}).sort({$natural: -1}).limit(TWEET_FETCH_LIMIT).toArray(function(err, result) {
                        console.log('grabbing from db', result.length);
                        cachedTweets[queriedCity] = result;
                        setTimeout(function() {
                            socket.emit('initLoad', result);
                        }, 2000);
                    });
                } else {
                    console.log('grabbing from cache', cachedTweets[queriedCity].length);
                    setTimeout(function() {
                        socket.emit('initLoad', cachedTweets[queriedCity]);
                    }, 2000);
                }
            }
        });

        stream.on('data', function(tweetData) {
            if (tweetData.geo && Utils.doesNotContainBannedWords(tweetData) && !tweetData.possibly_sensitive) {
                const coordinates = Utils.getCoordinates(tweetData);
                const matchedCity = Utils.matchLocation(locations, coordinates);
                if (matchedCity) {
                    const tweet = Utils.createTweetToBeSaved(tweetData, matchedCity, coordinates);
                    collection.insertOne(tweet, function(err, res) {
                        console.log('\ntweet: ' + tweet.text + ' ' + '[' + matchedCity + ']');
                        io.emit('newTweet', tweet);
                        if (!cachedTweets[matchedCity] || cachedTweets[matchedCity].length > RESET_CACHE_LIMIT || !cachedTweets[matchedCity].length) {
                            collection.find({city: matchedCity}).sort({$natural: -1}).limit(TWEET_FETCH_LIMIT).toArray(function(err, result) {
                                cachedTweets[matchedCity] = result;
                                cachedTweets[matchedCity].push(tweet);
                            });
                        } else {
                            cachedTweets[matchedCity].push(tweet);
                        }
                    });
                }
            }
        });
    });
});

http.listen(app.get('port'), function() {
    console.log('\nServer is now running on port ' + app.get('port') + '...\n');
});