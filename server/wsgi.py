#!/usr/bin/env python
# -​*- coding: utf-8 -*​-

""" wsgi.py : wsgi """

import os
from configparser import ConfigParser

from gogogo.utils.wsgi import create_wsgi_app
from gogogo import controllers
from gogogo.models import schemas
from gogogo.utils.datastore import init_schemas

__author__ = "Abhay Arora ( @dumbstark )"


conf = ConfigParser()
conf.read(os.path.dirname(os.path.abspath(__file__)) + '/gogogo.ini')

app = create_wsgi_app(config=conf, controllers=controllers)
''' Intialize database schemas '''
init_schemas(schemas, app._DS['default'])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=2502, debug=True)
