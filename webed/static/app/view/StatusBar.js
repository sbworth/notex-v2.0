Ext.Loader.setPath ({
    'Ext.ux': '../static/lib/extjs/examples/ux'
});

Ext.define ('Webed.view.StatusBar', {
    extend: 'Ext.ux.statusbar.StatusBar',
    alias: 'widget.webed-statusbar',
    defaultText: 'WebEd',
    items: [{
        xtype: 'webed-statusbar-progressbar'
    },'-',{
        xtype: 'webed-statusbar-infobutton'
    },'-',{
        xtype: 'webed-statusbar-lingua'
    },'-',{
        xtype: 'webed-statusbar-sizebutton'
    },{
        xtype: 'webed-statusbar-slider'
    }]
});

Ext.define ('Webed.view.statusBar.ProgressBar', {
    extend: 'Ext.ProgressBar',
    alias: 'widget.webed-statusbar-progressbar',

    width: 256,
    value: 0.0,
    hidden: true,

    interval: 125, //[ms]
    increment: 80, // #segments

    total: 0, //[ms]
    setTotal: function (value) { this.total = value; },
    message: 'Processing',
    setMessage: function (value) { this.message = value; }
});

Ext.define ('Webed.view.statusBar.InfoButton', {
    extend: 'Ext.Button',
    alias: 'widget.webed-statusbar-infobutton',
    tooltip:
        '<b>Line</b>:<b>Char</b> or <b>Lines</b>:<b>Words</b>:<b>Chars</b>',
    text: '',
    minWidth: 64
});

