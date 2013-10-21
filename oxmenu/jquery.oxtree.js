/**
 * 一个树形菜单jQuery插件
 * @author levin
 * @version 1.0.1
 * @class jQuery.oxtree
 * @static
 */
(function($){

    $.fn.oxtree = function (opts) {
        // Set the options.
        var optsType = typeof (opts),
            opts1 = optsType !== 'string' ? $.extend(true, {}, $.fn.oxtree.defaults, opts || {}) : $.fn.oxtree.defaults,
            args = arguments;

        return this.each(function () {

            var $me = $(this),
                instance = $me.data("oxtree");
            if(!instance){
                $me.data("oxtree", new modelA($me,opts1));
                return;
            };
            if (instance[opts]) {

                instance[opts].apply(instance, Array.prototype.slice.call(args, 1));

            } else if (typeof (opts) === 'object' || !opts) {

                instance._update.apply(instance, args);

            } else {
                console.log('Method ' + opts + ' does not exist in jQuery.fn.oxtree');
            }
        });
    };
    $.fn.oxtree.defaults = {
        subMenuIdPrefix:'xdataList',
        clHoverIn:'data_list_item_hover',
        clSubMenuOn:'data_list_item_on',
        cssMenuItem:'.data_list_item',
        clMenuItemHasChildren:'data_list_child',
        triggerEvent:'click',
        cssTrigger:'>.data_list_ico',
        lastActiveNodeIds:[],
        autoOpenLastActiveNodes:true,
        allowMultipleOpening:false,
        onShowing:function(id,onShowCbk){}
    };
    
    var $win = $(window);

    var modelA = function($d,opts){
        this.$d = $d;
        this.opts = opts;
        this._init();
    };
    
    modelA.prototype = {
        _init:function(){
            var me = this;
            this.$children = this.$d.find('.'+this.opts.clMenuItemHasChildren);
            this.$children.each(function(i,o){
                o = $(o);
                o.find(me.opts.cssTrigger).data('oxtreeitem',o);
            });
            this.$children.find(me.opts.cssTrigger).unbind('.oxtree')
                .bind(this.opts.triggerEvent+'.oxtree',function(e){
                    me.toggle($(this).data('oxtreeitem'));
                });

            $win.unbind('.oxtree').bind('domUpdated.oxtree',function(e){
                me._init();
            });

            this.openLastActiveNodes();
        },
        toggle:function($obj){
            if( (!this.opts.allowMultipleOpening) && !($obj.hasClass(this.opts.clSubMenuOn)) ){
                this.open($obj,true);
                return;
            };
            $obj.toggleClass(this.opts.clSubMenuOn);
            if($obj[0].id && $obj.hasClass(this.opts.clSubMenuOn)){
                this.opts.lastActiveNodeIds.push($obj[0].id);
            };
        },
        openLastActiveNodes:function(){
            var ids = this.opts.lastActiveNodeIds,
                len = ids.length,
                needOpen = (len>0&&this.opts.autoOpenLastActiveNodes);
            if(!needOpen){
                return;
            };
            for(var i = 0 ;i<len;i++){
                $('#'+ids[i]+' '+this.opts.cssTrigger).trigger(this.opts.triggerEvent+'.oxtree');
            };
        },
        open:function($obj,only){
            if(only){
                this.hideAll();
                this.opts.lastActiveNodeIds = [];
            };
            $obj.addClass(this.opts.clSubMenuOn);
            var me = this,
                $items = $obj.parents('.'+this.opts.clMenuItemHasChildren).addClass(this.opts.clSubMenuOn);
            $items.each(function(i,o){
                o.id&&me.opts.lastActiveNodeIds.push(o.id);
            });
            $obj[0].id&&this.opts.lastActiveNodeIds.push($obj[0].id);
        },
        hideAll:function(){
            this.$children.removeClass(this.opts.clSubMenuOn);
        },
        _update:function(opts,_reinit){
            this.opts = $.extend(this.opts,opts||{});
            if(_reinit){
                this._init();
            };
        }
    };

})(jQuery);