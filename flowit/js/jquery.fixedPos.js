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

})(jQuery)