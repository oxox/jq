# anie


jquery anie 是一个jq动画插件，支持css3动画及JQ动画。自动判断浏览器是否支持css3 transition动画，如果支持则使用CSS3动画，否则 则使用JS动画。

## Key features

* 直接引入插件，在html结构里加入相关的自定义属性data-ani`data-anie`即可自运行。
* 向后兼容jq的animate函数，js调用方式和animate函数一致。可以直接把animate替换成anie即可。

## Examples

看[DEMO](http://oxox.io/jq/anie/)更直接.

### 基本使用方法1

使用`data-ani`属性即可，属性值是最终展示效果。
```html
<div class="box" data-ani="width:40%">我是动画我怕谁</div>
```

### 单个元素顺序执行多个动画

使用`data-ani`属性,通过`|`符合分隔动画
```html
<div data-delay="1000" 
	 data-ani="width:32%;opacity:0|height:100px;opacity:10" 
	 data-duration="1000" 
	 data-easing="0.39, 0.575, 0.565, 1" 
	 class="box">
	<p>先变宽后变高</p>
 </div>
```

### 使用anie函数

```javascript
$(function(){
		$('#js_box4').anie({
			width:'30%'
		},1000)
	})
```

```html
<div id="js_box4" class="box">通过JS运行哦</div>
```

### 设置动画效果

* data-duration 持续时间，单位为毫秒，1000则实际为1秒
* data-delay 延时 即等待时间。可用于多个动画顺序执行。
* data-easing 缓冲效果  这里使用的是贝塞尔值

```html
<div data-delay="1000" 
	 data-ani="width:32%;opacity:0|height:100px;opacity:10" 
	 data-duration="1000" 
	 data-easing="0.39, 0.575, 0.565, 1" 
	 class="box">
	<p>先变宽后变高</p>
 </div>
```

easing动画效果：[http://easings.net/zh-cn](http://easings.net/zh-cn)

CSS3 贝塞尔曲线：[http://www.roblaplaca.com/examples/bezierBuilder/](http://www.roblaplaca.com/examples/bezierBuilder/)

### 设置触发条件

动画默认为自动运行，若需要事件触发运行，可使用data-trigger属性

data-trigger的值为触发的选择器（可以是id也可以是class）

同时需要设置trigger目标元素的data-event属性

data-event属性用于判断触发事件类型，其值为事件名（默认为click）

```html
<button id="btn" data-event="click">点击运行动画</button>
<div id="js_box3" class="box" data-ani="top:50%;width:32%" data-trigger="#btn">box3</div>
```

### 设置自定义事件触发

动画默认为自动运行，若需要事件触发运行，可使用data-trigger属性

data-trigger的值为触发的选择器（可以是id也可以是class）

同时需要设置trigger目标元素的data-event属性 

data-event属性用于判断触发事件类型，其值为事件名（默认为click）

```javascript
$(function(){
		//动画执行后触发
		$('#ango').animate({ width: '+=100px' }, function () {
			$(this).trigger('anie');
		})
	})
```

```html
<div id="ango" data-event="anie" class="box2">运行动画后触发</div>
<div id="js_box3" 
	 data-ani="top:50%;width:32%" 
	 data-trigger="#ango"
	 class="box" >box3</div>
```


## Changelog
* v0.1 项目创建

## Other
[My Blog](http://www.ghugo.com)