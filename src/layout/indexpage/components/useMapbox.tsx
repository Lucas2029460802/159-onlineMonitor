import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";

import { InfoCard } from "./InfoCard";
import { animateRoute, removeAttribution } from "./maputil";

export const useMapbox = (supportWebgl: boolean) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!supportWebgl) {
            console.warn("[useMapbox] WebGL not supported, skipping map init.");
            return;
        }
        if (!mapContainerRef.current) return;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "/tileserver/styles/basic-preview/style.json",
            center: [121.526, 31.2595],
            zoom: 12,
            minZoom: 11,
            attributionControl: false,
        });

        const routes: [[number, number], [number, number]][] = [
            [
                [121.523, 31.256],
                // [121.545, 31.268],
                [121.535, 31.26],
            ],
        ];
        const [start, end] = routes[Math.floor(Math.random() * routes.length)];

        map.on("styledata", removeAttribution);

        map.on("load", async () => {
            // 普通标记
            new mapboxgl.Marker({ color: "red" }).setLngLat(start).addTo(map);
            new mapboxgl.Marker({ color: "blue" }).setLngLat(end).addTo(map);

            // React 卡片标记
            const addReactCardMarker = (
                lnglat: [number, number],
                imgSrc: string,
                address: string,
                time: string,
                offset: [number, number],
            ) => {
                const container = document.createElement("div");
                const root = ReactDOM.createRoot(container);
                root.render(
                    <InfoCard
                        imgSrc={imgSrc}
                        address={address}
                        time={time}
                        offset={offset}
                    />,
                );
                new mapboxgl.Marker({ element: container, anchor: "bottom" })
                    .setLngLat(lnglat)
                    .addTo(map);
            };

            addReactCardMarker(
                start,
                "/start.png",
                "龙江路北-监控",
                "2025-08-07 17:14:19",
                [0, -80],
            );
            addReactCardMarker(
                end,
                "/end.png",
                "渭南路2号监控",
                "2025-08-07 17:20:01",
                [-100, 50],
            );

            // 加载 OSRM 路线
            const res = await fetch(
                `osrm/route/v1/driving/${start.join(",")};${end.join(
                    ",",
                )}?overview=full&geometries=geojson`,
            );
            const data = await res.json();
            const fullCoords: [number, number][] =
                data.routes[0].geometry.coordinates;

            if (map.getLayer("route-line")) map.removeLayer("route-line");
            if (map.getSource("route")) map.removeSource("route");

            map.addSource("route", {
                type: "geojson",
                data: {
                    type: "Feature",
                    geometry: { type: "LineString", coordinates: [] },
                    properties: {},
                },
            });

            map.addLayer({
                id: "route-line",
                type: "line",
                source: "route",
                layout: { "line-join": "round", "line-cap": "round" },
                paint: { "line-color": "#ff0000", "line-width": 4 },
            });

            animateRoute(map, fullCoords);

            const bounds = fullCoords.reduce(
                (b, coord) => b.extend(coord),
                new mapboxgl.LngLatBounds(fullCoords[0], fullCoords[0]),
            );
            map.fitBounds(bounds, { padding: 100 });
        });

        return () => map.remove();
    }, []);

    return mapContainerRef;
};
