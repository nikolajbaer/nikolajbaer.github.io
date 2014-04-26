

Crafty.c('Player', {
    init: function() {
        this.requires('2D, Canvas, Actor, Fourway, Color, Gravity, Collision')
            .fourway(4)
            .color('rgb(200,200,200)')
            .gravity('Floor');
    }
});

Crafty.c('NPC',{
    init: function() {
        this.speed = 2;
        this.requires('2D, Canvas, Actor, Color, Gravity, Collision')
            .color('rgb(200,100,50)')
            .gravity('Floor')
        .bind("EnterFrame",function(d){
            this.act();
        })
        .onHit("Player",function(d){
                this.destroy();
            },
            function(d){
            }
        )
    }
});

Crafty.c('SurfaceDweller', {
    init: function() {
        this.speed = 2;
        this.requires('NPC')
    }
    ,
    act: function() {
            var p = Crafty("Player");  
            var ds = this.speed;
            if(p.y <= this.y){
                this.x += ((p.x-this.x)<0?-1:1) * ds;
            }else{
                this.x += Math.random() > 0.5 ? -ds/4 : ds/4;
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
    var f0 = Crafty.viewport.height/2 - 10;
    var f1 = Crafty.viewport.height-20;


    // Create entities
    Crafty.e('Player').attr({x:10,y:10,w:25,h:25});
    Crafty.e('Floor, 2D, Canvas, Color')
        .attr({x:0,y:f0,w:Crafty.viewport.width,h:20})
        .color('green');
    Crafty.e('Floor, 2D, Canvas, Color')
        .attr({x:0,y:f1,w:Crafty.viewport.width,h:20})
        .color('brown');

    // Add NPCs 
    for(var i=0;i<10;i++){
        Crafty.e('SurfaceDweller')
            .attr({x:Math.random()*(w-20)+10,y:f0-10,w:10,h:10});
    }

  }
}
