from flask import Blueprint, render_template

from .. import shared_data

bp = Blueprint("main", __name__)


@bp.route("/", methods=["GET"])
def render_select_destination():
    return render_template(
        "select-destination.html", waypointsList=list(shared_data["graph"].nodes)
    )


@bp.route("/navigate/<destination>", methods=["GET"])
def return_aframe_page(destination):
    return render_template("aframe.html", destinationWaypoint=destination)
