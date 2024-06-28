const time_interval_ms = 5000;
const serverDiscoveryURL = "https://172.26.61.146:5000";

// Scene elements
const sceneEl = document.querySelector('a-scene');
const networkAssetsEl = sceneEl.querySelector('#network_assets');
const imageEl = document.querySelector('#current_image');
const aframeCameraEl = document.querySelector('#camera').object3D;
const debugTextEl = document.querySelector('#debug_text');
const canvas = document.createElement('canvas');

// Max confidence for each localization URL across the entire session
var max_confidence_this_session = {};

// XR Globals
var currentPixelsArray = null, // Current camera frame pixels
    frameWidth = 0,
    frameHeight = 0,
    glBinding = null, // WebXR WebGL binding
    fb = null, // Frame buffer
    gl = null, // WebGL rendering context
    xrSession = null, // XR session
    xrRefSpace = null; // XR reference space

/**
 * Sends location data to the server discovery service and gets the list of localization servers.
 * @param {string} serverDiscoveryURL - URL of the server discovery service
 * @returns List of localization servers
 */
async function discoverServers(serverDiscoveryURL) {
    if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        return;
    }
    
    // Get latitute and longitude of the device
    var position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;

    console.log("Latitude: " + lat + ", Longitude: " + lon);

    // Use the lat and lon to discover the spatial servers.
    // Send lat and lon as form data to the server
    var formData = new FormData();
    formData.append('latitude', lat);
    formData.append('longitude', lon);

    // Fetch the list of spatial servers
    serverList = await fetchJSON(serverDiscoveryURL, formData);
    return serverList;
}

/**
 * Loads content from the given content URL into the scene and updates the pose of the content entity.
 * @param {string} contentURL 
 * @param {} localizationData - A dictionary containing the localization data with "arscene_pose" key.
 * @returns 
 */
async function loadContentfromURL(contentURL, localizationURL, localizationData) {
    var fullContentURL = platformURL + contentURL;
    asset_id = 'asset/' + contentURL;
    entity_id = 'entity/' + contentURL;

    // Check if the asset and entity already exist
    var asset_item = document.getElementById(asset_id);
    var content_entity = document.getElementById(entity_id);
    if (asset_item && content_entity) {
        // Update the pose of the entity if the confidence is higher than the max confidence this session
        if (localizationData['confidence'] >= max_confidence_this_session[localizationURL]) {
            console.log("Updating pose of existing entity");
            apply_pose_matrix(content_entity.object3D, localizationData['arscene_pose']);
        }
        return;
    }
    
    console.log("Loading content from URL:", contentURL);

    // Create the asset
    asset_item = document.createElement('a-asset-item');
    asset_item.setAttribute('id', asset_id);
    asset_item.setAttribute('src', fullContentURL);
    networkAssetsEl.appendChild(asset_item);

    // Create the entity that uses the asset
    content_entity = document.createElement('a-entity');
    content_entity.setAttribute('id', entity_id);
    content_entity.setAttribute('gltf-model', '#' + asset_id);
    sceneEl.appendChild(content_entity);

    // Update the pose of the entity
    apply_pose_matrix(content_entity.object3D, localizationData['arscene_pose']);
}

/**
 * Sends an image to the localization server and gets the localization data.
 * @param {string} localizationURL 
 * @returns localizationData
 */
async function getLocalizationDataFromServer(localizationURL, formData) {
    localizationData = await fetchJSON(localizationURL, formData);
    return localizationData;
}

/**
 * Starts the discovery and localization pipeline:
 * Discover localization servers, get localization data from the servers, and load content from the server with max confidence.
 * @param {string} serverDiscoveryURL - URL of the server discovery service
 */
