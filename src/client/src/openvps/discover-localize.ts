import { getCoarseLocation } from './coarse-location';
import { Matrix4 } from '../types/three';
import { arraytoMatrix4, transformPoseMatrix } from './pose-transform';

async function localize(): Promise<Matrix4> {
    // Get coarse location
    let coarseLocation = await getCoarseLocation();
    if (!coarseLocation) {
        throw new Error('Failed to get coarse location');
    }

    console.log("Coarse Location:");
    console.log(coarseLocation);

    // Get image blob
    let imageBlob = await globalThis.cameraCapture.fetchCurrentImageBlob(globalThis.canvas);

    // Get VIO pose
    let cameraPose = new AFRAME.THREE.Matrix4();
    globalThis.camera.updateMatrixWorld(true); // force = true
    cameraPose = cameraPose.fromArray(globalThis.camera.matrixWorld.elements);

    // Disocver and localize
    let bestMapServer = await globalThis.discoveryObj.localize(
        coarseLocation.latitude,
        coarseLocation.longitude,
        coarseLocation.accuracy,
        imageBlob,
        "image",
        // matrix4ToArray(cameraPose),
    )

    if (!bestMapServer) {
        return new AFRAME.THREE.Matrix4();
    }
    let localizationPose = bestMapServer.getLatestLocalizationData().pose;
    let objectPose = transformPoseMatrix(arraytoMatrix4(localizationPose), cameraPose);
    return objectPose;
}

export { localize };