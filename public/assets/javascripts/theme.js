 // This is Function for accordion Box show and hide
 "use strict";
    
	   /*--------------------------
       Accordion
    ----------------------------*/
	   
	   var acc = document.getElementsByClassName("accordion");
            var i;
            
            for (i = 0; i < acc.length; i++) {
              acc[i].addEventListener("click", function() {
                this.classList.toggle("active");
                var panel = this.nextElementSibling;
                if (panel.style.maxHeight){
                  panel.style.maxHeight = null;
                } else {
                  panel.style.maxHeight = panel.scrollHeight + "px";
                } 
              });
            }
			
	
	/*--------------------------
       owl-carousel
    ----------------------------*/
	   $(document).ready(function() {
                var owl = $('.owl-carousel');
                owl.owlCarousel({
                    margin: 10,
                    nav: true,
                    loop: true,
                    responsive: {
                        0: {
                            items: 1
            
                        },
                        600: {
                            items: 3
                        },
                        1000: {
                            items: 5
                        }
                    }
                })
            $( ".owl-prev").html('<i class="fa fa-chevron-left"></i>');
            $( ".owl-next").html('<i class="fa fa-chevron-right"></i>');
            })
            $('.loop').owlCarousel({
                center: true,
                items: 2,
                loop: true,
                margin: 10,
                responsive: {
                    600: {
                        items: 4
                    }
                }
            
            });
	   /*--------------------------
        PRE LOADER
       ----------------------------*/
	  jQuery(window).load(function(){
    jQuery('#overlay').fadeOut();
    });
	  
	