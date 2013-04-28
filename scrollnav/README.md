# scrollnav


scrollnav 是一个用于视差滚动 或 滑动导航的 jq插件

## Key features

* 直接引入插件，在html结构里加入相关的自定义属性(data-snav)即可自运行。
* 可设置滚动效果、速度、灵敏度等。

## Examples

看[DEMO](http://oxox.io)更直接.

### Basic example

```html
<!-- 加上自定义属性 data-snav即可运行，其值是滚动屏数的类名 -->
<div data-snav=".act_page" data-offset="center" class="act_scroll_nav ju_scroll">
	<a class="selected" href="javascript:;"><span>唤醒健康</span><b></b></a>
	<a href="javascript:;"><span>睡眠篇</span><b></b></a>
	<a href="javascript:;"><span>运动篇</span><b></b></a>
	<a href="javascript:;"><span>工作篇</span><b></b></a>
</div>
```

## Changelog
* v0.1 项目创建

## Other
[My Blog](http://www.ghugo.com)