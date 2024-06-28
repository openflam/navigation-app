from flask import Blueprint, render_template

bp = Blueprint('main', __name__)

@bp.route('/', methods=['GET'])
def return_aframe_page():
    return render_template('aframe.html')