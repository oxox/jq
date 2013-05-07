// JQ 动画插件
(function($,undefined){

//CSS3 贝塞尔曲线：http://www.roblaplaca.com/examples/bezierBuilder/

	//判断是否支持transtion
	$.support.transition = (function () {
		var thisBody = document.body || document.documentElement;
		var thisStyle = thisBody.style;
		return thisStyle.transition !== undefined || thisStyle.WebkitTransition !== undefined || thisStyle.MozTransition !== undefined || thisStyle.MsTransition !== undefined || thisStyle.OTransition !== undefined;
	})();

/**
 * how to use? https://github.com/rdallasgray/bez
 */
$.extend({bez:function(a){var b="bez_"+$.makeArray(arguments).join("_").replace(".","p");if(typeof $.easing[b]!="function"){var c=function(a,b){var c=[null,null],d=[null,null],e=[null,null],f=function(f,g){return e[g]=3*a[g],d[g]=3*(b[g]-a[g])-e[g],c[g]=1-e[g]-d[g],f*(e[g]+f*(d[g]+f*c[g]))},g=function(a){return e[0]+a*(2*d[0]+3*c[0]*a)},h=function(a){var b=a,c=0,d;while(++c<14){d=f(b,0)-a;if(Math.abs(d)<.001)break;b-=d/g(b)}return b};return function(a){return f(h(a),1)}};$.easing[b]=function(b,d,e,f,g){return f*c([a[0],a[1]],[a[2],a[3]])(d/g)+e}}return b}});

	
	/***
	 * 格式化style 字符串,去除单位
	 * @param {Object} style_str
	 */
	var formatAttr = function(style_str){
		var styles = style_str.split(';'), i = styles.length, style, k, v,json = {};
			//set style
			while (i--) {
				style = styles[i].split(':');
				k = $.trim(style[0]);
				v = $.trim(style[1]);
				if (k.length > 0 && v.length > 0) {
					json[k] = v;
				}
			};
			return json;
	};
	

	/**
	 * 转换CSS动画为JS动画
	 */
	var convertEasing = function(cords){
		var cords = cords.split(',');
		return $.bez(cords);
	}
	
    /**
     * CSS3动画
     */
    var css3Anie = function($e,option){
    	
		if ($.support.transition){
			//CSS3动画
			$e.delay(option.delay).queue(function(next){
				$e.css(option.ani);
				//回调函数
				if (option.complete) option.complete.apply($element[0]);
				next();
			});
		}else{
			//JS动画
			$e.queue(function(next) {
				$(this).delay(option.delay).animate(option.ani, option.duration, convertEasing(option.easing), option.complete);
				next();
			});
		}
    };

    /**
	 * CSS & JS 动画
	 */
	var transtion = function($e,option){

		//格式化
		if (option.ani && (typeof option.ani === 'string') ) {
			//ani
			var anis = option.ani.split('|'),
				length = anis.length,
				duration,
				delay,
				easing;

			//console.log(anis);

			if( typeof(option.duration) === 'string' ){
				duration = option.duration.split('|');
			}else{
				duration =[(option.duration||$.fn.anie.defaults.duration)];
			}

			if( typeof(option.delay) === 'string' ){
				delay = option.deplay.split('|');
			}else{
				delay =[(option.delay||$.fn.anie.defaults.delay)];
			}

			if( typeof(option.easing) === 'string' ){
				easing = option.easing.split('|');
			}else{
				easing = [ $.fn.anie.defaults.easing];
			}

				
			//多个动画
			for(var i=0;i<length;i++){
				var obj ={
					'ani':formatAttr(anis[i]),
					'duration':(duration[i]||duration[0]),
					'delay':(delay[i]||delay[0]),
					'easing':(easing[i]||easing[0])
				};

				obj.ani.transition || (obj.ani.transition = 'all '+ obj.duration +'ms cubic-bezier(' + obj.easing + ')');
				css3Anie($e,obj);
			};

		}else{
			//通过JS方式调用
			option.ani.transition || (option.ani.transition = 'all '+ option.duration +'ms cubic-bezier(' + option.easing + ')');
			css3Anie($e,option);
		}

	};
	
	var Anie = (function(){

		/**
		 * 构造函数
		 */
		function Anie(element,properties, duration, easing, complete ){
			this.element = $(element);
			var options = {};
			//以下if语句是为了模拟jq自带的animate用法
			//只有一个参数时，是一个对象
			if (typeof properties == "object") {
				options.ani = properties;
			}
			//两个参数时的回调函数
			if (typeof duration == "function") {
				complete  = duration;
			}
			//三个参数时
			if (typeof easing == "function") {
				complete  = easing;
			}
			//假设是 四个参数同时存在
			if (duration !== undefined && (typeof duration) != 'object') {
	            options = {ani:properties,duration: duration, easing: easing, complete: complete };
	        }
			this.settings = $.extend({},$.fn.anie.defaults,this.element.data(),options);
			this.init();
		};

		/**
		 * 
		 */
		Anie.prototype = {
			
			init:function(){
				var $this = this.element,
					option = this.settings;
				//判断触发条件
				//默认执行动画
				if(!option.trigger){
					transtion($this,option);
				}else{
					//自定义事件
					var $trigger = $(option.trigger),
						events = $trigger.data('event') || 'click';
					//debugger;	
					//jquery新版已经用on代替bind了
					$trigger.bind(events,function(){
						transtion($this,option);
					})
				}
			}//init
			
		};
		
		return Anie;

	})();
	
	$.fn.anie = function (prop, speed, easing, callback) {
		return this.each(function () {
	      var $this = $(this),
	          data = $this.data('anie');
	      if (!data) $this.data('anie', (data = new Anie(this, prop, speed, easing, callback)))
	      if (typeof prop == 'string') data[prop]()
	    })
    };

    $.fn.anie.defaults = {
        delay :  0,
		duration : 400 ,
		easing : '0, 0, 1, 1'//linear
    };

    /*
     Apply plugin automatically to any element with data-plugin
     */

    $(function () {
    	$('[data-ani]').each(function(){
    		// $(this).anie('init');
    		return new Anie($(this));
    	})
    });    

})(jQuery,undefined);