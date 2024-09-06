import requests
import os

import pandas as pd


def download_and_create_csvs(map_urls_filepath, data_dir):
    with open(map_urls_filepath, "r") as f:
        map_urls = f.readlines()

    for map_url in map_urls:
        map_url = map_url.strip()
        waypoints = get_waypoints(map_url)
        print(f"Downloaded waypoints for {map_url}")

        create_csv(data_dir, map_url, waypoints)


def create_csv(data_dir, map_url, waypoints):
    # This function creates a CSV file in the specified directory
    # with the given waypoints object

    mapname = map_url.split("/")[-1]

    # Create a directory for the map if it doesn't exist
    mapdir = f"{data_dir}/{mapname}"
    os.makedirs(mapdir, exist_ok=True)
    filename = f"{mapdir}/waypoints_graph.csv"

    csv_records = []
    for waypoint in waypoints:
        csv_records.append(
            {
                "id": waypoint["name"],
                "x": waypoint["position"][0],
                "y": waypoint["position"][1],
                "z": waypoint["position"][2],
                "neighbors": ";".join(waypoint["neighbors"]),
            }
        )

    df = pd.DataFrame(csv_records)
    df.to_csv(filename, index=False)

    # Create localization_url.txt
    with open(f"{mapdir}/localization_url.txt", "w") as f:
        f.write(map_url)


def get_waypoints(map_url):
    # This function sends a GET request to the spatial server's /waypoints
    # endpoint and returns the waypoints object
    waypoints = requests.get(f"https://{map_url}/waypoints", verify=False).json()
    return waypoints
