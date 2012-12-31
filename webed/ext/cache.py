__author__ = 'hsk81'

###############################################################################
###############################################################################

from flask.ext.cache import Cache
from ..app import app

import hashlib
import functools

###############################################################################
###############################################################################

class WebedCache (Cache):

    @staticmethod
    def make_key (*args, **kwargs):

        kwargs.update (dict (enumerate (args)))
        string = unicode (sorted (kwargs.items ()))
        hashed = hashlib.sha512 (string)

        return hashed.hexdigest ()

    def cached (self, timeout=None, name=None, unless=None, session=None,
                sidfunc=None, keyfunc=None):

        if not callable (keyfunc):
            keyfunc = lambda sid, fn, *args, **kwargs: \
                WebedCache.make_key (sid, name or fn.__name__) ## no (kw)args!

        return self.memoize (timeout, name, unless, session, sidfunc, keyfunc)

    def memoize (self, timeout=None, name=None, unless=None, session=None,
                 sidfunc=None, keyfunc=None):

        if session and callable (sidfunc):
            sid = sidfunc (session)
        elif session:
            assert '_id' in session
            sid = session['_id']
        else:
            sid = None

        if not callable (keyfunc):
            keyfunc = WebedCache.make_key

        def decorator (fn):
            @functools.wraps (fn)
            def decorated (*args, **kwargs):

                if callable (unless) and unless () is True:
                    return fn (*args, **kwargs)

                key = keyfunc (sid, name or fn.__name__, *args, **kwargs)
                cached_value = self.get (key)

                if cached_value is None:
                    cached_value = fn (*args, **kwargs)
                    self.set (key, cached_value, timeout=timeout)

                return cached_value
            return decorated
        return decorator

cache = WebedCache (app)

###############################################################################
###############################################################################
