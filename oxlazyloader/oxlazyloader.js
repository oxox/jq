/**
 * 图片延迟加载
 * CMD require: jquery
 */
define(function(require,exports,module){
	//var $ = require('jquery.min.js'); //jq地址请根据实际情况修改，需要CMD的JQ

	var oxLazyloader = function(options){
		this.options = $.extend({}, oxLazyloader.defaults, options);
		this._init();
	}

	oxLazyloader.prototype = {
		constructor: 'oxLazyloader',

		_init: function(){
			var opts = this.options;
			this.container = opts.container && $(opts.container).length != 0 ? $(opts.container) : $(document);
			//若无动态插入的内容,缓存待加载的内容
			if (!opts.dynamic) {
				this.lazyItems = this.container.find('[' + opts.lazyAttr + ']');
				if (this.lazyItems.length == 0) {
					return ; //无加载内容 return
				}
			}
			this._bindEvent();
			this._loadItems();//初始化时，load一次
		},

		_bindEvent: function(){
			var self = this;
			this._loadFn = function(){
				console.log('srcoll')
				self._loadItems();
			}
			$(window).bind('resize.' + this.constructor + ' scroll.'+ this.constructor, this._loadFn);
		},

		/*
		 * 加载图片
		*/
		_loadItems: function(){
			//dynamic为true(存在动态内容)时，每次都取一次待加载内容
			var opts = this.options, 
				self = this,
				lazyAttr = opts.lazyAttr, 
				items = opts.dynamic ? this.container.find('[' + lazyAttr + ']') : this.lazyItems;
			$.each(items, function(){
				var item = $(this);
				if (self._isInViewport(item)) {
					var src = item.attr(lazyAttr);
					item.attr('src', src).removeAttr(lazyAttr);
				}
			});
			//无动态插入时，更新待加载内容
			if (!opts.dynamic) {
				this.lazyItems = items.filter('[' + lazyAttr + ']');
				//完全加载时，若autoDestroy为true，执行destroy方法
				if (this.lazyItems.length == 0 && opts.autoDestroy) {
					self.destroy();
				}
			}
		},

		/*
		 * 是否在视窗中 暂只考虑垂直方向
		*/
		_isInViewport: function(item){
			var item = $(item),
				win = $(window),
				scrollTop = win.scrollTop(),
				threshold = this.options.threshold,
				maxTop = scrollTop + win.height() + threshold,
				minTop = scrollTop - threshold,
				itemTop = item.offset().top,
				itemBottom = itemTop + item.outerHeight();
			if (itemTop > maxTop || itemBottom < minTop) {
				return false;
			}
			return true;
		},

		/*
		 * 停止监听
		*/
		destroy: function(){
			$(window).unbind('resize.' + this.constructor + ' scroll.'+ this.constructor, this._loadFn);
		}
	}

	/*
	 * static function
	 * 替换Html代码中src
	*/
	oxLazyloader.toLazyloadHtml = function(html, lazyAttr, placeholder){
		var lazyAttr = lazyAttr || this.defaults.lazyAttr,
			placeholder = placeholder || this.defaults.placeholder,
			reg = /(<img.*?)src=["']([^"']+)["'](.*?>)/gi;
		return html.replace(reg, '$1src=\"'+placeholder+'\" '+lazyAttr+'=\"$2\" $3');
	}	

	/*
	 * 默认配置
	*/
	oxLazyloader.defaults = {
		container: 'document',
		placeholder: 'http://static.gtimg.com/icson/img/common/blank.png', //占位图地址
		lazyAttr: 'data-oxlazy', //lazyload属性名，值为图片真实地址
		autoDestroy: true, //容器内的图片都加载完成时，是否自动停止监听
		dynamic: false, //是否有动态的内容插入
		threshold: 100 //阀值，提前加载的距离
	}

	return oxLazyloader;
});
