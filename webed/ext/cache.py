__author__ = 'hsk81'

###############################################################################
###############################################################################

from ..app import app
from ..util import JSON

import abc
import redis
import pylibmc
import hashlib
import functools

###############################################################################
###############################################################################

DEFAULT_TIMEOUT = app.config['CACHE_DEFAULT_TIMEOUT']

###############################################################################
###############################################################################

class WebedCache (object):
    __metaclass__ = abc.ABCMeta

    @abc.abstractproperty
    def INDEFINITE (self): return
    @abc.abstractproperty
    def IMMEDIATE (self): return

    @abc.abstractmethod
    def get (self, key): return
    @abc.abstractmethod
    def set (self, key, value, expiry=DEFAULT_TIMEOUT): pass
    @abc.abstractmethod
    def delete (self, key): pass
    @abc.abstractmethod
    def expire (self, key, expiry=DEFAULT_TIMEOUT): pass
    @abc.abstractmethod
    def exists (self, key): return
    @abc.abstractmethod
    def increase_version (self, *args, **kwargs): pass
    @abc.abstractmethod
    def decrease_version (self, *args, **kwargs): pass
    @abc.abstractmethod
    def flush_all (self): pass

    ###########################################################################

    def cached (self, expiry=DEFAULT_TIMEOUT, name=None, session=None,
                keyfunc=None, unless=None, lest=None):

        if not callable (keyfunc):
            keyfunc = lambda sid, fn, *args, **kwargs:\
            self.make_key (sid, name or fn.__name__) ## no (kw)args!

        return self.memoize (expiry, name, session, keyfunc, unless, lest)

    def memoize (self, expiry=DEFAULT_TIMEOUT, name=None, session=None,
                 keyfunc=None, unless=None, lest=None):

        if session:
            sid = session['_id']
        else:
            sid = None

        if not callable (keyfunc):
            keyfunc = self.make_key

        def decorator (fn):
            @functools.wraps (fn)
            def decorated (*args, **kwargs):

                if callable (unless) and unless () is True:
                    return fn (*args, **kwargs)
                if callable (lest) and lest (*args, **kwargs) is True:
                    return fn (*args, **kwargs)

                value_key = keyfunc (sid, name or fn.__name__, *args, **kwargs)
                cached_value = self.get (value_key)

                if cached_value is None:
                    cached_value = fn (*args, **kwargs)
                    self.set (value_key, cached_value, expiry=expiry)
                return cached_value

            decorated.uncached = fn
            decorated.expiry = expiry

            return decorated
        return decorator

    def version (self, expiry=DEFAULT_TIMEOUT, *args, **kwargs):

        def decorator (fn):
            @functools.wraps (fn)
            def decorated (*fn_args, **fn_kwargs):

                version_key = self.version_key (*args, **kwargs)
                version = self.get (version_key) or 0
                value_key = self.make_key (version, *args, **kwargs)
                cached_value = self.get (value_key)

                if not cached_value:
                    cached_value = fn (*fn_args, **fn_kwargs)
                    self.set (version_key, version, expiry=expiry)
                    self.set (value_key, cached_value, expiry=expiry)
                return cached_value

            decorated.uncached = fn
            decorated.expiry = expiry

            return decorated
        return decorator

    @staticmethod
    def version_key (*args, **kwargs):
        return WebedCache.make_key ('version', *args, **kwargs)

    @staticmethod
    def make_key (*args, **kwargs):

        kwargs.update (dict (enumerate (args)))
        string = unicode (sorted (kwargs.items ()))
        hashed = hashlib.md5 (string)

        return hashed.hexdigest ()

###############################################################################
###############################################################################

