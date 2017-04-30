#!/usr/bin/env python
# -​*- coding: utf-8 -*​-

""" datastore.py : datastore """

from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

__author__ = "Abhay Arora ( @dumbstark )"


class DataStore:

        def __init__(self, engine):
            self.set_engine(engine)

        def set_engine(self, engine):
            self.engine = engine
            self.session_factory = sessionmaker(bind=engine)

        def get_engine(self):
            return self.engine

        def get_session(self):
            return self.session_factory()


def bind_datastores(config, app):
    settings = config.items('datastores')
    datastores = dict()
    for setting in settings:
        ds_name, setting_name = setting[0].split('.')
        if ds_name not in datastores:
            datastores[ds_name] = dict()
        datastores[ds_name][setting_name] = setting[1]
    app._DS = dict()
    for ds in datastores.keys():
        dsn = datastores.get(ds)
        try:
            url = dsn.get('dialect')
            if dsn.get('driver', None) is not None and\
               len(dsn.get('driver', '')) > 0:
                url += '+' + dsn.get('driver')
            url += '://'
            if dsn.get('username', None) is not None and\
               len(dsn.get('username', '')) > 0:
                url += dsn.get('username')
            if dsn.get('password', None) is not None and\
               len(dsn.get('password', '')) > 0:
                url += ':' + dsn.get('password')
            if (dsn.get('username', None) is not None and len(dsn.get('username', '')) > 0) or\
                (dsn.get('password', None) is not None and len(dsn.get('password', '')) > 0):
                url += '@'
            if dsn.get('host', None) is not None and\
               len(dsn.get('host', '')) > 0:
                url += dsn.get('host')
            if dsn.get('port', None) is not None and\
               len(dsn.get('port', '')) > 0:
                url += ':' + dsn.get('port')
            if dsn.get('database', None) is not None and\
               len(dsn.get('database', '')) > 0:
                url += '/' + dsn.get('database')
            app._DS[ds] = DataStore(create_engine(url))
        except:
            pass


def init_schemas(schemas, datastore):
    for schema in schemas:
        schema.metadata.create_all(datastore.get_engine())

