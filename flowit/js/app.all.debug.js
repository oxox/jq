/**
 * @namespace JF
 * @summary 一个简单的js模块管理框架
 * @desc 实现Module Pattern，解决最基本的js代码组织问题。不包含依赖管理，动态加载等功能，如需要推荐使用SeaJS或RequireJS。注：JF假设你使用jQuery，如果您使用别的库，可以针对性改一下代码。
 * @author Levin
 * @version 1.2.1
 * @example 
	JF.M("Module1",(function($){
		var p={},
			pub={};
		
		return pub;
	})(jQuery));
 */
var JF = (function ($) {
	var p = {},
		pub = {};
	/*private area*/
	p._modules = {};
	/**
	* @private
	* @desc onLoaded方法,统一管理页面加载完毕后的回调方法
	* 说明:onLoaded方法接管所有页面上注册到$(document).ready(callback)中的callback方法;
	* 如果你要新增一个$(callback)或$(document).ready,请将你的callback方法放在onLoaded方法体内
	*/
	p.onLoaded = function () {
		var k = null;
		for (var m in p._modules) {
			k = m;
			if ((m = p._modules[m]) && m.onLoad) {
				try {
					m.onLoad(m);
					delete m.onLoad;
				} catch (e) {
					alert('Error init module [' + k + ']:' + e.message || e.description);
				}
			};
		};
	};
	/**
	* @private
	* @desc initEvents方法
	*	作用:用于为页面dom元素注册各种事件!
	*	说明:Html页面仅用于表现，任何时候应在标签里面直接注册事件。即避免如<a onclick="xx"/>
	*/
	p.initEvents = function (opts) {
		$(document).ready(p.onLoaded);
	};

	/*public area
	+++++++++++++++++++++++++++++*/
	/**
	* 初始化JF框架，页面js逻辑的唯一入口。一般至于</body>标签之前，用户向整个app传递参数用
	* @public
	* @function
	* @name JF#Init
	* @param {Object} opts 配置对象
	* @example
	*
	*	JF.Init({x:'kk',y:'zz'});
	*
	*/
	pub.Init = function (opts) {
		pub.cfg["GLOBAL"]=pub.opts = p.opts = opts = $.extend(opts || {},JF.opts||{});
		var k = null;
		for (var m in p._modules) {
			k = m;
			if ((m = p._modules[m]) && m.init) {
				try {
					m.init();
					delete m.init;

					if(m._){
						p.initSub(m._);
					}

				} catch (e) {
					alert('Error init module [' + k + ']:' + e.message || e.description);
				}
			};
		};
		p.initEvents();
	};

	/** 
		模块配置对象，用于存放模块的需要共享的配置信息 
		@public
		@function
		@name JF#cfg
		@example
			JF.cfg['moduleName']={"key":"val"};
	*/
	pub.cfg = {};

	/**
	 * 初始化子模块。如果你的一个模块里面有子模块p.sub1，p.sub1又具有init方法的时候，可以在pub.Init中调用InitSub方法让JF对子模块进行初始化。
	 * @public
	 * @function
	 * @name JF#InitSub
	 * @param {Object} sub sub module
	 * @example
		JF.M("xxx",(function($){
			var p={},pub={};
			p.sub1={
				init:function(){}
			};

			pub.Init = function(){
				JF.InitSub(p);
			};

			return pub;

		})(jQuery));
	 */
	pub.InitSub = function(sub) {
		for (var c in sub) {
			c = sub[c];
			if (!c) {
				continue;
			};

			if (c.init) {
				c.init.call(c);
				delete c.init;
			};

			for (var c1 in c) {
				c1 = c[c1];
				if (!c1) continue;

				if (c1.init) {
					c1.init.call(c1);
					delete c1.init;
				};
			};
		};
	};
	/**
	* onLoaded之后加载子模块。如果你的一个模块里面有子模块p.sub1，p.sub1又具有onLoad方法的时候，可以在pub.onLoad中调用LoadSub方法让JF在onLoaded之后加载子模块。
	* @public
	* @function
	* @name JF#LoadSub
	* @param {Object} sub sub module
	*/
	pub.LoadSub = function (sub) {
		for (var c in sub) {
			c = sub[c];
			if (!c) {
				continue;
			};

			if (c.onLoad) {
				c.onLoad.call(c);
				delete c.onLoad;
			};

			for (var c1 in c) {
				c1 = c[c1];
				if (!c1) continue;

				if (c1.onLoad) {
					c1.onLoad.call(c1);
					delete c1.onLoad;
				};
			};
		};
	};

	/**
	* 往模块工程JF注册一个功能模块.请在JF.Init方法前调用
	* @public
	* @name JF#AddModule
	* @function
	* @param {string} key 模块的id
	* @param {Object} module 模块的实例
	*/
	pub.AddModule = function (key, module) {
		if (p._modules[key]) {
			JF.log("Module with key '" + key + "' has beed registered!");
			return;
		};
		p._modules[key] = module;
		//register namespace
		pub[key] = module;
		return pub;
	};
	/**
	* 根据id获取指定注册的模块
	* @public
	* @function
	* @name JF#GetModule
	* @param {string} key 模块的id
	*/
	pub.GetModule = function (key) {
		return p._modules[key];
	};
	/**
	* AddModule 和 GetModule 的快捷方法。当没有指定module参数时想到于调用了JF.GetModule方法;当指定了module参数时，相当于调用了JF.AddModule方法
	* @public
	* @function
	* @name JF#M
	* @param {string} key 模块的id
	* @param {Object} module 模块实例
	* @returns 返回JF或者模块实例
	*/
	pub.M = function (key, module) {
		if (arguments.length == 1) {
			return pub.GetModule(key);
		};
		if (arguments.length == 2) {
			return pub.AddModule(key, module);
		};
		return null;
	};
	/**
	* 简单的html模板解析方法
	* @public
	* @function
	* @name JF#EvalTpl
	* @example
	*	var str="<a href=/u/%uid%>%username%</a>",
	*		data={uid:1,username:'levin'};
	*	alert(JF.EvalTpl(str,data));
	*	//提示信息为："<a href=/u/1>levin</a>"
	* @param {string} str html模板，字段用%包含
	* @param {Object} data json数据
	*/
	pub.EvalTpl = function (str, data) {
		var result;
		var patt = new RegExp("%([a-zA-z0-9]+)%");
		while ((result = patt.exec(str)) != null) {
			var v = data[result[1]] || '';
			str = str.replace(new RegExp(result[0], "g"), v);
		};
		return str;
	};
	/**
	* 获取指定长度的随机字符串。注意：仅仅由数字和字母组成
	* @public
	* @function
	* @name JF#RdStr
	* @param {int} size 随机字符串的长度
	* @param {Boolean} plusTimeStamp 是否加上当前时间戳
	*/
	pub.RdStr = function (size, plusTimeStamp) {
		var size0 = 8;
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		size = size || size0; size = size < 1 ? size0 : size; size = size > chars.length ? size0 : size;
		var s = '';
		for (var i = 0; i < size; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			s += chars.substring(rnum, rnum + 1);
		};
		if (plusTimeStamp) {
			s += new Date().getTime();
		};
		return s;
	};
	/**
	* 即:function(){return false;}
	* @public
	* @function
	* @name JF#NoPropagation
	*/
	pub.NoPropagation = function () { return false; };
	/**
	* NoopHandler，即e.stopPropagation();e.preventDefault();
	* @public
	* @function
	* @name JF#NoopHandler
	*/
	pub.NoopHandler = function (e) {
		e.stopPropagation();
		e.preventDefault();
	};
	/**
	* 获取字符串的长度，一个汉字的字符长度为2
	* @public
	* @function
	* @name JF#charLength
	* @param {string} str 字符串
	* @returns 整型数值
	*/
	pub.charLength = function (str) {
		var nstr = str.replace(/[^x00-xff]/g, "JJ");
		return nstr.length;
	};
	/**
	* 截断字符串
	* @public
	* @function
	* @name JF#Tail
	* @param {string} str 待截断的字符串
	* @param {int} size 截断长,注:1个中文字符长度为2
	* @param {string} tailStr 截断后加在末尾的小尾巴,默认"..."
	* @returns 截断后的字符串
	*/
	pub.Tail = function (str, size, tailStr) {
		str = $.trim(str);
		var cLen = pub.charLength(str);
		size = size <= 0 ? cLen : size;
		if (size >= cLen) return str;
		while (pub.charLength(str) > size) {
			str = str.substr(0, str.length - 1);
		};
		str += (tailStr || "...");
		return str;
	};
	/**
	* document.getElementById的快捷方法
	* @public
	* @function
	* @name JF#g
	* @param {string} id 元素id
	* @returns 返回指定id的dom对象
	*/
	pub.g = function (id) {
		return document.getElementById(id);
	};
	/**
	* window.console.log的快捷方法
	* @public
	* @function
	* @name JF#log
	* @param {Object} obj log的对象
	*/
	pub.log = function (obj) {
		if (!p.opts.debug) return;
		if (window['console'] && window['console'].log) {
			window['console'].log(obj);
		}
	};

	/**
	* 获取指定的URL查询字符串
	* @public
	* @function
	* @name JF#getUrlParam
	* @param {String} name 查询字符串的键名
	*/
	pub.getUrlParam = function (name) {
		var paramStr = location.search;
		if (paramStr.length == 0) return null;
		if (paramStr.charAt(0) != '?') return null;
		paramStr = unescape(paramStr);
		paramStr = paramStr.substring(1);
		if (paramStr.length == 0) return null;
		var params = paramStr.split('&');
		for (var i = 0; i < params.length; i++) {
			var parts = params[i].split('=', 2);
			if (parts[0] == name) {
				if (parts.length < 2 || typeof (parts[1]) == "undefined" || parts[1] == "undefined" || parts[1] == "null") return "";
				return parts[1];
			}
		}
		return null;
	};
	/**
	* 获取url的查询字符串并转换为json对象.需约定查询字符串是json字符串
	* @public
	* @function
	* @name JF#getUrlJson
	*/
	pub.getUrlJson = function () {
		var paramStr = location.search,
			retVal = {};
		if (paramStr.length == 0 || paramStr.charAt(0) != '?') return retVal;
		paramStr = unescape(paramStr);
		paramStr = paramStr.substring(1);
		if (paramStr.length == 0) return retVal;

		try {
			retVal = JSON.parse(paramStr);
		} catch (e) {

		}
		return retVal;

	};
	/**
	* 设置指定的URL查询字符串
	* @public
	* @function
	* @name JF#setUrlParam
	* @param {String} param 查询字符串的键名
	* @param {String} paramVal 查询字符串的键值
	* @param {String} url 指定的url。不若不指定则默认location.href
	*/
	pub.setUrlParam = function( param, paramVal, url) {

		url = url || location.href;

		var newAdditionalURL = "",
			tempArray = url.split("?"),
			baseURL = tempArray[0],
			additionalURL = tempArray[1],
			temp = "";
		
		if (additionalURL) {
			tempArray = additionalURL.split("&");
			for (i=0; i<tempArray.length; i++){
				if(tempArray[i].split('=')[0] != param){
					newAdditionalURL += temp + tempArray[i];
					temp = "&";
				}
			}
		}
		var rows_txt = temp + "" + param + "=" + paramVal,
			retVal = baseURL + "?" + newAdditionalURL + rows_txt;
		
		return retVal;
	};
	/**
	* ajax json post，适用于asp.net mvc ajax json post
	* @public
	* @function
	* @name JF#jsonPost
	* @param {String} url ajax url
	* @param {Object} opts options
	*/
	pub.jsonPost = function (url, opts) {

		opts = opts || {};
		if (opts.data) {
			opts.data = JSON.stringify(opts.data);
		}
		var opts0 = {
			dataType: 'json',
			contentType: 'application/json; charset=utf-8',
			type: "POST"
		};
		var xhrObj = $.ajax(url, $.extend(opts0, opts));

		return xhrObj;

	};

	/**
	* ajax json get，适用于asp.net mvc ajax json get request
	* @public
	* @function
	* @name JF#jsonGet
	* @param {String} url ajax url
	* @param {Object} opts options
	*/
	pub.jsonGet = function (url, opts) {

		opts = opts || {};
		var opts0 = {
			dataType: 'json',
			contentType: 'application/json; charset=utf-8',
			type: "GET"
		};
		var xhrObj = $.ajax(url, $.extend(opts0, opts));

		return xhrObj;

	};
	/**
	* 指定的文件是否是图片
	* @public
	* @function
	* @name JF#isImg
	* @param {String} file 文件路径
	*/
	pub.isImg = function(file) {
	    file = file.toLowerCase();
	    var isImg = false;
	    var arrImg = ['.jpg','.png','.gif','.jpeg'];
	    for (var i = 0; i < arrImg.length; i++) {
	        isImg = (file.substr(file.lastIndexOf(arrImg[i])) == arrImg[i]);
	        if (isImg) {
	            break;
	        }
	    }
	    return isImg;
	};

	/**
	 * 获取iframe的window对象
	 * @public
	 * @function
	 * @name JF#ifWin
	 * @param {String} id iframe的id
	 */
	pub.ifWin = function (id) {
		var el = document.getElementById(id);
		return (el.contentWindow || el.contentDocument);
	};

	//给外部调用（例如android的webview调用)
	pub.onLoad = p.onLoaded;

	return pub;

})(window["jQuery"]);

