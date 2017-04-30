#!/usr/bin/env python
# -​*- coding: utf-8 -*​-

""" wsgi.py : wsgi """

from flask import Flask
from pyjade.ext.jinja import PyJadeExtension
import os

from datastore import bind_datastores

__author__ = "Abhay Arora ( @dumbstark )"


def create_wsgi_app(config, controllers):

    app = Flask(__name__,
                static_folder=os.path.dirname(__file__) + '/../static')
    app.jinja_env.add_extension(PyJadeExtension)

    app._CONF = config
    bind_datastores(config, app)

    for controller in controllers:
        try:
            prefix = config.get('routing', controller.name + '.url_prefix')
        except:
            prefix = ''
        try:
            subdomain = config.get('routing', controller.name + '.subdomain')
        except:
            subdomain = ''
        if len(subdomain) > 0:
            if len(prefix) > 0:
                app.register_blueprint(controller,
                                       subdomain=subdomain,
                                       url_prefix=prefix)
            else:
                app.register_blueprint(controller, subdomain=subdomain)
        else:
            if len(prefix) > 0:
                app.register_blueprint(controller, url_prefix=prefix)
            else:
                app.register_blueprint(controller)
    return app
