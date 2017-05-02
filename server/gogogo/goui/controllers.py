#!/usr/bin/env python
# -​*- coding: utf-8 -*​-

""" controllers.py : controllers """

import os
from flask import Blueprint
from flask import render_template
from flask import send_file
from flask import current_app as app

__author__ = "Abhay Arora ( @dumbstark )"


GoUI = Blueprint('GoUI', __name__, template_folder='views')


@GoUI.route('/')
def index():
    return render_template('gogogo.jade',
                           google_maps_api_key=app._CONF.get('google_maps',
                                                             'api_key'))


@GoUI.route('/view/<view_name>')
def view(view_name):
    try:
        ret = render_template(view_name + '.jade')
    except:
        try:
            fn = '/views/' + view_name + '.html'
            ret = send_file(os.path.dirname(__file__) + fn)
        except:
            ret = ''
    return ret
