import { WayPoint } from "@openvps/dnsspatialdiscovery";
import type { Matrix4, Object3D } from "three";
import type { LoalizationResult } from "../openvps/discover-localize";
import { getRandomColor } from "./random-color-generator";

async function renderNavPath(localizationResult: LoalizationResult) {
    // Do not change anything if the confidence of the latest localization result is lower than
    // the best result so far.
    let mapServerName = localizationResult.mapServer.name;
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

    // Fecth waypoints from the server
    let waypoints = await localizationResult.mapServer.queryWaypoints();

    // Create the waypointsGraph entity
    var waypointsGraphEntity = createWaypointsGraphEntity(waypoints, mapServerName);

    // Apply the object pose to the waypointsGraph entity
    applyPoseMatrix(waypointsGraphEntity.object3D, localizationResult.objectPose);

    // If the navGraph already exists, remove it
    var oldwaypointsGraphEntity = document.getElementById(`waypoints-graph-${mapServerName}`);
    if (oldwaypointsGraphEntity) {
        globalThis.scene.removeChild(oldwaypointsGraphEntity);
    }
    globalThis.scene.appendChild(waypointsGraphEntity);
}

function createWaypointsGraphEntity(waypoints: WayPoint[], mapServerName: string) {
    // Generate waypoints graph root entitrt
    var waypointsGraphEntity = document.createElement('a-entity');
    waypointsGraphEntity.setAttribute('id', `waypoints-graph-${mapServerName}`);

    // Add the waypoints to the waypoints graph entity
    waypoints.forEach(waypoint => {
        var waypointEntity = document.createElement('a-entity');
        waypointEntity.setAttribute('id', waypoint.name);

        // Set the waypoint component attributes
        let waypointColor = getRandomColor();
        if (mapServerName in globalThis.mapInfoDict) {
            waypointColor = globalThis.mapInfoDict[mapServerName].waypointColor;
        }
        waypointEntity.setAttribute('waypoint', { name: waypoint.name, color: waypointColor });

        // Set the position of the waypoints
        waypointEntity.object3D.position.set(
            waypoint.position[0],
            waypoint.position[1],
            waypoint.position[2],
        );

        // Add the waypoint entity to the waypoints graph entity
        waypointsGraphEntity.appendChild(waypointEntity);

        // Add the waypoint connections to each neighbor
        waypoint.neighbors.forEach(neighborName => {
            let neighborWaypoint = waypoints.find(w => w.name === neighborName);
            if (waypoint.name > neighborWaypoint.name) {
                // Only create the connection once for a pair of waypoints
                return;
            }
            let connectionEntity = document.createElement('a-entity');
            connectionEntity.setAttribute('id', `${waypoint.name}-${neighborName}`);
            connectionEntity.setAttribute('waypoint-connection', {
                start: {
                    x: waypoint.position[0],
                    y: waypoint.position[1],
                    z: waypoint.position[2],
                },
                end: {
                    x: neighborWaypoint.position[0],
                    y: neighborWaypoint.position[1],
                    z: neighborWaypoint.position[2],
                },
                id: `${waypoint.name}-${neighborName}`,
            });
            waypointsGraphEntity.appendChild(connectionEntity);
        });
    });

    return waypointsGraphEntity;
}

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

export { renderNavPath };