//常用简单的JQ插件
;(function ($) {
	/**
	* 将一个form表单序列化成json对象
	* @public
	* @function
	* @name $.fn.serializeJSON
	* @example
		$("#formxxx").serializeJSON();
	*/
	$.fn.serializeJSON = function () {
		var json = {};
		jQuery.map($(this).serializeArray(), function (n, i) {
			json[n['name']] = n['value'];
		});
		return json;
	};
	/**
	 * 绑定css3的animateend事件
	 * @public
	 * @function
	 * @name $.fn.onAnimated
	 * @param {Function} cbk 事件处理函数
	 */
	$.fn.onAnimated = function (cbk) {
	
		return this.each(function(){
		
			$(this).bind("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd",cbk);
			
		});
		
	};
	/**
	 * transitionend
	 * @public
	 * @function
	 * @name $.fn.onTransitioned
	 * @param {Function} cbk 事件处理函数
	 */	
	$.fn.onTransitioned = function (cbk) {

		return this.each(function () {

			$(this).bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", cbk);

		});

	};

})(jQuery);;
(function($) {

$.fn.fixedPos = function(options) {

    var defaults = {
        x:null,//left
        y:null//top
    };

    var o = $.extend(defaults, options||{}),
        isIe6=false,//is ie ? yes:ie no: not ie
        $html= $('html');

    if($.browser.msie && parseInt($.browser.version)==6){
        isIe6=true;
    }

    if(!isIe6){
        return this;
    }

    if (isIe6 && $html.css('backgroundAttachment') !== 'fixed') {
        $html.css('backgroundAttachment','fixed') 
    };


    return this.each(function() {

        var domThis=this,
            $this=$(this);

        $this.css('position' , 'absolute');

        if(o.x!==null){
            domThis.style.setExpression('left', 'eval((document.documentElement).scrollLeft + ' + o.x + ') + "px"');
        }
        if(o.y!==null){
            domThis.style.setExpression('top', 'eval((document.documentElement).scrollTop + ' + o.y + ') + "px"');
        }

    });

};

})(jQuery);
/*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 * 
 * Requires: 1.2.2+
 */

