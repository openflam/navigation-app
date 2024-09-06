# Create graph from a collection of intra-map graphs specified as CSV files.
from pathlib import Path
import glob

import networkx as nx
import numpy as np
import pandas as pd


def update_graph_from_dataframe(G, intragraph_dataframe, neighbours_separator=";"):
    """
    Add intra-graph data from the pandas dataframe into the global graph G.
    The intragraph_dataframe is indexed by node ID.
    """
    for node_id in intragraph_dataframe.index:
        G.add_node(node_id)

        row = intragraph_dataframe.loc[node_id]
        this_position = np.array([row["x"], row["y"], row["z"]])
        neighbors = row["neighbors"].split(neighbours_separator)

        for neighbor in neighbors:
            neigh_row = intragraph_dataframe.loc[neighbor]
            neighbor_position = np.array(
                [neigh_row["x"], neigh_row["y"], neigh_row["z"]]
            )
            distance = np.linalg.norm(this_position - neighbor_position)
            G.add_edges_from([(node_id, neighbor, {"distance": distance})])


def get_graph_from_df_list(df_list):
    """
    Given a list of Pandas DataFrames, parse all of them and create a graph.
    """
    G = nx.Graph()
    for df in df_list:
        update_graph_from_dataframe(G, df)
    return G


def get_all_dfs_in_directory(directory):
    """
    Given a directory, return a dictionary of all the dataframes
    in that directory, keyed by the name
    """
    intramap_graph_csvs = glob.glob(f"{directory}/*/waypoints_graph.csv")
    mapname_to_df = {}

    for csv_path in intramap_graph_csvs:
        localization_url_file = Path(csv_path).parent / "localization_url.txt"
        mapname = localization_url_file.read_text().strip()
        this_map_df = pd.read_csv(csv_path, index_col="id")
        mapname_to_df[mapname] = this_map_df
    return mapname_to_df


def get_graph_and_dfs_from_directory(directory):
    """
    Given a directory, return a graph and a dictionary of all the dataframes
    in that directory, keyed by the name
    """
    mapname_to_df = get_all_dfs_in_directory(directory)
    G = get_graph_from_df_list(list(mapname_to_df.values()))

    print("Loaded graphs for URLs: ", list(mapname_to_df.keys()))
    print(f"Graph has {len(G.nodes)} nodes and {len(G.edges)} edges")

    return G, mapname_to_df
