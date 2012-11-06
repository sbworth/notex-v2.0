__author__ = 'hsk81'

###############################################################################
###############################################################################

from flask.ext.debugtoolbar import DebugToolbarExtension
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.admin import Admin

from app import app

###############################################################################
###############################################################################

toolbar = DebugToolbarExtension (app)
db = SQLAlchemy (app)
admin = Admin (app)

###############################################################################
###############################################################################
