/*!
  进度条插件
  @name jquery.oxprobar.js
  @author levinhuang (lv)
  @version 1.0
  @date 05/06/2013
  @copyright (c) 2012-2013 levinhuang (http://oxox.io,http://tencent.com,http://t.qq.com/badstyle)
  @license Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
*/
;(function($) {

	var $win = $(window);
	var model = function($d,opts) {
		this.$d = $d;
		this.opts = opts;
		this.curValue = 0;
		this.init();
	};

	model.prototype = {
		setProgress:function(val){
			var me = this;
			this.curValue = val;
			this.$item.stop()
				.animate({
					'width':val+'%'
				},this.opts.interval,function(){
					me.opts.onDone&&me.opts.onDone.call(me);
				});
		},
		init:function () {
			this.$item = this.$d.find(this.opts.cssItem);
			this.startupNumber = parseInt(this.$d.attr('data-probar'))||0;
			
			if (this.startupNumber>0) {
				this.setProgress(this.startupNumber);
			};
		},
		update:function(opts,reInit){
			this.opts = opts;
			if(reInit){
				this.init();
			}
		}//updateOpts
	};

	$.fn.oxprobar = function(opts) {
		// Set the options.
		var optsType = typeof(opts),
			opts1 = optsType!=='string'?$.extend(true,{}, $.fn.oxprobar.defaults, opts||{}):$.fn.oxprobar.defaults,
			args = arguments;
		
		// Go through the matched elements and return the jQuery object.
		return this.each(function () {
			var $me = $(this),
				instance = $me.data("oxprobar");
			if(instance) {

				if(instance[opts]){
					
					instance[opts].apply(instance,Array.prototype.slice.call(args, 1));

				}else if (typeof(opts) === 'object' || !opts){
					
					instance.update.apply(instance,args);

				}else{
					console&&console.log('Method '+opts+' does not exist in jQuery.oxprobar');
				}

			}else {
				$me.data("oxprobar",new model($me, opts1));
			}
		});
	};

	$.fn.oxprobar.defaults = {
		cssItem:'.mod_probar_bd2',
		interval:300,				// 滚动的时间间隔
		onDone:null
	};

})(jQuery);