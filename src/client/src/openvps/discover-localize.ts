import { getCoarseLocation } from './coarse-location';
import { Matrix4 } from '../types/three';

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

    console.log("Best Map Server:")
    console.log(bestMapServer)

    if (!bestMapServer) {
        return new AFRAME.THREE.Matrix4();
    }
    let localizationPose = bestMapServer.getLatestLocalizationData().pose;
    return arraytoMatrix4(localizationPose);
}

function transpose(matrix: number[][]): number[][] {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

function matrix4ToArray(matrix: Matrix4): number[][] {
    let array: number[][] = [];
    for (let i = 0; i < 4; i++) {
        array.push(matrix.elements.slice(i * 4, i * 4 + 4));
    }
    array = transpose(array);
    return array;
}

function arraytoMatrix4(array: number[][]): Matrix4 {
    // Transpose to column-major format and then flatten
    let arrayTranspose = transpose(array).flat();

    // Create a new Matrix4
    let matrix4 = new AFRAME.THREE.Matrix4();
    matrix4.fromArray(arrayTranspose);

    return matrix4;
}

export { localize };