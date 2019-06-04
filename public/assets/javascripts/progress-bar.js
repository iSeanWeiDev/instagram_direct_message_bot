(function($){
	"use strict";
	//when dom is ready start
	$(document).ready(function(){

		$('.progress-bar').each(function(){

            var width = $(this).data('percent');
            $(this).css({'transition': 'width 3s'});

            $(this).appear(function() {
                $(this).css('width', width + '%');
                $(this).find('.count').countTo({
                    from: 0,
                    to: width,
                    speed: 3000,
                    refreshInterval: 50,
                });
            });

        });

	});
	//when dom is ready end
})(jQuery);