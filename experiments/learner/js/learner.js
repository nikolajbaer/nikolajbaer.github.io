

var Learner = function(){
    this.layers = null; 
    this.output = [0.0];

}

Learner.prototype.init = function(n_inputs,n_layers){
    // TODO build net
    for(var i=0; i < n_layers.length; i++){
        var l = [];
        for(var j =0; j<n_layers[i]; j++){
            l.push( Math.random() );
        }
        this.layers.push(l);
    } 

}

Learner.prototype.sense = function( inputs ){
    // TODO process input array
    // TODO then update layers 

    return this.output;
}

Learner.prototype.learn = function( pain_array ){
    // TODO figure how this should work?
    // Reinforcement Learning
    // https://en.wikipedia.org/wiki/Reinforcement_learning
} 


