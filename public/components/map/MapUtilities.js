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
    };

    static serviceFactory() {
        return new MapUtilities();
    }
}

export default MapUtilities.serviceFactory();