Ext.define ('Webed.view.StatusBar.SpellCheck', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.webed-statusbar-lingua',

    store: {
        fields: [
            'lingua', 'name', 'charset', 'charset_aff', 'charset_dic'
        ],
        data: [{
            lingua: 'ar_ANY',
            charset: 'utf-8',
            name: 'Al-ʻarabīyah',
            country: 'INTL'
        },{
            lingua: 'de_AT',
            charset: 'iso-8859-1',
            name: 'Deutsch',
            country: 'Österreich'
        },{
            lingua: 'de_BE',
            charset: 'iso-8859-1',
            name: 'Deutsch',
            country: 'Belgien'
        },{
            lingua: 'de_CH',
            charset: 'iso-8859-1',
            name: 'Deutsch',
            country: 'Schweiz'
        },{
            lingua: 'de_DE',
            charset: 'iso-8859-1',
            name: 'Deutsch',
            country: 'Deutschland'
        },{
            lingua: 'de_LI',
            charset: 'iso-8859-1',
            name: 'Deutsch',
            country: 'Lichtenstein'
        },{
            lingua: 'de_LU',
            charset: 'iso-8859-1',
            name: 'Deutsch',
            country: 'Luxemburg'
        },{
            lingua: 'en_AG',
            charset: 'iso-8859-1',
            name: 'English',
            country: 'Antigua And Barbuda'
        },{
            lingua: 'en_AU',
            charset: 'iso-8859-1',
            name: 'English',
            country: 'Australia'
        },{
            lingua: 'en_BS',
            charset: 'iso-8859-1',
            name: 'English',
            country: 'Bahamas'
        },{
            lingua: 'en_BW',
            charset: 'iso-8859-1',
            name: 'English',
            country: 'Botswana'
        },{
            lingua: 'en_BZ',
            charset: 'iso-8859-1',
            name: 'English',
            country: 'Belize'
        },{
            lingua: 'en_CA',
            charset: 'us-ascii',
            name: 'English',
            country: 'Canada'
        },{
            lingua: 'en_DK',
            charset: 'iso-8859-1',
            name: 'English',
            country: 'Denmark'
        },{
            lingua: 'en_GB',
            charset: 'iso-8859-1',
            name: 'English',
            country: 'United Kingdom'
        },{
            lingua: 'en_GH',
            charset: 'iso-8859-1',
            name: 'English',
            country: 'Ghana'
        },{
            lingua: 'en_HK',
            charset: 'iso-8859-1',
            name: 'English',
            country: 'Hong Kong'
        },{
            lingua: 'en_IE',
            charset: 'iso-8859-1',
            name: 'English',
            country: 'Ireland'
        },{
            lingua: 'en_IN',
            charset: 'iso-8859-1',
            name: 'English',
            country: 'India'
        },{
            lingua: 'en_JM',
            charset: 'iso-8859-1',
            name: 'English',
            country: 'Jamaica'
        },{
            lingua: 'en_NA',
            charset: 'iso-8859-1',
            name: 'English',
            country: 'Namibia'
        },{
            lingua: 'en_NG',
            charset: 'iso-8859-1',
            name: 'English',
            country: 'Nigeria'
        },{
            lingua: 'en_NZ',
            charset: 'iso-8859-1',
            name: 'English',
            country: 'New Zealand'
        },{
            lingua: 'en_PH',
            charset: 'us-ascii',
            name: 'English',
            country: 'Philippines'
        },{
            lingua: 'en_SG',
            charset: 'iso-8859-1',
            name: 'English',
            country: 'Singapore'
        },{
            lingua: 'en_TT',
            charset: 'iso-8859-1',
            name: 'English',
            country: 'Trinidad And Tobago'
        },{
            lingua: 'en_US',
            charset: 'us-ascii',
            name: 'English',
            country: 'United States'
        },{
            lingua: 'en_ZA',
            charset: 'iso-8859-1',
            name: 'English',
            country: 'South Africa'
        },{
            lingua: 'en_ZW',
            charset: 'iso-8859-1',
            name: 'English',
            country: 'Zimbabwe'
        },{
            lingua: 'es_ANY',
            charset: 'iso-8859-1',
            name: 'Español',
            country: 'INTL'
        },{
            lingua: 'es_AR',
            charset: 'iso-8859-1',
            name: 'Español',
            country: 'Argentina'
        },{
            lingua: 'es_BO',
            charset: 'iso-8859-1',
            name: 'Español',
            country: 'Bolivia'
        },{
            lingua: 'es_CL',
            charset: 'iso-8859-1',
            name: 'Español',
            country: 'Chile'
        },{
            lingua: 'es_CO',
            charset: 'iso-8859-1',
            name: 'Español',
            country: 'Colombia'
        },{
            lingua: 'es_CR',
            charset: 'iso-8859-1',
            name: 'Español',
            country: 'Costa Rica'
        },{
            lingua: 'es_CU',
            charset: 'iso-8859-1',
            name: 'Español',
            country: 'Cuba'
        },{
            lingua: 'es_DO',
            charset: 'iso-8859-1',
            name: 'Español',
            country: 'La República Dominicana'
        },{
            lingua: 'es_EC',
            charset: 'iso-8859-1',
            name: 'Español',
            country: 'Ecuador'
        },{
            lingua: 'es_ES',
            charset: 'iso-8859-1',
            name: 'Español',
            country: 'España'
        },{
            lingua: 'es_GT',
            charset: 'iso-8859-1',
            name: 'Español',
            country: 'Guatemala'
        },{
            lingua: 'es_HN',
            charset: 'iso-8859-1',
            name: 'Español',
            country: 'Honduras'
        },{
            lingua: 'es_MX',
            charset: 'iso-8859-1',
            name: 'Español',
            country: 'México'
        },{
            lingua: 'es_NI',
            charset: 'iso-8859-1',
            name: 'Español',
            country: 'Nicaragua'
        },{
            lingua: 'es_PA',
            charset: 'iso-8859-1',
            name: 'Español',
            country: 'Panamá'
        },{
            lingua: 'es_PE',
            charset: 'iso-8859-1',
            name: 'Español',
            country: 'Perú'
        },{
            lingua: 'es_PR',
            charset: 'iso-8859-1',
            name: 'Español',
            country: 'Puerto Rico'
        },{
            lingua: 'es_PY',
            charset: 'iso-8859-1',
            name: 'Español',
            country: 'Paraguay'
        },{
            lingua: 'es_SV',
            charset: 'iso-8859-1',
            name: 'Español',
            country: 'El Salvador'
        },{
            lingua: 'es_UY',
            charset: 'iso-8859-1',
            name: 'Español',
            country: 'Uruguay'
        },{
            lingua: 'es_VE',
            charset: 'iso-8859-1',
            name: 'Español',
            country: 'Venezuela'
        },{
            lingua: 'fr_BE',
            charset: 'utf-8',
            name: 'Français',
            country: 'Belgique'
        },{
            lingua: 'fr_CA',
            charset: 'utf-8',
            name: 'Français',
            country: 'Canada'
        },{
            lingua: 'fr_CH',
            charset: 'utf-8',
            name: 'Français',
            country: 'La Suisse'
        },{
            lingua: 'fr_FR',
            charset: 'utf-8',
            name: 'Français',
            country: 'France'
        },{
            lingua: 'fr_LU',
            charset: 'utf-8',
            name: 'Français',
            country: 'Luxembourg'
        },{
            lingua: 'he_IL',
            charset: 'utf-8',
            name: 'ʿIvrit',
            country: 'ישראל'
        },{
            lingua: 'hu_HU',
            charset: 'utf-8', charaff: 'unknown-8bit',
            name: 'Magyar',
            country: 'Magyarország'
        },{
            lingua: 'it_CH',
            charset: 'iso-8859-1',
            name: 'Italiana',
            country: 'Svizzera'
        },{
            lingua: 'it_IT',
            charset: 'iso-8859-1',
            name: 'Italiana',
            country: 'Italia'
        },{
            lingua: 'la_ANY',
            charset: 'us-ascii',
            charaff: 'iso-8859-1',
            name: 'Latīna',
            country: 'INTL'
        },{
            lingua: 'nl_AW',
            charset: 'utf-8',
            name: 'Nederlands',
            country: 'Aruba'
        },{
            lingua: 'nl_BE',
            charset: 'utf-8',
            name: 'Nederlands',
            country: 'België'
        },{
            lingua: 'nl_NL',
            charset: 'utf-8',
            name: 'Nederlands',
            country: 'Nederland'
        },{
            lingua: 'pl_PL',
            charset: 'iso-8859-1',
            name: 'Polszczyzna',
            country: 'Polska'
        },{
            lingua: 'ro_RO',
            charset: 'utf-8',
            name: 'Română',
            country: 'România'
        },{
            lingua: 'ru_RU',
            charset: 'utf-8',
            name: 'Русский',
            country: 'Россия'
        },{
            lingua: 'tr_TR',
            charset: 'utf-8',
            name: 'Türkçe',
            country: 'Türkiye'
        }]
    },

    queryMode: 'local',
    displayField: 'name',
    valueField: 'lingua',

    listeners: {
        beforerender: function (self) {
            self.tpl = Ext.create ('Ext.XTemplate', [
                '<tpl for=".">',
                '<div class="x-boundlist-item">{name}',
                '<div class="w-boundlist-item-rhs">{country}</div>',
                '</div>',
                '</tpl>'
            ]);
        }
    },

    emptyText: 'Language ..',
    width: 256
});

Ext.define ('Webed.view.statusBar.SizeButton', {
    extend: 'Ext.Button',
    alias: 'widget.webed-statusbar-sizebutton',
    tooltip: 'Font Size',
    text: '100%',
    width: 48
});

Ext.define ('Webed.view.statusBar.Slider', {
    extend: 'Ext.slider.Single',
    alias: 'widget.webed-statusbar-slider',

    tipText: function (thumb) {
        return 'Font Size: {0}%'.format (thumb.value);
    },

    width: 128,
    increment: 25,
    value: 100,
    minValue: 25,
    maxValue: 175
});
