/*
 * @course ISTE.340.801 - Client Programming
 * @author Vjori Hoxha
 * @reference Please check the reference link below
 * @version 27.3.2019
 */
(function ($) {
    $.fn.appendImage = function (options) {
        let attributes = $.extend({
            margin: "margin:0 0 0 210px",
            src: "assets/media/images/gears.gif",
            id: "load"
        }, options);
        return this.append('<br><img src="' + attributes.src + '" id="' + attributes.id + '" style="margin:' + attributes.margin + ';"/>');
    };
}(jQuery));

/*Reference*/
/*I have never written a plugin before, so I was using this tutorial:
 * link: https://www.ostraining.com/blog/coding/custom-jquery-plugin/*/