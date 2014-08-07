/* Requires Crafty and ai.js */

// World Components
Crafty.c("Tile",{
    init: function() {
        this.attr({
            w:Game.viewport.tile.w,
            h:Game.viewport.tile.h
        })
    },
    
    place: function(gx,gy) {
        this.attr({
            x:Game.viewport.tile.w*gx,
            y:Game.viewport.tile.h*gy
        });
    }
});

Crafty.c('Actor', {
    init: function() {
        this.requires('2D, Canvas, Tile');
    }
});

Crafty.c('Grass',{
    init: function() {
        this.requires('Actor, Color'); 
        this.color('green');
    }
});

Crafty.c('Tree', {
    init: function() {
        this.requires('Actor, Color, Solid');
        this.color('brown');
    }
});

Crafty.c('Edge', {
    init: function() {
        this.requires('Actor, Color, Solid');
        this.color('grey');
    }
});

Crafty.c('PlayerCharacter', {
    init: function() {
        this.requires('Actor, Fourway, Color, Collision')
            .fourway(4)
            .color('yellow')
            .stopOnSolids()
            .interactWithNPCs();
    },

    interactWithNPCs: function() {
        this.onHit('NPC', function(hits){
            console.log("hit");
            this.stopMovement();
            for(var i=0;i<hits.length; i++){
                hits[i].obj.interact(this);
            } 
        });
    },

    stopOnSolids: function() {
        this.onHit('Solid', this.stopMovement);
        return this;
    },
    
    // Stops the movement
    stopMovement: function() {
        this._speed = 0;
        if (this._movement) {
            this.x -= this._movement.x;
            this.y -= this._movement.y;
        }
    }
});

Crafty.c('NPC', {
    init: function() {
        this.requires('Actor, Color, Solid')
            .color('red');
    },

    interact: function(player) {
        console.log("I am interacting with "+player.name);
    }

});

// Game object
Game = {

    viewport: {
        tile: {w:32,h:32},
        x: 0,
        y: 0,
        world: {w: 25,h: 16}
    },

    width: function(){
        return this.viewport.tile.w * this.viewport.world.w;
    },

    height: function() {
        return this.viewport.tile.h * this.viewport.world.h;
    },

    gen_map: function() {
        for(var i=0;i<this.viewport.world.w; i++){
            for(var j=0;j<this.viewport.world.h; j++){
                var ent = "Grass";
                if( i == 0 || j == 0 || 
                    i == this.viewport.world.w - 1 ||  
                    j == this.viewport.world.h - 1 ){
                    ent = "Edge"; 
                }
                Crafty.e(ent)
                    .attr({ x:i*this.viewport.tile.w,
                            y:j*this.viewport.tile.h,
                    });
            }
        }
    },

    init: function(game_id){
        Crafty.init(Game.width(), Game.height(),game_id);
        Crafty.background('black');
        this.gen_map();
    
        Crafty.e("PlayerCharacter").attr({name:"Hodor"}).place(2,2);
        Crafty.e("NPC").place(this.viewport.world.w - 3, this.viewport.world.h - 3);
    }

    
};
