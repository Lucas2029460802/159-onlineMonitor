import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

export const Index = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (mapContainerRef.current === null) return;
        const mapContainer = mapContainerRef.current;
        const rightBottom = document.querySelector(
            ".mapboxgl-ctrl-bottom-right",
        );
        rightBottom?.remove();
        const leftBottom = document.querySelector(".mapboxgl-ctrl-bottom-left");
        leftBottom?.remove();
        const map = new mapboxgl.Map({
            container: mapContainer,
            style: "/tileserver/styles/basic-preview/style.json",
            center: [121.526, 31.2595],
            zoom: 12, // starting zoom,
            minZoom: 11,
            attributionControl: false,
        });
    }, []);
    return (
        <div className="w-full h-full">
            <div className="w-full h-full" ref={mapContainerRef}></div>
        </div>
    );
};
