/**
 * 实现图片/背景图/iframe的延迟加载
 * @module oxlazy
 * @class oxlazy
 * @static
 */
(function($){
	var $win = $(window);
	//延迟加载模块
	var oxlazy = {
		flag:'data-oxlazy',
		init:function(){
			this.items = $.makeArray($("["+this.flag+"]"));
			this.cnt = this.items.length;
			if (this.cnt===0) {
				return false;
			};
			$win.bind("scroll.oxlazy",function(e){
				oxlazy.detect();
			}).bind("resize.oxlazy",function(e){
				oxlazy.detect();
			});
		},
		detect:function(){
			var oddItems = [];
			for (var i = 0; i < this.cnt; i++) {
				if(!oxlazy.rock(this.items[i])){
					oddItems.push(this.items[i]);
				};
			};

			this.items=oddItems;
			this.cnt=this.items.length;
		},
		isInView:function(item){
			var $item = $(item),
				offset = $item.offset(),
				top = offset.top-$win.scrollTop(),
				winHeight = $win.height(),
				itemHeight = -($item.height());

			if ( (top<itemHeight) || (top>=winHeight) ) {
				return false;
			};
			return $item;
		},
		rock:function(item){

			var srcOriginal = item.getAttribute(this.flag);

			if ( (!srcOriginal) || (srcOriginal==='') ) {
				return false;
			};

			var $item = this.isInView(item);
			if (!$item) {
				return false;
			};

			var isImg = item.tagName==='IMG',
				isIframe = item.tagName==='IFRAME',
				autoTimeStamp = item.getAttribute(this.flag+'-timestamp')==='1',
				timeStamp = autoTimeStamp?('?t='+this.getTimeStamp()):'';

			srcOriginal=srcOriginal+timeStamp;

			if (isImg||isIframe) {
				item.setAttribute("src" ,srcOriginal);
			}else{
				$item.css('background-image','url('+srcOriginal+')');
			};

			item.removeAttribute(this.flag);
			return true;

		},
		getTimeStamp:function(){

			var now = new Date();

			return (now.getFullYear()+''+now.getMonth()+''+now.getDate());

		}
	};

	$(function(){
		oxlazy.init();
		oxlazy.detect();
	});

})(jQuery);