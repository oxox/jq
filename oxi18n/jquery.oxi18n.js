/**
 * A jquery plugin implementing client side internationalization
 * @author Levin
 * @created 10/16/2013 10:15 AM
 * @version 1.0.0
 */
(function($){
    /**
     * Internal core class
     * @class oxi18n
     * @param {Object} $d jquery dom object for the pager
     * @param {Object} opts0 configuration options
     */
    var model = function ($d,opts0) {
        /**
         * pager's jquery dom object
         * @property $container
         * @type Object
         */
        this.$container = $d;
        /**
         * pager's configuration object
         * @property opts
         * @type Object
         * @default jQuery.fn.oxi18n.defaults
         */
        this.opts = opts0;
        this.templateData = [];
        this._init();
    };
    model.prototype = {
        _init: function () {
            this.process(this.$container);
        },
        process:function($item){
            var opts = this.opts;
            i18n.process($item[0],opts);
            this.$container.find('[$]'.replace(this.opts.attrFlag)).each(function(i,o){
                i18n.process(o,opts);
            });
        },
        //update the options
        _update: function (opts,reInit) {
            this.opts = opts;
            if (reInit) {
                this.stop()._init();
            }
        }
    };

    var utils = {
        curLng:'zh-CN',
        curLngData:null,
        /**
         * simple template utility method
         * @param str template string
         * @param data template data
         * @returns {String}
         */
        evalTpl : function (str, data) {
            var result;
            var patt = new RegExp("%([a-zA-z0-9]+)%");
            while ((result = patt.exec(str)) != null) {
                var v = data[result[1]] || '';
                str = str.replace(new RegExp(result[0], "g"), v);
            };
            return str;
        },
        locales = {
            "zh-CN":{}
        },
        setLng:function(lng,lngData){
            this.curLng = lng;
            if(typeof(lngData)=='object'){
                this.curLngData = this.locales[lng] = $.extend(this.locales[lng]||{},lngData);
                return;
            };
            if(!this.locales[lng]){
                this.curLng = this.defaults.lng;
            }
            this.curLngData = this.locales[this.curLng];
        },
        /**
         * static translation method
         * @param k key
         * @param defaultVal default value or template data
         * @param data template data
         * @returns {String}
         */
        t : function(k,defaultVal,data){
            defaultVal = defaultVal||'';
            if(typeof(defaultVal)=='object'){
                data = defaultVal;
                defaultVal = '';
            };
            var keys = k.split('.'),
                len = keys.length,
                field = this.curLngData[keys[0]],
                _t = function(f){
                    f = (f||defaultVal).toString();
                    if(!data){
                        return f;
                    };
                    return this.evalTpl(f,data);
                };
            if(len==1){
                return _t(field);
            };
            for(var i =1;i<len;i++){
                field = field[keys[i]];
                if(!field){
                    break;
                };
            };
            return _t(field);
        },//t
        process:function(node,opts){
            if(node.nodeType!==1){
                //not a element node ref:http://www.w3schools.com/jsref/prop_node_nodetype.asp
                return;
            };
            opts = opts || this.defaults;
            var attr = node.getAttribute(opts.attrFlag);
            if(!attr){
                return;
            };
            var isAttrReplacement = (attr.indexOf('=')!==-1);
            if(!isAttrReplacement){
                try{
                    node.innerHTML = this.t(attr,node.innerHTML);
                }catch(e){
                    node.text = this.t(attr,node.text);
                };
                return;
            };
            //attribute replacement
            var attrs = attr.split(';'),
                len = attrs.length;
            for(var i=0;i<len;i++){
                attr = attrs[i].split('=');
                if(attr.length!==2){
                    continue;
                };
                node.setAttribute( attr[0], this.t( attr[1], node.getAttribute(attr[0])||'' ) );
            };

        }
    };

    /**
     * A jquery plugin implementing modern-ui loading effect
     * @module jQuery.fn.oxi18n
     * @author oxox.io
     * @version 1.0
     * @param {Object} opts Several options (see README for documentation)
     * @return {Object} jQuery Object
     */
    $.fn.oxi18n = function (opts) {


        // Set the options.
        var optsType = typeof (opts),
            opts1 = optsType !== 'string' ? $.extend(true, {}, $.fn.oxi18n.defaults, opts || {}) : $.fn.oxi18n.defaults,
            args = arguments;

        return this.each(function () {

            var $me = $(this),
                instance = $me.data("oxi18n");
            if (instance) {

                if (instance[opts]) {

                    instance[opts].apply(instance, Array.prototype.slice.call(args, 1));

                } else if (optsType === 'object' || !opts) {

                    instance._update.apply(instance, args);

                } else {
                    console.log('Method ' + opts + ' does not exist in jQuery.fn.oxi18n');
                }

            } else {
                $me.data("oxi18n", new model($me,opts1));
            }

        });
    };
    /**
     * default configuration
     * @property defaults
     * @type Object
     */
    $.fn.oxi18n.defaults = {
        lng:'zh-CN',
        attrFlag:'data-i18n'
    };

    $.extend($.fn.oxi18n,utils);

    window["i18n"] = $.fn.oxi18n; 

    i18n.setLng(i18n.defaults.lng);

})(jQuery);