__author__ = 'hsk81'

###############################################################################
###############################################################################

from flask.app import Flask
import settings

###############################################################################
###############################################################################

app = Flask (__name__)
app.config.from_object (settings)
app.config.from_envvar ('WEBED_SETTINGS', silent=True)

###############################################################################
###############################################################################
