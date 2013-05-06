# anie


jquery anie 是一个jq动画插件，支持css3动画及JQ动画。自动判断浏览器是否支持css3 transition动画，如果支持则使用CSS3动画，否则 则使用JS动画。

## Key features

* 直接引入插件，在html结构里加入相关的自定义属性(data-anie)即可自运行。
* 向后兼容jq的animate函数，js调用方式和animate函数一致。可以直接把animate替换成anie即可。

## Examples

看[DEMO](http://oxox.io/jq/anie/)更直接.

### example

```html
<!--
	1、动画优先级：默认 < 标签 < JS代码 
	2、回调函数
	data-ani 动画样式 （obj 多个css属性）
	data-duration 持续时间 （可选，默认1000 1秒） 
	data-delay 延时	（可选，默认0 无延时）
	data-easing 缓冲效果 （可选，默认直线匀速效果）
	data-trigger 触发条件（默认为自运行）
	自动判断浏览器css3支持  如果支持的话 就调用css3的方法，不支持就调用js的写法
 -->
<div data-delay="1000" data-trigger="#js_action" data-ani="top:50%;width:30%;background:red" data-duration="1000" data-easing="0.47, 0, 0.745, 0.715" data-loop="true" class="box" style="">box1</div>
<div id="js_box3" data-delay="1000" data-ani="top:50%;width:32%;background:green" data-duration="1000" data-easing="0.39, 0.575, 0.565, 1" class="box" style="top:0;left:700px">box3</div>
```
更多使用方法后续更新

## Changelog
* v0.1 项目创建

## Other
[My Blog](http://www.ghugo.com)