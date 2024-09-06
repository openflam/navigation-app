import type { Matrix4, Object3D } from "three";

function applyPoseMatrix(obj: Object3D, poseMatrix: Matrix4) {
    // Decompose matrix into position, rotation, and scale
    var position = new AFRAME.THREE.Vector3();
    var quaternion = new AFRAME.THREE.Quaternion();
    var scale = new AFRAME.THREE.Vector3();
    poseMatrix.decompose(position, quaternion, scale);

    // Apply the pose to the object
    obj.position.copy(position);
    obj.quaternion.copy(quaternion);
    obj.scale.copy(scale);
}

export { applyPoseMatrix };