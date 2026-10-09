export const removeAttribution = () => {
    const rightBottom = document.querySelector(".mapboxgl-ctrl-bottom-right");
    rightBottom?.remove();
    const leftBottom = document.querySelector(".mapboxgl-ctrl-bottom-left");
    leftBottom?.remove();
};

export const animateRoute = (
    map: mapboxgl.Map,
    fullCoords: [number, number][],
) => {
    const duration = 3000;
    const totalPoints = fullCoords.length;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const index = Math.floor(progress * totalPoints);

        const current = fullCoords.slice(0, index);
        const source = map.getSource("route") as mapboxgl.GeoJSONSource;
        source.setData({
            type: "Feature",
            geometry: { type: "LineString", coordinates: current },
            properties: {},
        });

        if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
};
