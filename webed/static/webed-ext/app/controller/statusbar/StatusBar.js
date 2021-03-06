Ext.define ('Webed.controller.statusbar.StatusBar', {
    extend: 'Ext.app.Controller',

    requires: [
        'Ext.util.Cookies'
    ],

    refs: [{
        selector: 'viewport', ref: 'viewport'
    },{
        selector: 'webed-statusbar-progressbar', ref: 'progressBar'
    },{
        selector: 'webed-statusbar-infobutton', ref: 'infoButton'
    },{
        selector: 'webed-statusbar-zoombutton', ref: 'zoomButton'
    },{
        selector: 'webed-statusbar-zoomslider', ref: 'zoomSlider'
    },{
        selector: 'webed-statusbar', ref: 'statusBar'
    }],

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    init: function () {

        this.control ({
            'webed-statusbar-progressbar': {update: this.progress_update},
            'webed-statusbar-zoombutton': {click: this.zoom_click},
            'webed-statusbar-infobutton': {click: this.info_click},

            'webed-statusbar-lingua': {
                change: this.lingua_change,
                select: this.lingua_select
            },

            'webed-statusbar-zoomslider': {
                change: this.slider_change,
                afterrender: this.slider_afterrender
            },

            'code-area': {
                cursor: this.cursor
            }
        });

        this.application.on ({
            'progress-play': this.progress_play, scope: this});
        this.application.on ({
            'progress-stop': this.progress_stop, scope: this});
    },

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    lingua_change: function (self, newValue, oldValue) {
        if (oldValue && !newValue) {
            Webed.form.field.CodeArea.setTypoEngine (null);
            Webed.form.field.CodeArea.setDirection (null);

            TRACKER.event ({
                category: 'StatusBar', action: 'lingua-change',
                label: oldValue, value: 1
            });
        }
    },

    lingua_select: function (self, records) {
        var controller = this;
        var statusBar = this.getStatusBar ();

        var record = assert (records.pop ());
        var lingua = assert (record.get ('lingua'));
        var charset = assert (record.get ('charset'));
        var name = assert (record.get ('name'));
        var direction = assert (record.get ('direction'));

        var worker = new Worker ('/StatusBar.worker.js');
        worker.onmessage = function (event) {
            clearTimeout (timeoutId);

            if (event.data && event.data.typo) {
                var typo_engine = Typo.prototype.load (event.data.typo);
                Webed.form.field.CodeArea.setTypoEngine (typo_engine);
                Webed.form.field.CodeArea.setDirection (direction);

                TRACKER.event ({
                    category: 'StatusBar', action: 'lingua-select',
                    label: lingua, value: 1
                });
            } else {
                self.reset ();

                statusBar.setStatus ({
                    text: 'Language: Enabling «{0}» failed!'.format (name),
                    iconCls: 'x-status-exclamation',
                    clear: true
                });

                TRACKER.event ({
                    category: 'StatusBar', action: 'lingua-select',
                    label: lingua, value: 0
                });
            }

            controller.progress_stop (controller, {
                label: 'StatusBar.lingua-select'
            });

            self.enable ();
        };

        var timeoutId = setTimeout (function () {
            worker.onmessage ({data: {typo: null}});
            worker.terminate ();
        }, 180 * 1000);

        self.disable ();

        worker.postMessage ({
            lingua: lingua, charset: charset
        });

        this.progress_play (this, {
            message: 'Loading', label: 'StatusBar.lingua-select'
        });
    },

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    info_click: function (self) {

        var tab_manager = assert (this.getTabManager ());
        var tab = tab_manager.getActiveTab ();
        if (tab) {
            var ca = tab.down ('code-area');
            if (ca) {
                var value = ca.getValue ();
                if (value) {
                    self.disable ();
                    var lines = value.split (/\n/).length;
                    var words = value.split (/\s+[^\s+$]/).length;
                    var chars = value.length;

                    self.setText (String.format ('{0}:{1}:{2}',
                        lines, words, chars
                    ));

                    self.enable ();
                } else {
                    self.setText ('1:0:0');
                }

                TRACKER.event ({
                    category: 'StatusBar', action: 'info-click',
                    label: ca.getMime (), value: 1
                });
            }
        }
    },

    cursor: function (self, cursor) {
        var button = assert (this.getInfoButton ());
        if (cursor) {
            var text = '{0}:{1}'.format (cursor.line+1, cursor.ch+1);
            if (button.getWidth () > button.minWidth) {
                button.setText (text);
            } else {
                button.suspendLayouts ();
                button.setText (text);
                button.resumeLayouts ();
            }
        }
    },

    zoom_click: function () {
        assert (this.getZoomSlider ()).setValue (100);
        TRACKER.event ({
            category: 'StatusBar', action: 'zoom-click', value: 1
        });
    },

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    slider_afterrender: function (self) {
        var value = Ext.util.Cookies.get ('editor.font-size');
        if (value) {
            self.setValue (value, false);

            TRACKER.event ({
                category: 'StatusBar', action: 'slider-afterrender',
                label: 'font-size', value: value
            });
        } else {
            TRACKER.event ({
                category: 'StatusBar', action: 'slider-afterrender',
                label: 'font-size', value: 100
            });
        }
    },

    slider_change: function (self, value) {
        Webed.form.field.CodeArea.setFontSize (value);
        assert (this.getZoomButton ()).setText (value + '%');
        Ext.util.Cookies.set ('editor.font-size', value);

        TRACKER.event ({
            category: 'StatusBar', action: 'slider-change',
            label: 'font-size', value: value
        });
    },

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    progress_update: function (self) {
        self.total += self.interval;
        var total = Ext.util.Format.number (self.total / 1000.0, '0.000');
        var text = Ext.String.format ('{0} .. {1} [s]', self.message, total);
        self.updateText (text);
    },

    progress_play: function (source, args) {
        var progressBar = assert (this.getProgressBar ());
        if (progressBar.hidden) progressBar.show ();
        if (args && args.message) progressBar.setMessage (args.message);

        if (args && args.label) TRACKER.event ({
            category: 'StatusBar', action: 'progress-play',
            label: args.label, value: 1
        });

        progressBar.setTotal (0);
        progressBar.wait (Ext.apply ({
            interval: progressBar.interval,
            increment: progressBar.increment
        }, args));
    },

    progress_stop: function (source, args) {
        var progressBar = assert (this.getProgressBar ());

        if (args && args.label) TRACKER.event ({
            category: 'StatusBar', action: 'progress-stop',
            label: args.label, value: progressBar.getTotal ()
        });

        progressBar.reset (true);
        progressBar.setTotal (0);
    },

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    getTabManager: function () {
        return assert (this.getViewport ().down ('tab-manager[focused=true]'));
    }

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
});
