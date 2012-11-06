__author__ = 'hsk81'

###############################################################################
###############################################################################

from flask.ext.admin.contrib.sqlamodel import ModelView
from uuid import uuid4 as uuid_random

from extensions import db

###############################################################################
###############################################################################

class Set (db.Model):

    id = db.Column (db.Integer, primary_key=True)
    uuid = db.Column (db.String (36), unique=True)
    mime = db.Column (db.String (256))
    name = db.Column (db.Unicode (256))

    ##
    ## Set.subsets = Q (Set.query).all (base=set) for a set, which means that
    ## for any *non-base* "set": Q (set.subsets).all () = [].
    ##

    base_id = db.Column (db.Integer, db.ForeignKey ('set.id'))
    subsets = db.relationship ('Set',
        cascade='all', lazy='dynamic',
        primaryjoin="Set.base_id==Set.id",
        backref=db.backref ('base', remote_side='Set.id'))

    ##
    ## Set.sets = Q (Set.query).all (root=set) for a set, which means only the
    ## *immediate* sets for a given set.
    ##

    root_id = db.Column (db.Integer, db.ForeignKey ('set.id'))
    sets = db.relationship ('Set',
        cascade='all', lazy='dynamic',
        primaryjoin="Set.root_id==Set.id",
        backref=db.backref ('root', remote_side='Set.id'))

    def __init__ (self, name, root, uuid=None, mime=None):

        self.base = root.base if root and root.base else root
        self.uuid = uuid if uuid else str (uuid_random ())
        self.mime = mime if mime else 'application/set'
        self.name = unicode (name)
        self.root = root

    def __repr__ (self):

        return '<Set %r>' % self.name

class Doc (db.Model):

    id = db.Column (db.Integer, primary_key=True)
    uuid = db.Column (db.String (36), unique=True)
    mime = db.Column (db.String (256))
    name = db.Column (db.Unicode (256))
    ext = db.Column (db.Unicode (16))

    ##
    ## Set.subdocs = Q (Doc.query).all (base=set) for a set, which means that
    ## for any *non-base* "set": Q (set.subdocs).all () = [].
    ##

    base_id = db.Column (db.Integer, db.ForeignKey ('set.id'))
    base = db.relationship ('Set', primaryjoin="Doc.base_id==Set.id",
        backref=db.backref ('subdocs', lazy='dynamic', cascade='all'))

    ##
    ## Set.docs = Q (Doc.query).all (root=set) for a set, which means only the
    ## *immediate* docs for a given set.
    ##

    root_id = db.Column (db.Integer, db.ForeignKey ('set.id'))
    root = db.relationship ('Set', primaryjoin="Doc.root_id==Set.id",
        backref=db.backref ('docs', lazy='dynamic', cascade='all'))

    def __init__ (self, name, ext, root, uuid=None, mime=None):

        self.base = root.base if root and root.base else root
        self.mime = mime if mime else 'application/document'
        self.uuid = uuid if uuid else str (uuid_random ())
        self.name = unicode (name)
        self.ext = unicode (ext)
        self.root = root

    def __repr__ (self):

        return u'<Doc %r>' % (self.name + u'.' + self.ext)

    fullname = property (lambda self: '%s.%s' % (self.name, self.ext))

###############################################################################
###############################################################################

class SetAdmin (ModelView):

    list_columns = ('base', 'root', 'uuid', 'mime', 'name')
    searchable_columns = (Set.uuid, Set.mime, Set.name)
    column_filters = (Set.uuid, Set.mime, Set.name)

    def __init__ (self, session):
        super (SetAdmin, self).__init__(Set, session)

class DocAdmin (ModelView):

    list_columns = ('base', 'root', 'uuid', 'mime', 'name', 'ext')
    searchable_columns = (Doc.uuid, Doc.mime, Doc.name, Doc.ext)
    column_filters = (Doc.uuid, Doc.mime, Doc.name, Doc.ext)

    def __init__ (self, session):
        super (DocAdmin, self).__init__(Doc, session)

###############################################################################
###############################################################################
