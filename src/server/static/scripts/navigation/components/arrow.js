AFRAME.registerComponent('arrow', {
    schema: {
        start: { type: 'vec3', default: { x: 0, y: 0, z: 0 } },
        end: { type: 'vec3', default: { x: 1, y: 1, z: 1 } },
        offset: { type: 'number', default: 0.3 } // The arrow is shortened by these many meters
    },
    init: function () {
        this.createArrow();
    },
    update: function () {
        this.createArrow();
    },
    createArrow: function () {
        const data = this.data;
        var start = new THREE.Vector3(data.start.x, data.start.y, data.start.z);
        var end = new THREE.Vector3(data.end.x, data.end.y, data.end.z);
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        direction.normalize();

        // Calculate rotation
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
        const rotation = new THREE.Euler().setFromQuaternion(quaternion, 'YXZ');

        // Clear previous arrow entities if any
        while (this.el.firstChild) {
            this.el.removeChild(this.el.firstChild);
        }

        // Create the shaft of the arrow
        const shaft = document.createElement('a-cylinder');
        shaft.setAttribute('position', {
            x: (start.x + end.x) / 2,
            y: (start.y + end.y) / 2,
            z: (start.z + end.z) / 2
        });
        shaft.setAttribute('height', length - data.offset);
        shaft.setAttribute('radius', 0.04);
        shaft.object3D.rotation.copy(rotation);
        shaft.setAttribute('color', '#00aaff');

        // Create the arrowhead
        newEnd = new THREE.Vector3().subVectors(end, direction.clone().multiplyScalar(data.offset / 2));
        const arrowhead = document.createElement('a-cone');
        arrowhead.setAttribute('position', newEnd);
        arrowhead.setAttribute('radius-bottom', 0.1);
        arrowhead.setAttribute('radius-top', 0);
        arrowhead.setAttribute('height', 0.2);
        arrowhead.object3D.rotation.copy(rotation);
        arrowhead.setAttribute('color', '#00aaff');

        this.el.appendChild(shaft);
        this.el.appendChild(arrowhead);
    }
});