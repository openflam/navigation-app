import type { Matrix4 } from '../types/three';

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
    matrix4ToArray,
    arraytoMatrix4,
    transpose
}