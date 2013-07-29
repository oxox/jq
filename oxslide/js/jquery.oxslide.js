/*!
  a simple tab & slide plugin
  @name jquery.oxslide.js
  @author levinhuang (lv)
  @version 1.1
  @date 04/28/2013
  @copyright (c) 2012-2013 levinhuang (http://oxox.io,http://tencent.com,http://t.qq.com/badstyle)
  @license Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
*/
;(function($) {

	var $win = $(window);
	var model = function($d,opts) {
		this.$d = $d;
		this.opts = opts;
		this.timer = null;
		this.curIdx = 0;
		this.prevIdx = -1;
		this.$curPanel = null;
		this.$prevPanel =null;
		this.init();
	};

	model.prototype = {
		//event binding entry
		_initEvts:function(){
			var me = this;
			this.$navs.bind(this.opts.methodName,function(e){
				var $me = $(this);
				if ($me.hasClass(me.opts.clTabOn)) {
					return false;
				};
				me.showPanel(me.$navs.index(this));
				return false;
			}).hover(function(e){
				if (me.opts.autoPlay) {
					me.stopAutoPlay();
				};
			},function(e){
				if (me.opts.autoPlay) {
					me.autoPlay();
				};
			}).click(function(e){
				return false;
			});

			if (this.opts.hoverStopOnPanel&&this.opts.autoPlay) {
				this.$panels.hover(function(e){
					me.stopAutoPlay();
				},function(e){
					me.autoPlay();
				});
			};

		},
		updateMenuStatus:function(idx){
			this.$navs.removeClass(this.opts.clTabOn).eq(idx).addClass(this.opts.clTabOn);
		},
		showPanel:function(idx){
			idx = idx<0?1:idx;
			idx = idx>(this.total-1)?0:idx;
			
			this.prevIdx = this.curIdx;
			this.curIdx = idx;
			this.updateMenuStatus(idx);

			// sole panel and custom switch logic
			if (this.opts.isPanelSole&&this.opts.onSwitch) {
				this.opts.onSwitch.call(this);
				return;
			};
			
			if(this.$curPanel){
				this.$curPanel.removeClass(this.opts.clTabOn);
			}
			this.$prevPanel = this.$curPanel;
			this.$curPanel = this.$panels.eq(idx).addClass(this.opts.clTabOn);
			
			//custom switch logic by users
			if(this.opts.onSwitch){
				this.opts.onSwitch.call(this);
			}
		},
		init:function () {
			//get tab menus
			this.$navs = this.$d.find(this.opts.cssTabNav);
			this.total = this.$navs.length;
			//get tab panels
			if (this.opts.cssTabPanel!==null) {
				this.$panels = this.$d.find(this.opts.cssTabPanel);
			}else{
				var panelIds = [];
				this.$navs.each(function(i,o){
					var panelId = o.getAttribute('data-stab')||$(o).attr('href');
					if (!panelId || panelId.length==0) {
						alert('No tab panel found for tab menu '+i);
						return false;
					};
					panelIds.push(panelId);
				});
				this.$panels = $(panelIds.join(','));
			};

			this._initEvts();
			if (this.opts.autoPlay) {
				this.autoPlay();
			};
		},
		stopAutoPlay:function(){
			clearInterval(this.timer);
		},
		autoPlay:function(){
			this.stopAutoPlay();
			var me = this;
			this.timer = setInterval(function(){
				me.showPanel(me.curIdx+1);
			},this.opts.interval);
		},
		update:function(opts,reInit){
			this.opts = opts;
			if(reInit){
				this.init();
			}
		}//updateOpts
	};

	$.fn.oxslide = function(opts) {
		// Set the options.
		var optsType = typeof(opts),
			opts1 = optsType!=='string'?$.extend(true,{}, $.fn.oxslide.defaults, opts||{}):$.fn.oxslide.defaults,
			args = arguments;
		
		// Go through the matched elements and return the jQuery object.
		return this.each(function () {
			var $me = $(this),
				instance = $me.data("oxslide");
			if(instance) {

				if(instance[opts]){
					
					instance[opts].apply(instance,Array.prototype.slice.call(args, 1));

				}else if (typeof(opts) === 'object' || !opts){
					
					instance.update.apply(instance,args);

				}else{
					console&&console.log('Method '+opts+' does not exist in jQuery.oxslide');
				}

			}else {
				$me.data("oxslide",new model($me, opts1));
			}
		});
	};

	$.fn.oxslide.defaults = {
		methodName:'mouseenter',	// 鼠标事件名称
		autoPlay:false,				// 是否自动播放
		interval:3000,				// 自动循环播放的时间间隔
		hoverStopOnPanel:true,		// 鼠标移到内容面板上
		onSwitch:null,				// onSwitch callback - 在这里写自定义的切换效果
		clTabOn:'on',				// 给当前内容面板（和当前菜单）加的类名
		cssTabNav:'a',				// TAB/Slide 菜单选择器
		cssTabPanel:null,			// TAB/Slide 面板选择器。如果不指定，则使用cssTabNav的href属性或者data-stab属性
		isPanelSole:false			// 是否只有单个TAB/Slide面板，需与onSwitch一起用。如果为true，一般的场景为一个img标签，切换src属性。
	};

})(jQuery);