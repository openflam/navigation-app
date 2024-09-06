import { Matrix4 } from "three";
import { applyPoseMatrix } from "./utils";
import { LoalizationResult } from "../openvps/discover-localize";
import { arraytoMatrix4 } from '../utils/matrix-operations';
import { getRandomColor } from "./random-color-generator";

interface NavPath {
    local_path: Array<[string, Array<number>]>;
    global_path: Array<[string, Array<number>]>;
}

async function getNavigationPath(mapServerName: string, latestLocalizationPose: Matrix4) {
    const formData = new FormData();
    formData.append('mapname', mapServerName);
    var position = getPositionFromMatrix(latestLocalizationPose);
    formData.append('position', position.x + "," + position.y + "," + position.z);
    formData.append('target', globalThis.destinationWaypoint);

    var navigationPath = await fetchJSON('/shortest_path', formData);

    return navigationPath;
}

function createNavGraphEntity(navigationPath: NavPath, id: string, mapServerName: string) {
    // Generate navigation path entity
    var navGraphEntity = document.createElement('a-entity');
    navGraphEntity.setAttribute('id', id);

    // Add nav markers to the navGraphEntity
    var local_path = navigationPath.local_path;
    for (let i = 0; i < local_path.length; i++) {
        var nav_marker = local_path[i];
        var nav_marker_name = nav_marker[0];
        var nav_marker_position = nav_marker[1];

        var nav_marker_entity = document.createElement('a-entity');
        nav_marker_entity.setAttribute('id', nav_marker_name);
        nav_marker_entity.setAttribute('waypoint',
            {
                name: nav_marker_name,
                color: globalThis.mapInfoDict[mapServerName].waypointColor
            }
        );
        nav_marker_entity.object3D.position.set(
            nav_marker_position[0],
            nav_marker_position[1],
            nav_marker_position[2]
        );
        navGraphEntity.appendChild(nav_marker_entity);
    }

    // Add nav edges to the navGraphEntity
    for (let i = 0; i < local_path.length - 1; i++) {
        var this_nav_marker = local_path[i];
        var next_nav_marker = local_path[i + 1];

        var start_position = this_nav_marker[1];
        var end_position = next_nav_marker[1];

        var nav_arrow_entity = document.createElement('a-entity');
        nav_arrow_entity.setAttribute('arrow', {
            start: { x: start_position[0], y: start_position[1], z: start_position[2] },
            end: { x: end_position[0], y: end_position[1], z: end_position[2] },
            color: globalThis.mapInfoDict[mapServerName].waypointColor
        });
        navGraphEntity.appendChild(nav_arrow_entity);
    }
    return navGraphEntity;
}


async function renderNavigationPath(localizationResult: LoalizationResult) {
    let mapServerName = localizationResult.mapServer.name;
    let objectPose = localizationResult.objectPose;
    let latestLocalizationPose = arraytoMatrix4(localizationResult.mapServer.getLatestLocalizationData().pose);

    // Do not do anything if the confidence is low
    let latestLocalizationConfidence = localizationResult.mapServer.getLatestLocalizationData().serverConfidence;
    if (mapServerName in globalThis.mapInfoDict &&
        globalThis.mapInfoDict[mapServerName].highestLocalizationConfidence >= latestLocalizationConfidence
    ) {
        return;
    }

    // Update the highest localization confidence
    if (mapServerName in globalThis.mapInfoDict) {
        globalThis.mapInfoDict[mapServerName].highestLocalizationConfidence = latestLocalizationConfidence;
    }
    else {
        globalThis.mapInfoDict[mapServerName] = {
            highestLocalizationConfidence: latestLocalizationConfidence,
            waypointColor: getRandomColor(),
        };
    }

    var navigationPath = await getNavigationPath(mapServerName, latestLocalizationPose);
    console.log(navigationPath);

    // Create the navGraphEntity
    let navgraphID = 'navGraph-' + mapServerName;
    var navGraphEntity = createNavGraphEntity(navigationPath, navgraphID, mapServerName);

    // Update the pose of the navGraphEntity
    applyPoseMatrix(navGraphEntity.object3D, objectPose);

    // If the navGraph already exists, remove it
    var old_navGraph = document.getElementById(navgraphID);
    if (old_navGraph) {
        scene.removeChild(old_navGraph);
    }
    scene.appendChild(navGraphEntity);
}

async function fetchJSON(url: string, formData: FormData) {
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

function getPositionFromMatrix(matrix: Matrix4) {
    // Decompose matrix into position, rotation, and scale
    var position = new AFRAME.THREE.Vector3();
    var quaternion = new AFRAME.THREE.Quaternion();
    var scale = new AFRAME.THREE.Vector3();
    matrix.decompose(position, quaternion, scale);

    return position;
}

export { renderNavigationPath };