(function($) {

var types = ['DOMMouseScroll', 'mousewheel'];

if ($.event.fixHooks) {
    for ( var i=types.length; i; ) {
        $.event.fixHooks[ types[--i] ] = $.event.mouseHooks;
    }
}

$.event.special.mousewheel = {
    setup: function() {
        if ( this.addEventListener ) {
            for ( var i=types.length; i; ) {
                this.addEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = handler;
        }
    },
    
    teardown: function() {
        if ( this.removeEventListener ) {
            for ( var i=types.length; i; ) {
                this.removeEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = null;
        }
    }
};

$.fn.extend({
    mousewheel: function(fn) {
        return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
    },
    
    unmousewheel: function(fn) {
        return this.unbind("mousewheel", fn);
    }
});


function handler(event) {
    var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
    event = $.event.fix(orgEvent);
    event.type = "mousewheel";
    
    // Old school scrollwheel delta
    if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta/120; }
    if ( orgEvent.detail     ) { delta = -orgEvent.detail/3; }
    
    // New school multidimensional scroll (touchpads) deltas
    deltaY = delta;
    
    // Gecko
    if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
        deltaY = 0;
        deltaX = -1*delta;
    }
    
    // Webkit
    if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
    if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }
    
    // Add event and delta to the front of the arguments
    args.unshift(event, delta, deltaX, deltaY);
    
    return ($.event.dispatch || $.event.handle).apply(this, args);
}

})(jQuery);
;
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
;
JF.M("app",(function(){
	var p ={},
		pub={},
		$win = $(window);

	//分页模块  
	p.pager = {
		M:{
			curIndex:0,
			totalPage:0,
			clNavOn:'link_on',
			clNavDisable:'btn_disabled',
			isMousewheeling:false
		},
		C:{
			_initEvts:function(){
				//前一页
				this.$btnPrev=$("#btnPrev").bind("click",function(e){

					if(p.pager.M.curIndex>0){
						pub.goTo(p.pager.M.curIndex-1);
					}
					return false;

				});
				//后一页
				this.$btnNext=$("#btnNext").bind("click",function(e){

					if(p.pager.M.curIndex<(p.pager.M.totalPage-1)){
						pub.goTo(p.pager.M.curIndex+1);
					}
					return false;

				});
				//分页导航
				p.pager.M.$links=$("#floatLink a").bind("click",function(e){
					var $this = $(this);
					if ($this.hasClass(p.pager.M.clNavOn)) {
						return false;
					};
					var idx = $this.index();
					
					pub.goTo(idx);

				});

				$win.bind("scroll.apppager",function(e){


					if(p.pager.C.isAnimating() || p.pager.M.isMousewheeling ){
						//console.log(p.pager.M.isMousewheeling);
						e.preventDefault();
						return false;
					}

					var scrollTop = $win.scrollTop(),
						diff = scrollTop-JF.opts.pageHeight-JF.opts.flowitGapTop;
						idx = Math.abs((diff/JF.opts.pageHeight)+1);

					idx = Math.floor(idx);
					p.pager.M.curIndex = idx;
					p.pager.C.setNav(idx);



				}).bind("onScrollToView.flowit",function(e,d){
					p.pager.M.isMousewheeling=false;
					if(JF.opts.animateNav){
						p.pager.M.$links.fadeIn("fast");
						p.pager.C.$btnLinks.fadeIn("fast");
					}
				});

				//鼠标滚动翻页
				if(JF.opts.mouseWheelPager){
					this.$body.bind("mousewheel.apppager",function(e,delta){
						if(p.pager.C.isAnimating()){
							e.preventDefault();
							return false;
						}
						//如果是第一页的网上滚，也需要正常的鼠标滚动
						if( ( delta>0 ) && ( p.pager.M.curIndex ==0 ) ){

							return true;

						}
						//如果是最后一页，我们需要正常的鼠标滚轮滚动
						if( (delta<0) && ( p.pager.M.curIndex == (p.pager.M.totalPage-1) ) ){
							//console.log("last page");
							return true;
						}
						e.preventDefault();
						p.pager.C._onMouseWheel(delta);
						return false;

					});
				}//if

				//键盘翻页
				if(JF.opts.keyScrollPager){
					$(document).bind("keyup.apppager", function (e) {
						if($.inArray(e.keyCode,[33,34,35,36,38,40])>-1){
							e.preventDefault()
						}
						switch(e.keyCode){
							case 40: //arrow down
								pub.goNext();
								break;
							case 38: //arrow up
								pub.goPrev();
								break;
							case 33: // PgUp
								pub.goPrev();
								break;
							case 34://PgDn
								pub.goNext();
								break;
							case 35://END
								pub.goTo(p.pager.M.totalPage-1);
								break;
							case 36://HOME
								pub.goTo(0);
								break;
						
						};

					}).bind("keydown.apppager", function (e) {
						
						if($.inArray(e.keyCode,[33,34,35,36,38,40])>-1){
							e.preventDefault()
						}

					});
				}//if

			},
			init:function(){

				this.$html = $("html");
				this.$body = $("body");
				this.$btnLinks = $("#btnLinks");

				this._initEvts();
				p.pager.M.$pages = $(".mem_item");
				p.pager.M.totalPage = p.pager.M.$pages.length;
			},
			onLoad:function(){
				setTimeout(function(){
					$win.trigger("scroll.apppager");
					if(p.pager.M.curIndex>0){
						p.pager.M.isMousewheeling=true;
						p.pager.C.goTo(p.pager.M.curIndex,true);
					}
					
				},100);
				
			},
			goTo:function(idx,force){
				if ( (idx==p.pager.M.curIndex) && (!force) ) {
					return;
				};
				p.pager.M.curIndex = idx;
				$.fn.flowit.scrollToView(p.pager.M.$pages.eq(idx),JF.opts.scrollToViewDuration);
				p.pager.C.setNav(idx);
				if(JF.opts.animateNav){
					p.pager.M.$links.hide();
					p.pager.C.$btnLinks.hide();
				}
				
			},//goTo
			//高亮导航链接
			setNav:function(idx){
				p.pager.M.$links.removeClass(p.pager.M.clNavOn).eq(idx).addClass(p.pager.M.clNavOn);
				p.pager.C.$btnPrev.removeClass(p.pager.M.clNavDisable);
				p.pager.C.$btnNext.removeClass(p.pager.M.clNavDisable);
				if (idx==0) {
					p.pager.C.$btnPrev.addClass(p.pager.M.clNavDisable);
				}
				if(idx==(p.pager.M.totalPage-1) ){
					p.pager.C.$btnNext.addClass(p.pager.M.clNavDisable);
				}

				p.page1.reset();

			},
			//页面是否在动画过程中
			isAnimating:function(){
				var r = false;
				r = this.$html.is(":animated") || this.$body.is(":animated");
				return r;
			},
			_onMouseWheel:function(delta){
				p.pager.M.isMousewheeling=true;
				if (delta>0) {
					//向上滚
					pub.goPrev();
				}else{
					pub.goNext();
				}

				
			}//_onMouseWheel
		}//C
	};


	//滚动视差模块
	p.flowit = {
		init:function(){

			p.pager.M.$pages.each(function(i,o){

				//最后一页不做视差效果
				if(i==(p.pager.M.totalPage-1)){
					return;
				}

				var autoOffset = (i==0?false:true);
				p.pager.M.$pages.eq(i).flowit({
					flowPageIndex:i,
					autoOffsetItem:autoOffset,
					flowPageHeight:JF.opts.pageHeight,
					gapTop:JF.opts.flowitGapTop,
					disableInIE6:(!JF.opts.flowitInIE6),
					scrollToViewDuration:JF.opts.scrollToViewDuration || 500
				});

			});
		}
	};

	//延迟加载模块
	p.lazyload = {
		init:function(){
			this.$items = $("img.lazy");
			$win.bind("scroll.lazyload",function(e){
				p.lazyload.detect();
			});
		},
		detect:function(){
			this.$items.each(function(i,o){

				p.lazyload.isInView($(o));

			});
		},
		isInView:function($item){

			var srcOriginal = $item[0].getAttribute("data-original");

			if (!srcOriginal) {
				return;
			};


			var offset = $item.offset(),
				top = offset.top-$win.scrollTop(),
				winHeight = $win.height(),
				now = new Date();


			if ( ( top >= 0 ) && ( top<winHeight ) ) {
				
				$item[0].setAttribute("src" ,srcOriginal+"?t="+this.getTimeStamp());
				$item[0].removeAttribute("data-original");
				
			};

		},
		getTimeStamp:function(){

			var now = new Date();

			return (now.getFullYear()+''+now.getMonth()+''+now.getDate());

		}
	};

	//首屏
	p.page1 = {
		timer:null,
		init:function(){
			$("#btnReadMemory").bind("click",function(e){
				$("#imgShow04").addClass("rotate");
				p.page1.reset();
				p.page1.timer = setTimeout(function(){
					pub.goNext();
				},JF.opts.readMemoryDuration||3000);
			});
		},
		reset:function(){
			clearTimeout(this.timer);
		}
	};

	pub.goTo = p.pager.C.goTo;
	//下一帧
	pub.goNext = function(){
		p.pager.C.$btnNext.trigger("click");
	};
	//前一帧
	pub.goPrev = function(){
		p.pager.C.$btnPrev.trigger("click");
	};

	pub.onLoad = function(){JF.LoadSub(p);};
	pub.init = function(){JF.InitSub(p);};

	pub.bootup = function(){
		//App startup
		JF.Init({
			"animateNav":true,			//滚轮翻页是否渐现右侧导航
			"mouseWheelPager":true,		//是否鼠标滚轮翻页
			"keyScrollPager":true, 		//是否键盘上下箭头翻页
			"readMemoryDuration":($.browser.msie?10:600), 	//首屏点击“读取记忆”按钮时的时值
			"pageHeight":785,			//每页的高度
			"flowitGapTop":0, 			//第一页距离窗口顶部的距离
			"flowitInIE6":false,		//IE6下禁用滚动视差效果
			"scrollToViewDuration":1000
		});
	};

	return pub;
})(jQuery));;
