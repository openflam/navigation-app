const navigationAppURL = "/shortest_path";
const target = "nunga_computer";

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


function createNavGraphEntity(navigationPath) {
    // Generate navigation path entity
    var navGraphEntity = document.createElement('a-entity');
    navGraphEntity.setAttribute('id', 'navGraph');

    // Add nav markers to the navGraphEntity
    var local_path = navigationPath.local_path;
    for (let i = 0; i < local_path.length; i++) {
        var nav_marker = local_path[i];
        var nav_marker_name = nav_marker[0];
        var nav_marker_position = nav_marker[1];

        var nav_marker_entity = document.createElement('a-entity');
        nav_marker_entity.setAttribute('id', nav_marker_name);
        nav_marker_entity.setAttribute('navmarker', {name: nav_marker_name});
        // The navmarkers are in z-up coordinates, so we need to convert them to y-up
        nav_marker_entity.object3D.position.set(
            nav_marker_position[0], 
            nav_marker_position[2], 
            -nav_marker_position[1]
        );
        navGraphEntity.appendChild(nav_marker_entity);
    }

    // Add nav edges to the navGraphEntity
    for (let i = 0; i < local_path.length - 1; i++) {
        var this_nav_marker = local_path[i];
        var next_nav_marker = local_path[i+1];

        var start_position = this_nav_marker[1];
        var end_position = next_nav_marker[1];

        var nav_arrow_entity = document.createElement('a-entity');
        // The navmarkers are in z-up coordinates, so we need to convert them to y-up
        nav_arrow_entity.setAttribute('arrow', {
            start: {x: start_position[0], y: start_position[2], z: -start_position[1]},
            end: {x: end_position[0], y: end_position[2], z: -end_position[1]}
        });
        navGraphEntity.appendChild(nav_arrow_entity);
    }
    return navGraphEntity;
}


async function renderNavigationPath(localizationURL, localizationPose) {
    var navigationPath = await getNavigationPath(localizationURL, localizationPose);
    console.log(navigationPath);

    // Create the navGraphEntity
    var navGraphEntity = createNavGraphEntity(navigationPath);

    // Update the pose of the navGraphEntity
    apply_pose_matrix(navGraphEntity.object3D, localizationPose);

    // If the navGraph already exists, remove it
    var old_navGraph = document.getElementById('navGraph');
    if (old_navGraph) {
        scene.removeChild(old_navGraph);
    }
    scene.appendChild(navGraphEntity);
}