// See idea.txt
// CONSIDER is this just a behaviour tree, or does it run in parallel to the behaviour tree?

// The Abstract Need, use prototype to build on this
// for specific need conditions
var Need = function(){
    // The list of in-order dependencies
    this.depends = [];
   
    // An optional behaviour to exhibit on successful result
    this.result_behaviour = null;

    // Why is this needed? TODO figure out how to make this 
    // help us explain a character's motivations
    this.reason = null;

    // Whether this node can immediately be resolved if all dependencies are met
    // (e.g. override to evaluate a local dependency, like $ in bank account)
    this.can_resolve = function(character){ return true; }

    // If the entire need subtree is resolved
    this.is_resolved = function(character){
        for(var d in this.depends){
            if(!d.is_resolved()){
                return false;
            }
        }
        return this.can_resolve(character);
    };

    // Called when evaluating. If the need is resolved, if we have a 
    // behaviour that results from fulfilling this need, we activate this 
    // behaviour now
    this.resolve = function(character){
        if(this.is_resolved(character)){
            if(this.result_behaviour){
                character.changeBehaviour(this.result_behaviour);
            }
        }
    };
}

// Successful if the item is in inventory
var NeedItem = function(item){
    this.item = item;
    this.can_resolve = function(character){
        return character.has_item(this.item);
    }
}
NeedItem.prototype = Need;


// Successful if any one of the needs are met
var NeedOneOfThese = function(needs){
    this.needs = needs;
    this.is_resolved = function(character){
        var r = false;
        for(var n in this.needs){
            if(n.is_resolved(character)){
                return this.can_resolve(character);  
            }
            return false;
        }
    }
}
NeedOneOfThese.prototype = Need;


