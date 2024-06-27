"""
Given the device's pose, the mapname being used and the target node, 
return the shortest path from the device's pose to the target node. 
"""
from flask import Blueprint, request, jsonify

from .. import shared_data
from src.graph import shortest_path

bp = Blueprint('shortest_path', __name__, url_prefix='/shortest_path')

@bp.route('/', methods=['POST'])
def get_shortest_path():
    mapname = request.form['mapname']
    device_position = request.form['position']
    device_position = list(map(float, device_position.split(',')))
    target = request.form['target']
    
    local_path, global_path = shortest_path.path_from_source_to_dest(
        position=device_position, 
        target=target,
        mapname=mapname, 
        mapname_to_df=shared_data['mapname_to_df'], 
        G=shared_data['graph']
    )

    return jsonify({
        'local_path': local_path,
        'global_path': global_path
    })