class WebedMemcached (WebedCache):

    @property
    def INDEFINITE (self):
        return 0

    @property
    def IMMEDIATE (self):
        return None

    def __init__ (self, app, servers=None, pool_size=None, prefix=None):
        self.app = app

        self.SERVERS = servers if servers else \
            app.config.get ('CACHE_SERVERS', None)
        assert isinstance (self.SERVERS, list)
        self.KEY_PREFIX = prefix if prefix else \
            app.config.get ('CACHE_KEY_PREFIX', None)
        assert isinstance (self.KEY_PREFIX, str)
        self.POOL_SIZE = pool_size if pool_size else \
            app.config.get ('CACHE_POOL_SIZE', 2**8)
        assert isinstance (self.POOL_SIZE, int)

        app.mc = pylibmc.Client (self.SERVERS, binary=True, behaviors={
            'tcp_nodelay': True,
            'no_block': True,
            'ketama': True
        })

        app.mc_pool = pylibmc.ClientPool (app.mc, self.POOL_SIZE)

    def get (self, key):
        with self.app.mc_pool.reserve () as mc:
            return mc.get (self.KEY_PREFIX+key)

    def set (self, key, value, expiry=DEFAULT_TIMEOUT):
        with self.app.mc_pool.reserve () as mc:
            if expiry == self.IMMEDIATE:
                mc.delete (self.KEY_PREFIX+key)
            else:
                mc.set (self.KEY_PREFIX+key, value, time=expiry)

    def delete (self, key):
        with self.app.mc_pool.reserve () as mc:
            mc.delete (self.KEY_PREFIX+key)

    def expire (self, key, expiry=DEFAULT_TIMEOUT):
        with self.app.mc_pool.reserve () as mc:
            if expiry == self.IMMEDIATE:
                mc.delete (self.KEY_PREFIX+key)
            else:
                mc.touch (self.KEY_PREFIX+key, time=expiry)

    def exists (self, key):
        with self.app.mc_pool.reserve () as mc:
            return self.KEY_PREFIX+key in mc

    def increase_version (self, *args, **kwargs):
        version_key = self.KEY_PREFIX+self.version_key (*args, **kwargs)
        with self.app.mc_pool.reserve () as mc:
            if version_key not in mc:
                mc.set (version_key, +1, time=self.INDEFINITE)
            else:
                mc.incr (version_key)

    def decrease_version (self, *args, **kwargs):
        version_key = self.KEY_PREFIX+self.version_key (*args, **kwargs)
        with self.app.mc_pool.reserve () as mc:
            if version_key not in mc:
                mc.set (version_key, -1, time=self.INDEFINITE)
            else:
                mc.set (version_key, int (mc.get (version_key))-1,
                    time=self.INDEFINITE)

    def flush_all (self):
        with self.app.mc_pool.reserve () as mc:
            mc.flush_all ()

###############################################################################
###############################################################################

class WebedRedis (WebedCache):

    @property
    def INDEFINITE (self):
        return None

    @property
    def IMMEDIATE (self):
        return 0

    def __init__ (self, app, servers=None, port=None, prefix=None, db=0):
        self.app = app

        self.SERVERS = servers if servers else \
            app.config.get ('CACHE_SERVERS', None)
        assert isinstance (self.SERVERS, list)
        self.KEY_PREFIX = prefix if prefix else \
            app.config.get ('CACHE_KEY_PREFIX', None)
        assert isinstance (self.KEY_PREFIX, str)
        self.PORT = port if port else \
            app.config.get ('CACHE_PORT', 6379)
        assert isinstance (self.PORT, int)

        app.rd = redis.StrictRedis (host=self.SERVERS[0], port=self.PORT,
            db=db)

    def get (self, key):
        return JSON.decode (self.app.rd.get (self.KEY_PREFIX+key) or 'null')

    def set (self, key, value, expiry=DEFAULT_TIMEOUT):
        if expiry == self.INDEFINITE:
            self.app.rd.pipeline () \
                .set (self.KEY_PREFIX+key, JSON.encode (value)) \
                .persist (self.KEY_PREFIX+key) \
                .execute ()
        else:
            self.app.rd.pipeline () \
                .set (self.KEY_PREFIX+key, JSON.encode (value)) \
                .expire (self.KEY_PREFIX+key, time=expiry) \
                .execute ()

    def delete (self, key):
        self.app.rd.delete (self.KEY_PREFIX+key)

    def expire (self, key, expiry=DEFAULT_TIMEOUT):
        if expiry == self.INDEFINITE:
            self.app.rd.persist (self.KEY_PREFIX+key)
        else:
            self.app.rd.expire (self.KEY_PREFIX+key, time=expiry)

    def exists (self, key):
        return self.app.rd.exists (self.KEY_PREFIX+key)

    def increase_version (self, *args, **kwargs):
        version_key = self.version_key (*args, **kwargs)
        self.app.rd.incr (self.KEY_PREFIX+version_key)

    def decrease_version (self, *args, **kwargs):
        version_key = self.version_key (*args, **kwargs)
        self.app.rd.decr (self.KEY_PREFIX+version_key)

    def flush_all (self):
        self.app.rd.flushall ()

###############################################################################
###############################################################################

cache = WebedRedis (app, servers=app.config['CACHE0_SERVERS'],
    prefix=app.config['CACHE0_KEY_PREFIX'], db=0)

object_cache = WebedRedis (app, servers=app.config['CACHE1_SERVERS'],
    prefix=app.config['CACHE1_KEY_PREFIX'], db=1)

###############################################################################
###############################################################################
