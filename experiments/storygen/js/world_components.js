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


Crafty.c('Item', {
    init: function() {
        this.requires('Actor, Color');
    }
});

