import { MapsDiscovery, MapServer } from "@openvps/dnsspatialdiscovery";
import { WebXRCameraCapture } from "./camera-capture/webxr-capture";
import { SceneXR } from "./types/aframe";

export function initialize() {
    // Initialize the discovery object
    globalThis.discoveryObj = new MapsDiscovery('loc.arenaxr.org.');
    discoveryObj.setServerConfidenceThreshold(50);

    // Initialize the canvas
    globalThis.canvas = document.createElement('canvas');

    // Assign the scene
    globalThis.scene = document.querySelector('a-scene');

    // Assign the camera
    globalThis.camera = document.querySelector('#camera').object3D;

    // Assign the debug element
    globalThis.debugEl = document.querySelector('#debug-text');

    // Initialize the camera capture
    const sceneEl: SceneXR = document.querySelector('a-scene');
    if (sceneEl.hasLoaded) {
        globalThis.cameraCapture = new WebXRCameraCapture(sceneEl);
    } else {
        sceneEl.addEventListener('loaded', () => {
            globalThis.cameraCapture = new WebXRCameraCapture(sceneEl);
        });
    }

    // Intialize the best localization result object
    globalThis.mapInfoDict = {};
}