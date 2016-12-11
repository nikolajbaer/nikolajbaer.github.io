
Crafty.c("Bat",{
    required: "2D, WebGL, Motion, bat, SpriteAnimation",
    init: function(){
        this.reel("flapping",200,[[1,0],[2,0]])
            .attr({w:64,h:32,life:500})
            .animate("flapping",-1);
        this.vx = Math.random() * 100;
        this.vy = Math.random() * -50;
    },
    events: {
        "EnterFrame": function(){
            this.life -= 1;
            if(this.life == 0){
                this.destroy();
            }
        }
    }   
});

Crafty.c("Brick",{
    required: "2D, WebGL, Floor, Gravity, Solid, magic_box",
    init: function(){
        this.life = 100;
    },
    events: {
        "EnterFrame": function(){
            this.life -= 1;
            if(this.life == 0){
                this.destroy();
            }
        }
    }   
});

Crafty.c("Floor",{
    required: "2D, WebGL, Color"
});

Crafty.c("Wall",{
    required: "2D, WebGL, Color, Solid"
});


function run(){
    var player = Crafty.e('2D, WebGL, magicka, Twoway, Collision, Particles, Gravity, Player, Mouse, SpriteAnimation')
        .attr({x: 15, y: h/2-15, z:1000, w:64, h: 128, boost:0, antigrav_timer: 0})
        .twoway(200)
        .gravity("Floor")
        .reel("walking",500, [ [1,0],[2,0] ] )
        .reel("cast",1000, [[3,0],[3,0],[1,0] ] )
        .reel("standing",1000, [[1,0]] )
        .bind("EnterFrame",function(evt){
        })
        .bind("NewDirection", function(data){
            if(Math.abs(data.x) > 0){
                this.animate('walking',-1);
            }else{
                this.animate("standing",-1);
            }
        })
        .bind('Moved', function(evt){
            if(this.hit("Solid") && evt.axis == "x"){
                this[evt.axis] = evt.oldValue;
            }
         })
        .bind("KeyDown", function(e){
            if(e.key == Crafty.keys.SPACE ){
                this.animate("cast",1);
                Crafty.e("Bat")
                        .attr({x:this.x+50,y:this.y});
            } 
        })
        .particles({
            maxParticles:150,   
            size:5,
            sizeRandom:5,
            speed:2,
            speedRandom:1.2,
            lifeSpan:30,
            startColour:[18,96,255,1],
            endColour: [33,220,213,0],
            originOffset: {x:57,y:15}
        });

//    Crafty.e("2D, WebGL, Mouse, Background")
//        .attr({x:0,y:0,w:w,h:h})
//        .bind("Click", function(e){
//            console.log("clicked",e);
//            Crafty.e("Brick")
//                .attr({x:e.realX,y:e.realY,w:40,h:40})
//                .gravity("Floor"); 
//    });

    // Casting Room
    Crafty.e("Floor")
        .attr({x:0,y:h-10,w:w,h:10})
        .color("#ffffff");
    
    Crafty.e("Wall")
        .attr({x:0,y:0,w:10,h:h})
        .color("#ffffff");
    Crafty.e("Wall")
        .attr({x:w-10,y:0,w:10,h:h})
        .color("#ffffff");

    Crafty.e("2D, WebGL, WindowL, window_x")
        .attr({x:200,y:200,w:128,h:128}); 
    Crafty.e("2D, WebGL, WindowR, window_x")
        .attr({x:600-128,y:200,w:128,h:128}); 

}

var w = 800 ;
var h = 600;

Crafty.init(w,h, document.getElementById('game'));
Crafty.background('#000 url(images/floor_stones1.png) repeat');
Crafty.load(assetsObj, run)

