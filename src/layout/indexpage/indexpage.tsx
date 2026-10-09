import mapboxgl from "mapbox-gl";

import { useMapbox } from "./components/useMapbox";
import "mapbox-gl/dist/mapbox-gl.css";
function isWebGLSupported() {
    try {
        const canvas = document.createElement("canvas");
        return !!(
            window.WebGLRenderingContext &&
            (canvas.getContext("webgl") ||
                canvas.getContext("experimental-webgl")) &&
            mapboxgl.supported()
        );
    } catch {
        return false;
    }
}

export const Index = () => {
    const support = isWebGLSupported();
    console.log(support);
    const mapContainerRef = useMapbox(support);

    return (
        <div className="w-full h-full" ref={mapContainerRef}>
            {!support ? "浏览器不支持webgl" : ""}
        </div>
    );
};
