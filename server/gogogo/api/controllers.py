#!/usr/bin/env python
# -​*- coding: utf-8 -*​-

""" controllers.py : controllers """

from flask import Blueprint
from flask import current_app as app
from flask import jsonify
from flask import request
import json
import subprocess


__author__ = "Abhay Arora ( @dumbstark )"


API = Blueprint('API', __name__, url_prefix='/api')


def create_command(args):
    shell = app._CONF.get('genymotion', 'genyshell_path')
    command = [shell, '-c']
    for arg in args:
        command.append(arg)
    return command


@API.route('/gps/location')
def gps_current_location():
    lat_res = subprocess.check_output(create_command(['gps getlatitude']))
    lng_res = subprocess.check_output(create_command(['gps getlongitude']))
    lat = float(lat_res.split('Latitude:')[1])
    lng = float(lng_res.split('Longitude:')[1])
    return jsonify(dict(status='SUCCESS',
                        location=dict(lat=lat,
                                      lng=lng)))


@API.route('/gps/update', methods=['POST'])
def gps_update():
    try:
        data = json.loads(request.data)
    except:
        return jsonify(dict(status='ERROR',
                            error='Could not parse JSON!'))
    subprocess.check_output(create_command(['gps setlatitude ' + str(data.get('lat', ''))]))
    subprocess.check_output(create_command(['gps setlongitude ' + str(data.get('lng', ''))]))
    return jsonify(dict(status='SUCCESS'))
