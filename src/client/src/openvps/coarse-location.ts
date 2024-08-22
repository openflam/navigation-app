interface CoarseLocation {
    latitude: number;
    longitude: number;
    altitude: number;
    accuracy: number;
}

function getCoarseLocation(): Promise<CoarseLocation | null> {
    if (!navigator.geolocation) {
        console.error('Geolocation is not supported');
        return Promise.resolve(null);
    }

    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((position) => {
            resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                altitude: position.coords.altitude,
                accuracy: position.coords.accuracy
            });
        }, reject, { enableHighAccuracy: true });
    });
}

export { CoarseLocation, getCoarseLocation };