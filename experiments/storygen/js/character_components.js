// Requires world_components.js

// NPC 
// TODO integrate Needs graph to character, and behaviour
// 
Crafty.c('NPC', {
    init: function() {
        this.requires('Actor, Color')
            .color('red')
            .attr({lastChat:0,inventory:[]});
    },

    // TODO move to behaviour?
    ready_to_interact: function(){
        var t = new Date().getTime();
        if(t-this.lastChat > 5000){
            this.lastChat = t;
            return true;
        }
        return false;
    },

    interact: function(player) {
        if(!this.ready_to_interact()){ return; }
        Game.msg("Hello "+player.name,this.name);
    },

    // Inventory
    // Todo centralize under Character?
    add_to_inventory: function(item) {
        this.inventory.push(item); 
    },

    // Assume inventory items have a .name, that corresponds
    has_item: function(item_name) {
        for(var i in this.inventory){
            if(i.name == item_name){ return true; }
        }
        return false;
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


