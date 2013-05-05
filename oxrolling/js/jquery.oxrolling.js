/*!
  元素滚动插件
  @name jquery.oxrolling.js
  @author levinhuang (lv)
  @version 1.0
  @date 05/05/2013
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
		this.init();
	};

	model.prototype = {
		showItem:function(idx){
			idx = idx<0?0:idx;
			idx = idx>(this.total-1)?0:idx;
			
			this.prevIdx = this.curIdx;
			this.curIdx = idx;

			var me = this;

			if(this.rollingType==0){
				this.$items.eq(this.prevIdx).animate({
					top:-me.itemHeight
				},this.opts.interval);
				this.$items.eq(this.curIdx).animate({
					top:0
				},this.opts.interval);
				return;
			}

			this.$d.children()
				.stop(true,true)
				.animate({
					'margin-top':-(me.curIdx*me.itemHeight)
				},this.opts.interval);

		},
		init:function () {

			this.targetNumber = parseInt(this.$d.attr('data-n'))||0;
			//滚动类型：0时为数字滚动；1为子元素位移，位移的索引为targetNumber
			this.rollingType = parseInt(this.$d.attr('data-type'))||0;

			//子元素高度
			this.itemHeight = this.$d.height();

			var html = [];

			if( this.rollingType===0 && this.targetNumber>0 ){
				for (var i = 0; i <=this.targetNumber; i++) {
					if(i==0){
						continue;
					};
					html.push(this.opts.tpl_n.replace('%',i));
				};
				this.$d.append(html.join(''));
			}

			this.$items = this.$d.find(this.opts.cssItem);
			this.total = this.$items.length;

			if(this.rollingType===0){
				this.$items.filter(':gt(0)').css('top',this.itemHeight);
			}

			if (this.opts.autoPlay) {
				this.autoPlay();
			};
		},
		stopAutoPlay:function(){
			clearInterval(this.timer);
		},
		autoPlay:function(){
			this.stopAutoPlay();
			var me = this,
				interval = this.opts.interval+10;
			this.timer = setInterval(function(){

				if( me.curIdx== (me.total-1) || (me.curIdx == me.targetNumber) ){
					me.stopAutoPlay();
					return;
				};

				me.showItem(me.curIdx+1);
			},interval);
		},
		update:function(opts,reInit){
			this.opts = opts;
			if(reInit){
				this.init();
			}
		}//updateOpts
	};

	$.fn.oxrolling = function(opts) {
		// Set the options.
		var optsType = typeof(opts),
			opts1 = optsType!=='string'?$.extend(true,{}, $.fn.oxrolling.defaults, opts||{}):$.fn.oxrolling.defaults,
			args = arguments;
		
		// Go through the matched elements and return the jQuery object.
		return this.each(function () {
			var $me = $(this),
				instance = $me.data("oxrolling");
			if(instance) {

				if(instance[opts]){
					
					instance[opts].apply(instance,Array.prototype.slice.call(args, 1));

				}else if (typeof(opts) === 'object' || !opts){
					
					instance.update.apply(instance,args);

				}else{
					console&&console.log('Method '+opts+' does not exist in jQuery.oxrolling');
				}

			}else {
				$me.data("oxrolling",new model($me, opts1));
			}
		});
	};

	$.fn.oxrolling.defaults = {
		tpl_n:'<span class="rolling_item">%</span>',
		cssItem:'.rolling_item',
		autoPlay:true,				// 是否自动播放
		interval:300				// 滚动的时间间隔
	};

})(jQuery);