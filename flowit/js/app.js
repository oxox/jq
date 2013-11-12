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
			"flowitGapTop":153, 			//第一页距离窗口顶部的距离
			"flowitInIE6":false,		//IE6下禁用滚动视差效果
			"scrollToViewDuration":1000
		});
	};

	return pub;
})(jQuery));