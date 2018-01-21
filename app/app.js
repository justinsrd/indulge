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
const DEFAULT_LOCATION = 'SAN_FRANCISCO';

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
	console.log("Twitter stream has started...");

    MongoClient.connect(DB_URI, function(err, client) {
        console.log('Successfully connected to database...');
        const db = client.db(DB_NAME);
        const collection = db.collection(TWEET_COLLECTION_NAME);
        let cachedTweets = {};

        io.on('connection', function(socket) {
            const queriedCity = socket.handshake.query.loc;
            console.log('\nA new user has connected with queried city:', socket.handshake.query.loc);
            if (!cachedTweets[queriedCity] || !cachedTweets[queriedCity].length) {
                collection.find({city: queriedCity}).sort({$natural: -1}).limit(150).toArray(function(err, result) {
                    cachedTweets[queriedCity] = result;
                    setTimeout(function() {
                        socket.emit('initLoad', result);
                    }, 2000);
                });
            } else {
                socket.emit('initLoad', cachedTweets);
            }
        });

        stream.on('data', function(tweet) {
            if (tweet.geo && Utils.doesNotContainBannedWords(tweet) && !tweet.possibly_sensitive) {
                const matchedCity = Utils.matchCity(tweet.geo) || DEFAULT_LOCATION;
                const geoTweet = {
                    text: tweet.text,
                    uuid: tweet.id_str,
                    screenName: tweet.user.screen_name,
                    userId: tweet.id_str,
                    date: tweet.timestamp_ms,
                    userImg: tweet.profile_image_url_https,
                    city: matchedCity,
                    entities: tweet.entities,
                    coordinates: Utils.getCoordinates(tweet)
                };

                collection.insertOne(geoTweet, function(err, res) {
                    console.log('\ntweet: ' + geoTweet.text);
                    io.emit('newTweet', geoTweet);
                    if (!cachedTweets[matchedCity] || cachedTweets[matchedCity].length > 200) {
                        cachedTweets[matchedCity] = [];
                    }
                    cachedTweets[matchedCity].push(geoTweet);
                });
            }
        });
    });
});

http.listen(app.get('port'), function() {
    console.log('\nServer is now running on port ' + app.get('port') + '...\n');
});