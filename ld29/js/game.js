

Crafty.c('PlayerCharacter', {
    init: function() {
        this.requires('2D, Canvas, Actor, Fourway, Color, Gravity')
            .fourway(4)
            .color('rgb(200,200,200)')
            .gravity('Floor');
    }
});

Game = {
  // Initialize and start our game
  start: function() {
    // Start crafty and set a background color so that we can see it's working
    Crafty.init(this.width,this.height - 10);
    Crafty.background('black');

    // Create entities
    Crafty.e('PlayerCharacter').attr({x:10,y:10,w:25,h:25});
    Crafty.e('Floor, 2D, Canvas, Color')
        .attr({x:0,y:Crafty.viewport.height/2 - 10,w:Crafty.viewport.width,h:20})
        .color('green');
    Crafty.e('Floor, 2D, Canvas, Color')
        .attr({x:0,y:Crafty.viewport.height - 20,w:Crafty.viewport.width,h:20})
        .color('brown');

    // Add Dirt
    //for(var i=0;i<

    console.log("game started");
  }
}