async function runDiscoveryAndLocalizationPipeline(serverDiscoveryURL) {
    // Discover the servers
    var serverList = await discoverServers(serverDiscoveryURL);
    console.log("Server list:", serverList);

    // Get current image to send to the localization servers
    imageBlob = await getImageBlobFromArray(currentPixelsArray, frameWidth, frameHeight, canvas);
    var formData = new FormData();
    formData.append('image', imageBlob, 'image.jpeg');
    aframeCameraEl.updateMatrixWorld(force = true);
    formData.append('aframe_camera_matrix_world', aframeCameraEl.matrixWorld.toArray());

    // Send requests to all servers in parallel
    var promises = [];
    for (var i = 0; i < serverList.length; i++) {
        promises.push(getLocalizationDataFromServer(serverList[i], formData));
    }
    var localizationDataList = await Promise.all(promises);

    // Update max_confidence_this_request and max_confidence_this_session
    // Get the localization data
    var max_confidence_this_request = {
        "confidence": 0,
        "localizationData": null,
        "serverURL": null
    };
    for (var i = 0; i < serverList.length; i++) {
        localizationData = localizationDataList[i];

        // Update max_confidence_this_request
        if (localizationData['confidence'] > max_confidence_this_request['confidence']) {
            max_confidence_this_request['confidence'] = localizationData['confidence'];
            max_confidence_this_request['localizationData'] = localizationData;
            max_confidence_this_request['serverURL'] = serverList[i];
        }

        // Update max_confidence_this_session
        if (max_confidence_this_session[serverList[i]] === undefined || max_confidence_this_session[serverList[i]] < localizationData['confidence']) {
            max_confidence_this_session[serverList[i]] = localizationData['confidence'];
        }
    }

    localizationURL = max_confidence_this_request['serverURL'];

    // Display the list of all localization servers with their confidence values
    // Sort the server list based on confidence in a separate list
    var serverListWithConfidence = [];
    for (var i = 0; i < serverList.length; i++) {
        serverListWithConfidence.push({
            "serverURL": serverList[i],
            "confidence": localizationDataList[i]['confidence']
        });
    }
    serverListWithConfidence.sort((a, b) => b['confidence'] - a['confidence']);
    var debugText = "";
    for (var i = 0; i < serverListWithConfidence.length; i++) {
        urlSplit = serverListWithConfidence[i]['serverURL'].split('/');
        debugText += urlSplit[urlSplit.length - 1] + ": " + serverListWithConfidence[i]['confidence'] + "\n";
    }
    debugTextEl.setAttribute('value', debugText);

    // Render the navigation path
    renderNavigationPath(
        max_confidence_this_request['serverURL'], 
        max_confidence_this_request['localizationData']['arscene_pose'],
    );
    // for (var i = 0; i < contentURLs.length; i++) {
    //     loadContentfromURL(contentURLs[i], max_confidence_this_request['serverURL'], max_confidence_this_request['localizationData']);
    // }
}

function onXRFrame(time, frame) {
    const { session } = frame;
    session.requestAnimationFrame(onXRFrame);
    const pose = frame.getViewerPose(xrRefSpace);

    if (!pose) return;

    pose.views.forEach((view) => {
        if (view.camera) {
            getCameraFramePixels(time, session, view);
        }
    });
}

function getCameraFramePixels(time, session, view) {
    const glLayer = session.renderState.baseLayer;
    if (frameWidth !== view.camera.width || frameHeight !== view.camera.height) {
        frameWidth = view.camera.width;
        frameHeight = view.camera.height;
        currentPixelsArray = new Uint8ClampedArray(frameWidth * frameHeight * 4); // RGBA image (4 values per pixel)
    }

    // get camera image as texture
    const texture = glBinding.getCameraImage(view.camera);

    // bind the framebuffer, attach texture and read pixels
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.readPixels(
        0,
        0,
        frameWidth,
        frameHeight,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        currentPixelsArray
    );
    // bind back to xr session's framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);
}

function initXRSession() {
    if (sceneEl.hasWebXR && navigator.xr && navigator.xr.addEventListener) {
        const { optionalFeatures } = sceneEl.systems.webxr.data;
        optionalFeatures.push('camera-access');
        sceneEl.systems.webxr.sceneEl.setAttribute('optionalFeatures', optionalFeatures);

        sceneEl.renderer.xr.addEventListener('sessionstart', () => {
            if (sceneEl.is('ar-mode')) {
                // Update XR Globals
                xrSession = sceneEl.xrSession;
                gl = sceneEl.renderer.getContext();
                frameWidth = gl.canvas.width;
                frameHeight = gl.canvas.height;
                currentPixelsArray = new Uint8Array(frameWidth * frameHeight * 4);

                // Get the WebXR WebGL binding
                glBinding = new XRWebGLBinding(xrSession, gl);
                fb = gl.createFramebuffer();
                xrSession.requestReferenceSpace('viewer').then((refSpace) => {
                    xrRefSpace = refSpace;
                    xrSession.requestAnimationFrame(onXRFrame);

                    // Start sending images to server

                    // Send the first image after 1 second.
                    // TODO: Send the first image immediately after first frame is captured.
                    setTimeout(() => {
                        runDiscoveryAndLocalizationPipeline(serverDiscoveryURL);
                    }, 1000);

                    // Send images to the server every time_interval_ms
                    setInterval(() => {
                        runDiscoveryAndLocalizationPipeline(serverDiscoveryURL);
                    }, time_interval_ms);
                });
            }
        });
    }
}

if (sceneEl.hasLoaded) {
    initXRSession();
} else {
    sceneEl.addEventListener('loaded', initXRSession);
}
