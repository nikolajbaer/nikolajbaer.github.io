
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

    msg: function(text, from){
        Crafty("Message").each(function(){
            this.attr({alpha:1.0})
                .text(from+": "+text)
                .textFont({ size: '20px', weight: 'bold' })
                .textColor("#FFFFFF",0.8)
                .tween({alpha:0.0},4000)
        });
    },

    gen_npc: function(name,x,y){
        Crafty.e("NPC")
            .attr({name:name})
            .place(x,y);

        // TODO generate needs
    },

    gen_item: function(name,color,x,y){
        Crafty.e("Item")
            .attr({name:name})
            .color(color)
            .place(x,y);
    },

    init: function(game_id){
        Crafty.init(Game.width(), Game.height(),game_id);
        Crafty.background('black');
        this.gen_map();
    
        Crafty.e("PlayerCharacter").attr({name:"Hodor"}).place(2,2);
        this.gen_npc("Kalis",this.viewport.world.w - 3, this.viewport.world.h - 3);
        this.gen_item("Blue Key","blue",10,2);

        Crafty.e("2D, DOM, Text, Tween, Delay, Message")
            .attr({ x:this.width()/2 - 100,
                    y:this.height()/2 - 50,
                    w:200,
                    h:100,
                    alpha: 0.0
            })

    }

    
};



