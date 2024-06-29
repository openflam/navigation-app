const navigationAppURL = "/shortest_path";
const target = "nunga_computer";
var navigationPath_debug = 0;
var position_debug = 0;

const scene = document.querySelector('a-scene');

/**
 * Sends the localization URL and the location to the navigation app and gets the navigation data
 * @param {string} localizationURL 
 * @param {string} localizationPose
 * @returns The navigation path
 */
async function getNavigationPath(localizationURL, localizationPose) {
    const formData = new FormData();
    formData.append('mapname', localizationURL);
    var position = get_position_from_matrix(localizationPose);
    formData.append('position', position.x+","+position.y+","+position.z);
    formData.append('target', target);

    var navigationPath = await fetchJSON(navigationAppURL, formData);
    
    return navigationPath;
}


async function renderNavigationPath(localizationURL, localizationPose) {
    var navigationPath = await getNavigationPath(localizationURL, localizationPose);
    console.log(navigationPath);
    navigationPath_debug = navigationPath;

    // Generate navigation path entity
    var navGraphEntity = document.createElement('a-entity');
    navGraphEntity.setAttribute('id', 'navGraph');

    // Add nav markers to the navGraphEntity
    var local_path = navigationPath.local_path;
    for (let i = 0; i < local_path.length; i++) {
        var nav_marker = local_path[i];
        var nav_marker_name = nav_marker[0];
        var nav_marker_position = nav_marker[1];

        var nav_marker_entity = document.createElement('a-sphere');
        nav_marker_entity.setAttribute('id', nav_marker_name);
        nav_marker_entity.setAttribute('radius', 0.3);
        // The navmarkers are in z-up coordinates, so we need to convert them to y-up
        nav_marker_entity.object3D.position.set(
            nav_marker_position[0], 
            nav_marker_position[2], 
            -nav_marker_position[1]
        );
        navGraphEntity.appendChild(nav_marker_entity);
        
    }

    // Update the pose of the navGraphEntity
    apply_pose_matrix(navGraphEntity.object3D, localizationPose);

    // If the navGraph already exists, remove it
    var old_navGraph = document.getElementById('navGraph');
    if (old_navGraph) {
        scene.removeChild(old_navGraph);
    }
    scene.appendChild(navGraphEntity);
}