AFRAME.registerGeometry('nav-marker', {
    schema: {
        name: { type: 'string' },
    },

    init: function () {
        var data = this.data;
        this.geometry = new THREE.BoxGeometry(1, 1, 1);
    }
});
