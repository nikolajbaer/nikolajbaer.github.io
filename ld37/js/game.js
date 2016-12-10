

Crafty.c("Wall",{
    required: "2D, WebGL, Color, Solid",
    init: function(){
        this.color("green");
    },
    events: {
        "EnterFrame": function(){
            //this.x += (0.5-Math.random()) * 2;
            //this.y += (0.5-Math.random()) * 2;
        }
    }
});

Crafty.c("Brick",{
    required: "2D, WebGL, Color, Solid, Collision",
    init: function(){
        this.color("#00EE00").hit("Wall");
        this.axis = "x";
        this.speed = 1;
    },
    events: {
        "EnterFrame": function(){
            this[this.axis] += this.speed; 
            if(this.hit("Wall")){
                this.speed *= -1;
            }
        }
    }
});

function make_room(x,y,w,h,wall){
    var room = {w:w-20,h:h-20,wall:10};

    Crafty.e('Wall, North')
        .attr({x:x, y:y, w:room.w,h:room.wall,color:"green"}); // N
    Crafty.e('Wall, East')
        .attr({x:x+room.w-room.wall,y:y+room.wall,w:room.wall,h:room.h-room.wall*2,color:"green"}); // E
    Crafty.e('Wall, South')
        .attr({x:x,y:y+room.h-room.wall,w:room.w,h:room.wall,color:"green"}); // S
    Crafty.e('Wall, West')
        .attr({x:x,y:y+room.wall,w:room.wall,h:room.h-room.wall*2,color:"green"}); // W
}

function run(){
    var w = 800 ;
    var h = 600;

    Crafty.init(w,h, document.getElementById('game'));

    Crafty.e('2D, WebGL, Color, Fourway, Collision,Particles')
        .attr({x: 15, y: h/2-15, w:50, h: 50})
        .color('#FF0000')
        .fourway(200)
        .bind('Moved', function(evt){
            if(this.hit("Solid")){
                this[evt.axis] = evt.oldValue;
            }
         })
        //.particles({maxParticles:150,size:3,sizeRandom:3,speed:2,speedRandom:1.2,lifeSpan:30,angle:30});

    make_room(0,0,w,h,10);
    for(var i=0;i<5; i++){
        Crafty.e("Brick")
            .attr({x:100+(i*100),y:60, h:200, w:20, speed:i+1, axis:"y"});
    }
}

run();
