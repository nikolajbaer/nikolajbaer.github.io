var ctx=null;
var canvas=null;
var inv=null;

var demos=[];

var demo=null;
function init(){
    $("#thecanvas").attr("width",window.innerWidth);
    $("#thecanvas").attr("height",window.innerHeight);
    // set demo tick interval
    // assign callback when demo is finished
    // and reset the demo to starting point
    if(inv){ clearInterval(inv); }
    inv=setInterval(call_tick,demo.tickTime);
    demo.reset(window.innerWidth,window.innerHeight);
}

function call_tick(){
    demo.tick();
}

function finished_callback(){
    $("#thecanvas").fadeOut(500,function(){
        pick_new_demo();
        init();
        $("#thecanvas").fadeIn(500);
    });
}

function pick_new_demo(){
    var DemoClass=demos[Math.floor(Math.random()*demos.length)];
    demo=new DemoClass(ctx,canvas.width,canvas.height,finished_callback);
}

$(document).ready(function(){
    canvas = document.getElementById("thecanvas");

    $(window).bind('resize',function(){ init(); });

    ctx = canvas.getContext("2d");
    pick_new_demo();
    init();
   
});

