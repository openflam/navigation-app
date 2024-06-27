from flask import Flask

from .config import Config
from src.graph import create_graph

# To store the graph created when the server is launched
shared_data = {}


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)
    
    # Create the graph and store it in shared_data
    G, mapname_to_df = create_graph.get_graph_and_dfs_from_directory(Config["DATA_DIR"])
    shared_data['graph'] = G
    shared_data['mapname_to_df'] = mapname_to_df
    
    # Register routes
    from .routes import shortest_path
    app.register_blueprint(shortest_path.bp)
    
    return app
