/**
 * 一个提示浮层的jQuery插件，能够动态计算提示或浮层的位置
 * @author levin
 * @version 1.0.0
 * @class jQuery.oxtip
 * @static
 */
(function($){

    var $doc = $(document),
        $win = $(window);

    var util = {
        winWidth:$win.width(),
        winHeight:$win.height(),
        init:function(){
            $win.bind('resize.oxtip',function(e){
                util.winWidth = $win.width();
                util.winHeight = $win.height();
            });
        }
    };

    util.init();

    /**
     * oxtip插件入口方法
     * @method jQuery.fn.oxtip
     * @param {Object} opts 配置对象，具体各个配置属性请参考jQuery.fn.oxtip.defaults
     * @example
            $('#test').oxtip({oxtiptrigger:'click.oxtip'});
     */
    $.fn.oxtip = function(opts) {

        /**
         * Internal core class for oxtip
         * @class model
         * @constructor
         * @param {Object} $d jquery dom object for the oxtip
         * @param {Object} opts0 configuration options
         */
        var model = function ($d,opts0) {
            /**
             * oxtip's trigger object
             * @property $trigger
             * @type Object
             */
            this.$trigger = $d;
            /**
             * oxtip's jquery data
             * @property data
             * type Object
             */
            this.data = $d.data();
            /**
             * oxtip's configuration object
             * @property opts
             * @type Object
             * @default jQuery.fn.oxtip.defaults
             */
            this.opts = $.extend({},opts0,this.data||{});
            /**
             * oxtip's jquery dom object
             * @property $tip
             * @type Object
             */
            this.$tip = $(this.data.oxtipid);
            /**
             * oxtip's arrow object
             * @property $arrow
             * @type Object
             */
            this.$arrow = this.$tip.find(this.opts.oxtiparrow);

            /**
             * trigger's offset
             * @property offset0
             * @type Object
             */
            this.offset0 = null;
            /**
             * tip's offset
             * @property offset
             * @type Object
             */
            this.offset=null;

            this.autoHideTimer=null;
            
            this._init();
        };
        model.prototype = {
            _init: function () {
                if(this.$tip.length===0){
                    return;
                }
                this._initItems();
                this._initEvt();
            },
            _initEvt:function(){
                var me = this;

                this.$trigger.bind(this.opts.oxtiptrigger,function(e){
                    me._onTrigger();
                    return false;
                });

                if (this.opts.oxtipautohide) {
                    this.$trigger.bind('mouseleave.oxtip',function(e){
                        me.hide();
                    });
                    this.$tip.bind('mouseleave.oxtip',function(e){
                        me.hide();
                    }).bind('mouseenter.oxtip',function(e){
                        clearTimeout(me.autoHideTimer);
                    });
                };

                $win.bind('resize.oxtip',function(e){
                    me._onResize();
                });

            },
            _onTrigger:function(){
            
                if(this.isTipVisible()&&this.opts.skipVisibleTip){
                    return;
                };
                this.show();
            },
            _onResize:function(){
                this.offset0=null;
                this.offset=null;
                if(this.isTipVisible()){
                    this.updateOffset();
                }
            },
            /**
             * 更新提示的位置数据
             * @method updateOffset
             */
            updateOffset:function(){
                this.getTipOffset();
                this.$tip.css(this.offset);
                this.$arrow.css(this.arrowOffset);
            },
            /**
             * 隐藏提示
             * @method hide
             */
            hide:function(){
                clearTimeout(this.autoHideTimer);
                var me = this;
                this.autoHideTimer = setTimeout(function(){
                    me.$tip.hide();
                },this.opts.oxtipautohidedelay);
            },
            /**
             * 显示提示
             * @method show
             */
            show:function(){
                clearTimeout(this.autoHideTimer);
                this.updateOffset();
                this.$tip.show();
            },
            /**
             * 提示是否可见
             * @method isTipVisible
             */
            isTipVisible:function(){
                return ( !this.$tip.is(":hidden") );
            },
            /**
             * 获取提示触发元素相对于body的偏移值
             * @method getTriggerOffset
             * @return {Object} 相对于body的偏移值
             */
            getTriggerOffset:function(){
                //位置已缓存
                if(this.offset0!==null){
                    return this.offset0;
                }
                //计算位置
                this.offset0 = this.$trigger.offset();
                return this.offset0;
            },
            /**
             * 获取提示相对于body的偏移值
             * @method getTipOffset
             * @return {Object} 相对于body的偏移值
             */
            getTipOffset:function(){
                //位置已缓存
                if(this.offset!==null){
                    return this.offset;
                }

                this.getTriggerOffset();
                this.offset = {
                    position:'absolute',
                    zIndex:this.opts.oxtipindex
                };
                this.arrowOffset = {};
                //计算left
                if(this.isBeyondRight()&&this.isBeyondLeft()){
                    //居中
                    this.offset.left = this.offset0.left - this.tipWidth/2+this.triggerWidth/2;
                    this.arrowOffset.left = this.tipWidth/2-this.arrowWidth/2;
                }else if(this.isBeyondRight()){
                    this.offset.left = this.offset0.left - this.tipWidth+this.triggerWidth;
                    this.arrowOffset.left = this.tipWidth-this.triggerWidth/2;
                }else{
                    this.offset.left = this.offset0.left;
                    this.arrowOffset.left = this.triggerWidth/2;
                }
                //计算top
                this.$arrow.removeClass(this.opts.oxtiparrow1+' '+this.opts.oxtiparrow2)
                    .addClass(this.opts.oxtiparrow1);
                this.offset.top = this.offset0.top + (this.opts.oxtipmargin||this.triggerHeight)+this.arrowHeight;
                if(this.isBeyondBottom()){
                    this.offset.top = this.offset0.top - this.tipHeight - this.arrowHeight;
                    //使用下箭头
                    this.$arrow.removeClass(this.opts.oxtiparrow1)
                    .addClass(this.opts.oxtiparrow2);
                }

                return this.offset;
            },
            /**
             * 提示是否超出了右窗口
             * @method isBeyondRight
             * @return {Boolean}
             */
            isBeyondRight:function(){
                if( (this.tipWidth+this.offset0.left) > util.winWidth ){
                    return true;
                }
                return false;
            },
            /**
             * 提示是否超出了左窗口
             * @method isBeyondLeft
             * @return {Boolean}
             */
            isBeyondLeft:function(){
                if( (this.offset0.left - this.tipWidth) <0 ){
                    return true;
                }
                return false;
            },
            /**
             * 提示是否超出了上窗口
             * @method isBeyondTop
             * @return {Boolean}
             */
            isBeyondTop:function(){
                if( (this.offset0.top - this.tipHeight) <0 ){
                    return true;
                }
                return false;
            },
            /**
             * 提示是否超出了下窗口
             * @method isBeyondBottom
             * @return {Boolean}
             */
            isBeyondBottom:function(){
                if( (this.offset0.top+this.tipHeight) > util.winHeight ){
                    return true;
                }
                return false;
            },
            _initItems:function(){
                this.arrowWidth = this.$arrow.width();
                this.arrowHeight = this.$arrow.height();
                this.triggerHeight = this.$trigger.height();
                this.triggerWidth = this.$trigger.width();
                this.tipHeight = this.$tip.height();
                this.tipWidth = this.$tip.width();
            },
            _dispose:function(){
                this.$trigger.unbind('.oxtip');
                $win.unbind('.oxtip');
                this.$tip.unbind('.oxtip');
                this.offset0=null;
                this.offset = null;
                return this;
            },
            //update the options
            _update: function (opts,reInit) {
                this.opts = opts;
                if (reInit) {
                    this._dispose()._init();
                }
            }
        };


        // Set the options.
        var optsType = typeof (opts),
            opts1 = optsType !== 'string' ? $.extend(true, {}, $.fn.oxtip.defaults, opts || {}) : $.fn.oxtip.defaults,
            args = arguments;

        return this.each(function () {

            var $me = $(this),
                instance = $me.data("oxtip");
            if (instance) {

                if (instance[opts]) {

                    instance[opts].apply(instance, Array.prototype.slice.call(args, 1));

                } else if (typeof (opts) === 'object' || !opts) {

                    instance._update.apply(instance, args);

                } else {
                    console.log('Method ' + opts + ' does not exist in jQuery.fn.oxtip');
                }

            } else {
                $me.data("oxtip", new model($me,opts1));
            }

        });
    };
    /**
     * jQuery.oxtip's default configuration
     * @class jQuery.fn.oxtip.defaults
     * @static
     */
    $.fn.oxtip.defaults={
        /**
         * 提示触发元素的css选择器
         * @property oxtiptrigger
         * @type {String}
         * @default 'mouseenter.oxtip'
         */
        oxtiptrigger:'mouseenter.oxtip',
        /**
         * 是否自动隐藏
         * @property oxtipautohide
         * @type {Boolean}
         * @default true
         */
        oxtipautohide:true,
        /**
         * 自动隐藏延时
         * @property oxtipautohidedelay
         * @type {Integer}
         * @default 300
         */
        oxtipautohidedelay:300,//auto-hiding delay in ms
        /**
         * 提示箭头的css选择器
         * @property oxtiparrow
         * @type {String}
         * @default '>i'
         */
        oxtiparrow:'>i',//箭头选择器
        /**
         * 上箭头的类名
         * @property oxtiparrow1
         * @type {String}
         * @default 'mod_hint_arrow1'
         */
        oxtiparrow1:'mod_hint_arrow1',
        /**
         * 下箭头的类名
         * @property oxtiparrow3
         * @type {String}
         * @default 'mod_hint_arrow3'
         */
        oxtiparrow2:'mod_hint_arrow3',
        /**
         * 提示的zindex
         * @property oxtipindex
         * @type {Integer}
         * @default 200
         */
        oxtipindex:200,
        /**
         * 对于可见的提示，是否不重新计算位置
         * @property skipVisibleTip
         * @type {Boolean}
         * @default false
         */
        skipVisibleTip:false,
        /**
         * 提示容器相对于触发元素的边距
         * @property oxtipmargin
         * @type {Integer}
         * @default null 取触发元素的高度
         */
        oxtipmargin:null
    };

    $(function(){
        $('[data-oxtipid]').oxtip();
    })

})(jQuery);