class MapUtilities {

    constructor() {

    }

    findRedirectUrl(obj) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open(obj.method || 'GET', obj.url);
            if (obj.headers) {
                Object.keys(obj.headers).forEach(key => {
                    xhr.setRequestHeader(key, obj.headers[key]);
                });
            }
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300 && xhr.responseURL) {
                    resolve(xhr);
                } else {
                    reject(xhr);
                }
            };
            xhr.onerror = () => reject(xhr.statusText);
            xhr.send(obj.body);
        });
    }

    getMediaUrl(tweet) {
        if (tweet.entities && tweet.entities.urls && tweet.entities.urls.length) {
            const urls = tweet.entities.urls;
            for (let i = 0; i < urls.length; i++) {
                if (urls[i].expanded_url.indexOf('www.instagram') > -1) {
                    return {
                        mediaSourceUrlRedirectUrl: urls[i].expanded_url + 'media/?s=t',
                        linkUrl: urls[i].expanded_url
                    };
                }
            }
        }
        if (tweet.entities && tweet.entities.media && tweet.entities.media.length) {
            const urls = tweet.entities.media;
            for (let i = 0; i < urls.length; i++) {
                if (urls[i].media_url_https) {
                    return {
                        mediaSourceUrl: urls[i].media_url_https,
                        linkUrl: urls[i].display_url || urls.expanded_url
                    }
                }
                if (urls[i].media_url) {
                    return {
                        mediaSourceUrl: urls[i].media_url,
                        linkUrl: urls[i].display_url || urls.expanded_url
                    }
                }
            }
        }
    }

    static serviceFactory() {
        return new MapUtilities();
    }
}

export default MapUtilities.serviceFactory();