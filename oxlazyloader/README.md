# oxlazy


oxlazy是一个通用的jquery延迟加载插件。
oxlazy is a humble jquery plugin for resources' lazyload. 

## Key features

* img tag lazyload. 支持图片(img标签)
* background img lazyload. 支持背景图(background属性)
* iframe lazyload. 支持iframe的延迟加载

## Examples

[DEMO](http://oxox.io/jq/oxlazy/)

### Basic Usages

> img tag lazyload

```html
<!-- note the use of the data-oxlazy attribute,and the blank.png is a 1x1 px placeholder image -->
<img src="http://static.gtimg.com/icson/img/common/blank.png" data-oxlazy="your-full-image-url" alt="oxlazy rocks me!"/>
```

> background image lazyload

Notice: Don't forget the bg repeat and position settings in you css!

```html
<div data-oxlazy="your-full-image-url"></div>
```

> iframe lazyload

```html
<iframe data-oxlazy="your-full-url" src="javascript:void(0)"></iframe>
```

## Changelog
* v1.0 init
* v1.1 代码优化（合并bind的事件）；移除rock中不必要的判断

## Other
[My Blog](http://www.faso.me)
