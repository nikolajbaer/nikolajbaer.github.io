

Crafty.c('Player', {
    init: function() {
        this._carrying = null;
        this.requires('2D, Canvas, Actor, Fourway, Color, Gravity, Collision')
            .fourway(4)
            .color('rgb(200,200,200)')
            .gravity('Floor')
        .bind("EnterFrame", function(d){
            if(this._carrying){
                this._carrying.y = this.y;
                this._carrying.x = this.x;
            }
        });
    }
    ,
    carry: function(e){
        if(this._carrying != null){ return false; }
        this._carrying = e;
    }
});

Crafty.c('Carryable', {
    init: function() {
        this.requires('2D, Canvas, Actor, Collision, Color')
        .onHit("Player",function(h){
            h[0].obj.carry(this);
        });
    }
});

Crafty.c('Wall', {
    init: function() {
        this.requires('2D, Collision');
    }
});

Crafty.c('Chaser',{
    init: function() {
        this.speed = 2;
        this.requires('2D, Canvas, Actor, Color, Gravity, Collision')
            .color('rgb(200,100,50)')
            .gravity('Floor')
        .onHit("Player",function(d){
                this.destroy();
            },
            function(d){
            }
        )
    }
});

Crafty.c('Jumper', {
    init: function() {
        this._jumpspeed = 2;
        this._jumpboost = 50;
        this._boost = 0;
        this._boostrandom = 0.2;

        this.requires('Actor, Gravity')
        .bind("EnterFrame", function(d){
            if(this._boost > this._jumpspeed){
                this.y -= this._jumpspeed;
                this._boost -= this._jumpspeed; 
            }else if(this._boost > 0){
                this.y -= this._boost;
                this._boost = 0;
            }
        }) 
    }
    ,
    jump: function() {
        this._boost += this._jumpboost;
        if(this._boostrandom != 0){
            this._boost -= this._boost * (Math.random() * this._boostrandom);
        }
    }
});

Crafty.c('SurfaceDweller', {
    init: function() {
        // Home in on the player
        this._target = Crafty("Player");  
        this._surface = Crafty("TheSurface");
        this._speed = 2;
        this._dir = 0;

        this.requires('Chaser, Jumper')
        .bind("EnterFrame",function(d){
            this.x += this._dir * this._speed;
            if(this._boost == 0){ 
                if(Math.random() > 0.75){
                    // adjust direction
                    this.adjust_direction();
                    // and jump
                    this.jump();
                }
            }
        })
    }
    ,
    adjust_direction: function(){
        if(this._target.y <= this.y){
            this._dir = ((this._target.x-this.x)<0?-1:1);
        }else{
            this._dir = Math.random() > 0.5 ? -1 : 1;
        }   
    }
});

Game = {
  // Initialize and start our game
  start: function() {
    // Start crafty and set a background color so that we can see it's working
    Crafty.init(this.width,this.height - 10);
    Crafty.background('black');

    var w = Crafty.viewport.width;
    var h = Crafty.viewport.height;
    var f0 = Crafty.viewport.height/2 - 10;
    var f1 = Crafty.viewport.height-20;


    // Create entities
    Crafty.e('Player')
        .attr({x:10,y:10,w:25,h:25});

    // Floors
    Crafty.e('Floor, 2D, Canvas, Color, TheSurface')
        .attr({x:0,y:f0,w:Crafty.viewport.width,h:20})
        .color('green');
    Crafty.e('Floor, 2D, Canvas, Color')
        .attr({x:0,y:f1,w:Crafty.viewport.width,h:20})
        .color('brown');
    // Walls
    Crafty.e('Wall')  
        .attr({x:-10,y:0,w:10,h:h});
    Crafty.e('Wall')  
        .attr({x:w,y:0,w:10,h:h});

    // Add NPCs 
    for(var i=0;i<10;i++){
        Crafty.e('SurfaceDweller')
            .attr({x:Math.random()*(w-20)+10,y:f0-10,w:10,h:10});
    }

    Crafty.e('Carryable')
        .attr({x:w - 20,y:f0-20,w:15,h:15})
        .color('red');
  }
}


