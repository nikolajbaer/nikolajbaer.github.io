var particles=[
        {x:0,y:0,dx:10,dy:10,r:10,el:null,c:"#0f0",id:1}
        //{x:100,y:100,dx:10,dy:10,r:10,el:null,c:"#f0f",id:2}
    ];
var mpos = {x:0,y:0};
var tickVal = null;

// vector functions
function angleTo(v1,v2){
    var a1 = Math.atan(v1.y/v1.x);
    var a2 = Math.atan(v2.y/v2.x);
    return (a2-a1);
}

function distanceBetween(p1,p2){
    return Math.sqrt(Math.pow(p2.x-p1.x,2) + Math.pow(p2.y-p1.y,2));
}

function length(v){
    return Math.sqrt(v.x*v.x+v.y*v.y);
}

function normalize(v){
    var d = length(v);
    if( d==0){ return {x:0,y:0} };
    return {x:v.x/d,y:v.y/d};
}

function vsub(v1,v2){
    return {x:v2.x-v1.x,y:v2.y-v1.y};
}

// system functions
// TODO make this class based for particles?

function create_particle(p){
    var style="border-radius: "+p.r+"px; width: "+(p.r*2)+"px; height: "+(p.r*2)+"px; background-color: "+p.c+";";
    $("body").append('<div class="particle" style="'+style+'" id="particle_'+p.id+'"></div>');
    p.el = $("#particle_"+p.id);
    if(true){ //p.id%2==0){
        p.el.addClass("particle_trans");
    }
}

function update_particle(p){
    // todo make fast?
    var d = normalize(vsub(p,mpos));
    p.x += p.dx*d.x;
    p.y += p.dy*d.y;
    $("#particle_"+p.id).css({"-webkit-transform":"translate("+p.x+","+p.y+")"});
}

function tick(){
    for(var i=0;i<particles.length;i++){
        update_particle(particles[i]);
    }
}

function stop(){
    clearInterval(tickVal);
}

function bodyMouseMove(e){
    mpos.x = e.clientX;
    mpos.y = e.clientY;
}

$(document).ready(function(){
    // TODO add tick
    tickVal = setInterval(tick,250);
    create_particle(particles[0]);
    //create_particle(particles[1]);

    $("body").mousemove(bodyMouseMove);
    $("body").click(stop);
});


