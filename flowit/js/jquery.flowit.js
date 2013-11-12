// place any jQuery/helper plugins in here, instead of separate, slower script files.
jQuery.extend(jQuery.easing,{easeInOutExpo:function(a,b,c,d,e){if(b==0){return c}if(b==e){return c+d}if((b/=e/2)<1){return d/2*Math.pow(2,10*(b-1))+c}return d/2*(-Math.pow(2,-10*--b)+2)+c}});

/*!
  jQuery plugin implementing elements flowing along with browser scrolling
  @name jquery.flowit.js
  @author levinhuang (lv)
  @version 2.0
  @date 01/21/2013
  @copyright (c) 2012-2013 levinhuang (http://tencent.com,http://t.qq.com/badstyle)
  @license Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
*/
;(function($) {

	var $win = $(window);
	var model = function($d,opts) {
		this.$d = $d;
		this.opts = opts;
		//滚动方向:1是向下，0是向上
		this.scrollDir = 1;
		this.scrollTop = 0;
		this.scrollDiff = 0;
		this.itemdata={};
		this.offsetTop = $d.offset().top;
		this.height = $d.height();
		this.init();
	};

	model.prototype = {
		//event binding entry
		_initEvts:function(){
			var me = this;
			$win.bind("scroll.flowit",function(e){

				me._onScroll();

			}).bind("resize.flowit",function(e){
				me._setPageWidth();
			});

			/*
			this.$body = $("body").bind("mousewheel.flowit",function(e,delta){

				me._onMouseWheel(delta);

			});
			*/

		},
		init:function () {

			var isIE6 = ($.browser.msie && parseInt($.browser.version)==6);

			if(this.opts.disableInIE6 && isIE6){
				return;
			}

			this._initEvts();

			this.useWindowWidth = (this.opts.flowPageWidth==null);
			this._setPageWidth();

			this.$vitems = this.$d.find(this.opts.cssItemVertical);
			this._initVPosition();

			this.$hitems = this.$d.find(this.opts.cssItemHorizontal);
			this._initHPosition();
			
		},
		_setPageWidth:function(){
			this.opts.flowPageWidth = this.useWindowWidth?$win.width():this.opts.flowPageWidth;
		},
		//初始化代理Top的值
		_initVPosition:function(){
			var tempTop = 0,
				step = 0,
				inverse=null,
				flowId = null,
				itemdata=null,
				minTop = null,
				maxTop = null,
				me = this;

			this.$vitems.each(function(i,o){
				
				o = $(o);
				tempTop = o.position().top;

				flowId = 'vflow'+i;
				itemdata={};
				itemdata.id=flowId;
				itemdata.inverse = inverse = (o[0].getAttribute("data-inverse")||"0")=="1";
				itemdata.step = step = parseFloat(o[0].getAttribute("data-step"))||1;
				itemdata.rawTop=tempTop;

				itemdata.height = o.height();

				minTop = -itemdata.height;
				maxTop = me.opts.flowPageHeight+itemdata.height;
				itemdata.minTop=minTop = parseFloat(o[0].getAttribute("data-mintop"))||minTop;
				itemdata.maxTop=maxTop = parseFloat(o[0].getAttribute("data-maxtop"))||maxTop;
				

				if(me.opts.autoOffsetItem){

					tempTop =inverse?
						(tempTop-step * me.opts.flowPageHeight * me.opts.flowPageIndex):
						(tempTop+step * me.opts.flowPageHeight * me.opts.flowPageIndex);

					o.css({
						"top":( inverse? minTop:maxTop),
						"bottom":"auto"
					});

					tempTop = inverse?(tempTop-me.opts.gapTop*step):(tempTop+me.opts.gapTop*step);

				}

				itemdata.proxyTop = tempTop;

				me.itemdata[flowId] = itemdata;

				o[0].setAttribute("data-flowid",flowId);

			});
		},
		//初始化代理Left的值
		_initHPosition:function(){
			var tempLeft = 0,
				step = 0,
				inverse=null,
				flowId = null,
				itemdata=null,
				minLeft = null,
				maxLeft = null,
				me = this;
			this.$hitems.each(function(i,o){

				o=$(o);
				tempLeft = o.position().left;

				flowId = 'hflow'+i;
				itemdata={};
				itemdata.id=flowId;
				itemdata.inverse = inverse = (o[0].getAttribute("data-inverse")||"0")=="1";
				itemdata.step = step = parseFloat(o[0].getAttribute("data-step"))||1;

				itemdata.rawLeft=tempLeft;
				itemdata.width = o.width();

				minLeft = -itemdata.width;
				maxLeft = me.opts.flowPageWidth+itemdata.width;

				itemdata.minLeft =minLeft = parseFloat(o[0].getAttribute("data-minleft"))||minLeft;
				itemdata.maxLeft =maxLeft = parseFloat(o[0].getAttribute("data-maxleft"))||maxLeft;
		
				if(me.opts.autoOffsetItem){

					tempLeft =inverse?
						(tempLeft-step * me.opts.flowPageHeight * me.opts.flowPageIndex):
						(tempLeft+step * me.opts.flowPageHeight * me.opts.flowPageIndex);
					
					o.css({
						"left":( inverse? minLeft:maxLeft ),
						"right":"auto"
					});

					tempLeft = inverse?(tempLeft-me.opts.gapTop*step):(tempLeft+me.opts.gapTop*step);

				}

				itemdata.proxyLeft = tempLeft;

				me.itemdata[flowId] = itemdata;

				o[0].setAttribute("data-flowid",flowId);

			});
		},		
		animateV:function(){
			var me = this,
				itemdata=null;
			this.$vitems.each(function(i,o){

				itemdata = me.itemdata[o.getAttribute("data-flowid")];

				o = $(o);
				var step = itemdata.step,
					minTop = itemdata.minTop,
					maxTop = itemdata.maxTop,
					proxyTop = itemdata.proxyTop,
					inverse = itemdata.inverse,//是否反向
					curTop = 0,
					distance = step*Math.abs(me.scrollDiff);

				if(me.opts.useAnimation){
					o.stop(true,true);
				}
				

				if (me.scrollDir==1) {
					//往下滚动，东西往上走
					proxyTop = inverse?(proxyTop+distance):(proxyTop-distance);
					curTop = proxyTop<minTop?minTop:proxyTop;
					curTop = curTop>maxTop?maxTop:curTop;
				}else{
					proxyTop = inverse?(proxyTop-distance):(proxyTop+distance);
					curTop = proxyTop>maxTop?maxTop:proxyTop;
					curTop = curTop<minTop?minTop:curTop;
				}

				itemdata.proxyTop = proxyTop;

				if(me.opts.useAnimation){
					o.animate({
						"top":curTop
					},"fast",function(){
						me.isInView(o);
					});
				}else{
					o.css({
						"top":curTop
					});
					me.isInView(o);
				}

			});
		},
		animateH:function(){
			var me = this,
				itemdata= null;
			this.$hitems.each(function(i,o){
				itemdata = me.itemdata[o.getAttribute("data-flowid")];
				o = $(o);
				var step = itemdata.step,
					minLeft = itemdata.minLeft,
					maxLeft = itemdata.maxLeft,
					proxyLeft = itemdata.proxyLeft,
					inverse = itemdata.inverse,//是否反向
					curLeft = 0,
					distance = step*Math.abs(me.scrollDiff);

				if(me.opts.useAnimation){
					o.stop(true,true);
				}

				if (me.scrollDir==1) {
					//往下滚动，东西往上走
					proxyLeft = inverse?(proxyLeft+distance):(proxyLeft-distance);
					curLeft = proxyLeft<minLeft?minLeft:proxyLeft;
					curLeft = curLeft>maxLeft?maxLeft:curLeft;
				}else{
					proxyLeft = inverse?(proxyLeft-distance):(proxyLeft+distance);
					curLeft = proxyLeft>maxLeft?maxLeft:proxyLeft;
					curLeft = curLeft<minLeft?minLeft:curLeft;
				}

				itemdata.proxyLeft = proxyLeft;

				if(me.opts.useAnimation){
					o.animate({
						"left":curLeft
					},"fast",function(){
						me.isInView(o);
					});
				}else{
					o.css({
						"left":curLeft
					});
					me.isInView(o);
				}

			});
		},
		update:function(opts,reInit){
			this.opts = opts;
			if(reInit){
				this.init();
			}
		},//updateOpts
		//当前容器是否在可视区域内
		isInView:function($item){
			var offset = $item.offset(),
				pos = $item.position(),
				top = offset.top-this.scrollTop,
				left = pos.left,
				winHeight = $win.height(),
				minHeight = this.opts.flowPageHeight>winHeight?winHeight:this.opts.flowPageHeight;


			if ( ( top >= 0 ) && ( top<minHeight ) && ( left>=0 ) && (left<this.opts.flowPageWidth) ) {
				//console.log("浮动对象在可视范围内");
				$item.addClass(this.opts.clItemInView);
				return true;
			};
			//console.log("浮动对象不可见");
			$item.removeClass(this.opts.clItemInView);
			return false;

		},
		//检查所有元素是否在可视范围内
		_checkViewable:function(){
			var me = this;
			this.$vitems.each(function(i,o){

				me.isInView($(o));

			});
			this.$hitems.each(function(i,o){

				me.isInView($(o));

			});

		},
		_onScroll:function(){

			var scrollTop0 = this.scrollTop,
				scrollTop1 = $win.scrollTop();

			this.scrollDiff = scrollTop1 - scrollTop0;

			if (this.scrollDiff>0) {
				this.scrollDir = 1;
			}else{
				this.scrollDir = 0;
			}

			this.scrollTop = scrollTop1;

			//console.log("滚动方向："+(this.scrollDir==1?"下":"上")+";滚动距离："+this.scrollTop);

			this.animateV();
			this.animateH();

		},
		_onMouseWheel:function(delta){
			if (delta>0) {
				//向上滚
				//this.scrollDir = 0;
			}else{
				//this.scrollDir = 1;
			}
			
		},
		//滚动至当前页
		scrollToView:function(){

			$.fn.flowit.scrollToView(this.$d,this.opts.scrollToViewDuration);

		}//scrollToView
	};

	$.fn.flowit = function(opts) {
		// Set the options.
		var optsType = typeof(opts),
			opts1 = optsType!=='string'?$.extend(true,{}, $.fn.flowit.defaults, opts||{}):$.fn.flowit.defaults,
			args = arguments;
		
		// Go through the matched elements and return the jQuery object.
		return this.each(function () {
			var $me = $(this),
				instance = $me.data("flowit");
			if(instance) {

				if(instance[opts]){
					
					instance[opts].apply(instance,Array.prototype.slice.call(args, 1));

				}else if (typeof(opts) === 'object' || !opts){
					
					instance.update.apply(instance,args);

				}else{
					console.log('Method '+opts+' does not exist in jQuery.flowit');
				}

			}else {
				$me.data("flowit",new model($me, opts1));
			}
		});
	};

	$.fn.flowit.scrollToView = function($target,duration){

		var top = $target.offset().top;

		$("html,body").stop().animate(
			{
				scrollTop:top
			},
			duration,
			'easeInOutExpo',
			function(){
				$win.trigger("onScrollToView.flowit");
			}
		);

	};

	$.fn.flowit.defaults = {
		cssItemVertical:'.ui-vflow',	//垂直滚动
		cssItemHorizontal:'.ui-hflow',	//水平滚动
		clItemInView:'ui-flowin',		//元素可见时的类名
		disableInIE6:false, 			//是否在IE6下禁用滚动视差
		scrollToViewDuration:500,		//整屏切换时的时长
		gapTop:0,						//视差滚动内容距离顶部的距离
		useAnimation:true,				//滚动视差的元素是否应用动画
		autoOffsetItem:false,			//是否自动计算元素的偏移值并重新定位
		flowPageHeight:877,				//每屏高度-用于自动计算元素偏移值
		flowPageWidth:null,				//每屏宽度-不指定的话则使用窗体的宽度
		flowPageIndex:1 				//页索引号-用于自动计算元素偏移值
	};

})(jQuery);
