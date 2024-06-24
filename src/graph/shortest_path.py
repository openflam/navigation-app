import numpy as np
import networkx as nx

def get_closest_node_in_df(position, this_map_df):
    """
    Given a 3D position (the user's position) and an intra-map dataframe,
    return the node closest to the position.
    """
    closest_node = None
    shortest_distance = np.inf
    for node in this_map_df.index:
        row = this_map_df.loc[node]
        node_pos = np.array([row.x, row.y, row.z])

        this_dist = np.linalg.norm(node_pos - position)
        if shortest_distance > this_dist:
            shortest_distance = this_dist
            closest_node = node
    return closest_node

def path_from_source_to_dest(position, target, mapname, mapname_to_df, G):
    """
    Given user's position and their target (which can be from a different map),
    return the list of nodes and their positions in the current map.
    """
    position = np.array(position)
    this_map_df = mapname_to_df[mapname]
    source = get_closest_node_in_df(position, this_map_df)

    global_shortest_path = nx.shortest_path(G, source, target)

    # Get the prefix of the global path 
    # that is part of this map
    this_map_nodes = []
    for node in global_shortest_path:
        if node in this_map_df.index:
            this_map_nodes.append(node)
        else:
            break # Break as soon as a switch to another map is encountered

    path = []
    for node in this_map_nodes:
        this_row = this_map_df.loc[node]
        position = [float(this_row.x), float(this_row.y), float(this_row.z)]
        path.append((node, position))
    return path, global_shortest_path
