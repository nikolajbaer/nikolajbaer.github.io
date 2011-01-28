
$(document).bind("mobileinit",function(e){

    // And do the jquery mobile stuff here..
    $("#target").bind("tap",function(e){
        console.log("tap"); 
    });
    $(document).bind("touchmove",function(e) {
         e.preventDefault(); 
    });

});

