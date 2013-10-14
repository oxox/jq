(function($){

    $.fn.oxmenu = function (opts) {
        // Set the options.
        var optsType = typeof (opts),
            opts1 = optsType !== 'string' ? $.extend(true, {}, $.fn.oxmenu.defaults, opts || {}) : $.fn.oxmenu.defaults,
            args = arguments;
			
		$(document).bind('mouseover.oxmenu',function(e){
			var $target = $(e.target);
			if( (!$target.is(opts1.cssMenuWrapper)) && ($target.parents(opts1.cssMenuWrapper).length==0) ){
				menuBase.hideAllMenus();
			}
		});

        return this.each(function () {

            var $me = $(this),
                instance = $me.data("oxmenu");
            if(!instance){
                $me.data("oxmenu", new modelA($me,opts1));
                return;
            };
            if (instance[opts]) {

                instance[opts].apply(instance, Array.prototype.slice.call(args, 1));

            } else if (typeof (opts) === 'object' || !opts) {

                instance._update.apply(instance, args);

            } else {
                console.log('Method ' + opts + ' does not exist in jQuery.fn.oxmenu');
            }
        });
    };
    $.fn.oxmenu.defaults = {
        showSpeed:200,
        showDelay:300,
        hideDelay:400,
        subMenuIdPrefix:'xdataListMore',
        clHoverIn:'data_list_item_hover',
        clSubMenuOn:'data_list_more_on',
        cssSubMenu:'.data_list_more',
        cssMenuItem:'.data_list_item',
		cssMenuItemHasChildren:'.data_list_item2',
		cssMenuWrapper:'.xdata_wrap',
		triggerEvent:'mouseenter',
        menuHeight:39,
		onShowing:function(id,onShowCbk){}
    };

    var $win = $(window),
        winDim = {
            height:$win.height()
        };
    $win.bind('resize.oxmenu',function(e){
        winDim.height = $win.height();
    });

	var menuBase = {
		rootCache:[],
		hideAllTimer : null,
		curRootMenu:null,
		hideAllMenus : function(force){
			menuBase.stopHideAllMenus();
			menuBase.hideAllTimer = setTimeout(function(){
				var len = menuBase.rootCache.length;
				for (var i = len - 1; i >= 0; i--) {
					menuBase.rootCache[i].hideSubMenus();
				};
			},force||$.fn.oxmenu.defaults.hideDelay);
		},
		stopHideAllMenus : function(){
			clearTimeout(menuBase.hideAllTimer);
		},
		assertSingleton:function(curRoot){
			if(menuBase.curRootMenu){
				menuBase.curRootMenu.resetAll();
			}
			menuBase.curRootMenu = curRoot;
		},
		show:function($sub){
            if(!$sub){
                return;
            }
            var me = this,
                $me = this.$trigger;
            $sub.stop(true,true).show(me.opts.showSpeed);
            $sub.addClass(me.opts.clSubMenuOn);
            $sub.data('oxmenutrigger',me);
            $me.data('oxmenusublist',$sub);
            me.isShowed = true;
            $sub.bind('mouseleave.oxmenu',function(e){
                //menuBase.hideAllMenus();
            }).bind('mouseover.oxmenu',function(e){
            //这里要用mouseover，用mouseleave的话，从子级菜单滑动鼠标到父级菜单时不会触发
                menuBase.stopHideAllMenus();
            });

        },
        hide:function($sub){
            if(!$sub){
                return;
            }
            var me = this,
                $me = this.$trigger;
            //如果data-oxmenukeephoverstate为1则不移除hover态
            if(!$me[0].getAttribute('data-oxmenukeephoverstate')){
                $me.removeClass(me.opts.clHoverIn);
            };
            $sub.stop(true,true).hide(me.opts.showSpeed);
            $sub.removeClass(me.opts.clSubMenuOn);
            $sub.unbind('.oxmenu');
            me.isShowed = false;
			//console.log('hide',$sub);
        },
		onHoverOut:function(){
			//console.log('onHoverOut',this.$trigger);
            //clearTimeout(this.hideTimer);
            this.resetTimer();
            var me = this,
                $me = this.$trigger,
                $sub = $me.data('oxmenusublist');
            if( (!$sub) || (!me.isShowed) ){
                //如果data-oxmenukeephoverstate为1则不移除hover态
                if(!$me[0].getAttribute('data-oxmenukeephoverstate')){
                    $me.removeClass(me.opts.clHoverIn);
                };
                return;
            }
            this.hideTimer = setTimeout(function(){
                me.hide($sub);
            },this.opts.hideDelay);
        },
        resetTimer:function(){
            clearTimeout(this.hideTimer);
            clearTimeout(this.showTimer);
        }
	};
	
	var modelA = function($item,opts){
		this.$trigger = $item;
		this.id = $item[0].getAttribute('data-oxmenuid')||($item[0].id||new Date().getTime());
		this.opts = opts;
		this.$wrap = $(opts.cssMenuWrapper);
        this.showTimer = null;
        this.hideTimer = null;
        this.isShowed = false;
		this.isDomReady = false;
        this.type=0;//根节点
		this.subMenuWithChildren=[];
        this._init();
	};
	
	modelA.prototype = {
        _init:function(){
            var me = this;
            this.$trigger.bind(this.opts.triggerEvent+'.oxmenu',function(e){
                me.onHoverIn();
                return false;
            }).bind('mouseleave.oxmenu',function(e){
                me.onHoverOut();
                return false;
            });
			$win.bind('resize.oxmenu-modelA oxmenuPositionNeedUpdating',function(e,d){
				me.updatePosition(d);
			});
        },
		_initSubMenus:function($sub){
			var me = this;
			this.$sub = $sub;
			this.isDomReady=true;
			menuBase.rootCache.push(this);
			this.updatePosition();
			this.$subMenuWithChildren = $sub.find(me.opts.cssMenuItemHasChildren);
			var len = this.$subMenuWithChildren.length;
			for(var i = 0 ;i<len;i++){
				this.subMenuWithChildren.push(new modelB(this.$subMenuWithChildren.eq(i),this));
			};
		},
		hideSubMenus:function(){
			var len = this.subMenuWithChildren.length;
			for(var i = 0 ;i<len;i++){
				this.subMenuWithChildren[i].onHoverOut();
			};
			this.onHoverOut();
		},
		updatePosition:function(sTop){
			if(!this.isDomReady){
				return;
			}
			sTop = sTop||0;
			var offs = this.$trigger.offset();
			this.$sub.css({
				bottom:(winDim.height+J.$win.scrollTop()-offs.top-this.opts.menuHeight+sTop) //$me.outerHeight()，配置提升性能。如样式变更需做相应修改
			});
		},
		onShowing:function($d,delay){
			var me = this;
			if(delay===null){
				me.show($d);
				return;
			}
			me.showTimer = setTimeout(function(){
				me.show($d);
			},me.opts.showDelay);
		},
		onHoverIn:function(){
            clearTimeout(this.showTimer);
			
			menuBase.assertSingleton(this);
			
			this.$trigger.addClass(this.opts.clHoverIn);
			if(this.isDomReady){
				this.onShowing(this.$sub);
				return;
			};
            var me = this;
                $me = this.$trigger,
                $sub = $('#'+this.opts.subMenuIdPrefix+me.id),
                offs = $me.offset();
				
            if ($sub.length>0) {
				me._initSubMenus($sub);
                me.onShowing($sub);
                return;
            };
			me.opts.onShowing.call(me,me.id,function(html){
				me.$wrap.append(html);
				$sub = $('#'+me.opts.subMenuIdPrefix+me.id);
				if($sub.length===0){
					return;
				}
				me._initSubMenus($sub);
				me.onShowing($sub);
			});
        },
		resetAll:function(){
			this.resetTimer();
			this.hideSubMenus();
            //如果data-oxmenukeephoverstate为1则不移除hover态
            if(!this.$trigger[0].getAttribute('data-oxmenukeephoverstate')){
                this.$trigger.removeClass(this.opts.clHoverIn);
            };
		}
    };
	
	$.extend(modelA.prototype,menuBase);
	
    var modelB = function($item,parent){
        this.$trigger=$item;
        this.opts = parent.opts;
        this.showTimer = null;
        this.hideTimer = null;
        this.isShowed = false;
        this.type=1;//非跟节点
        this._init();
    };
    modelB.prototype = {
        _init:function(){
            var me = this;
            this.$trigger.bind(this.opts.triggerEvent+'.oxmenu',function(e){
				me.onHoverIn();
                return false;
            }).bind('mouseleave.oxmenu',function(e){
                me.onHoverOut();
                return false;
            });
        },
        onHoverIn:function(){
            clearTimeout(this.showTimer);
			this.$trigger.addClass(this.opts.clHoverIn);
            var me = this,
				$me = this.$trigger,
                $sub = $me.find(me.opts.cssSubMenu);
            
            if ($sub.length===0) {
                return;
            };
            $sub = $sub.eq(0);
            //重置父级菜单的计时器
            var parentMenu = $me.parents(me.opts.cssSubMenu).eq(0).data('oxmenutrigger');
            if(parentMenu){
                parentMenu.resetTimer();
            }
            this.showTimer = setTimeout(function(){
                me.show($sub);
            },this.opts.showDelay);
        }
    };
	
	$.extend(modelB.prototype,menuBase);

})(jQuery);