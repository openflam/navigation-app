import type { Matrix4 } from '../types/three';

function transformPoseMatrix(localizationPose: Matrix4, aframeCameraPose: Matrix4): Matrix4 {

    // Invert localizationPose
    let localizationPoseInv = new AFRAME.THREE.Matrix4();
    localizationPoseInv.fromArray(localizationPose.elements);
    localizationPoseInv.invert();

    // The pose returned by the server is in the coordinate system of the server.
    // Let B be the coordinate system of the server, and A the system of the client.
    // C is the pose of the camera, and O is the pose of an object. What the server returns is C_B.
    // We want: inv(C_B) O_B = inv(C_A) O_A. (ie. Pose of objects relative to the camera is same in both systems).
    // => O_A = C_A inv(C_B) O_B

    let objectPose = new AFRAME.THREE.Matrix4();
    objectPose = objectPose.multiplyMatrices(aframeCameraPose, localizationPoseInv);
    return objectPose;
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

export {
    transformPoseMatrix,
    matrix4ToArray,
    arraytoMatrix4,
    transpose
}