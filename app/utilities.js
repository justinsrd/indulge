class IndulgeUtils {
    constructor() {

    }
    //bottom left to top right
    //{locations: '-122.41, 47.54, -122.24, 47.70'} seattle
    //'-121.97, 37.66,-121.70, 37.82' dublin
    //'-121.969844,37.639467,-121.753146,37.808428' eastBay
    //-122.75,36.8,-121.75,37.8 sf
    getLocationString(locations) {
        let geoString = '';
        for (let city in locations) {
            geoString += locations[city].startLat + ',';
            geoString += locations[city].startLong + ',';
            geoString += locations[city].endLat + ',';
            geoString += locations[city].endLong + ',';
        }
        return geoString.substr(0, geoString.length - 1);
    };

    doesNotContainBannedWords(tweet) {
        const bannedSubstrings = ['#hire', '#hiring', '#job', '#jobs', 'test_lat'];
        for (let i = 0; i < bannedSubstrings.length; i++) {
            if (tweet.text.toLowerCase().indexOf(bannedSubstrings[i]) > -1) {
                return false;
            }
        }
        return true;
    }

    matchLocation(locations, coordinates) {
        const lat = coordinates.lat;
        const long = coordinates.long;
        for (let key in locations) {
            const location = locations[key];
            if (lat > location.startLong && lat < location.endLong && long > location.startLat && long < location.endLat) {
                return key;
            }
        }
    }

    getCoordinates(tweet) {
        if (tweet.coordinates && tweet.coordinates.type === 'Point') {
            return {
                lat: tweet.coordinates.coordinates[1],
                long: tweet.coordinates.coordinates[0]
            };
        } else if (tweet.geo && tweet.geo.type === 'Point') {
            return {
                lat: tweet.coordinates.coordinates[0],
                long: tweet.coordinates.coordinates[1]
            };
        } else if (tweet.place && tweet.place.bounding_box === 'Polygon') {
            const c = tweet.coordinates.coordinates;
            return {
                lat: (c[0][1] + c[c.length-1][1]) / 2,
                long: (c[0][0] + c[c.length-1][0]) /2
            };
        } else {
            return {
                lat: undefined,
                long: undefined
            }
        }
    }

    createTweetToBeSaved(tweet, matchedCity, coordinates) {
        return {
            text: tweet.text,
            uuid: tweet.id_str,
            screenName: tweet.user.screen_name,
            userId: tweet.id_str,
            date: tweet.timestamp_ms,
            userImg: tweet.profile_image_url_https,
            city: matchedCity,
            entities: tweet.entities,
            coordinates: coordinates
        };
    }
}

module.exports = new IndulgeUtils();