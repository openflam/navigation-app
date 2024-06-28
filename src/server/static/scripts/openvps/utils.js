function apply_pose_matrix(obj, matrix) {
    // Create THREE js matrix
    var matrix = new THREE.Matrix4().fromArray(matrix);

    // Decompose matrix into position, rotation, and scale
    var position = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();
    var scale = new THREE.Vector3();
    matrix.decompose(position, quaternion, scale);
    obj.position.copy(position);
    obj.quaternion.copy(quaternion);
    obj.scale.copy(scale);
}

function get_position_from_matrix(matrix) {
    // Create THREE js matrix
    var matrix = new THREE.Matrix4().fromArray(matrix);

    // Decompose matrix into position, rotation, and scale
    var position = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();
    var scale = new THREE.Vector3();
    matrix.decompose(position, quaternion, scale);

    return position;
}

function apply_transformation(obj, matrix) {
    // Create THREE js matrix
    var matrix = new THREE.Matrix4().fromArray(matrix);

    // Apply the matrix to the object
    obj.applyMatrix4(matrix);
}

async function fetchJSON(url, formData) {
    return fetch(url, {
        method: 'POST',
        body: formData
    }).then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch from URL: ' + url);
        }
        return response.json();
    });
}

async function hashURL(url) {
    const crypto = window.crypto || window.msCrypto; // Get crypto object

    // Convert URL to a Uint8Array (required for hashing)
    const urlBytes = new TextEncoder().encode(url);

    // Choose a hashing algorithm (SHA-256 is common)
    const algorithm = { name: "SHA-256" };

    // Hash the URL bytes
    return crypto.subtle.digest(algorithm, urlBytes)
        .then(arrayBuffer => {
            // Convert the hash buffer to a hex string for easy use
            return Array.from(new Uint8Array(arrayBuffer))
                .map(b => b.toString(16).padStart(2, "0"))
                .join("");
        })
        .catch(error => {
            console.error("Error hashing URL:", error);
            return null; // Handle errors appropriately in your application
        });
}

function saveBase64AsFile(base64, fileName) {
    var link = document.createElement("a");
    document.body.appendChild(link); // for Firefox
    link.setAttribute("href", base64);
    link.setAttribute("download", fileName);
    link.click();
}

async function getImageBlobFromArray(pixelsArray, frameWidth, frameHeight, canvas) {
    // Mirror currentPixels and turn it upside down
    var framePixels_mirror = new Uint8ClampedArray(frameWidth * frameHeight * 4);
    for (var i = 0; i < frameHeight; i++) {
        for (var j = 0; j < frameWidth; j++) {
            framePixels_mirror[(frameHeight - i - 1) * frameWidth * 4 + j * 4] = pixelsArray[i * frameWidth * 4 + j * 4];
            framePixels_mirror[(frameHeight - i - 1) * frameWidth * 4 + j * 4 + 1] = pixelsArray[i * frameWidth * 4 + j * 4 + 1];
            framePixels_mirror[(frameHeight - i - 1) * frameWidth * 4 + j * 4 + 2] = pixelsArray[i * frameWidth * 4 + j * 4 + 2];
            framePixels_mirror[(frameHeight - i - 1) * frameWidth * 4 + j * 4 + 3] = pixelsArray[i * frameWidth * 4 + j * 4 + 3];
        }
    }

    // Convert currentPixels to base64
    canvas.width = frameWidth;
    canvas.height = frameHeight;
    var canvas2DContext = canvas.getContext('2d');
    var imageData = canvas2DContext.createImageData(frameWidth, frameHeight);
    imageData.data.set(framePixels_mirror);
    canvas2DContext.putImageData(imageData, 0, 0);

    // Send the image to the server
    blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg'));
    return blob;
}