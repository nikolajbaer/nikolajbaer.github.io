/* Demo Base */

Bubbles=function(context,width,height,finished_callback){
    // Wise to hang onto these
    this.ctx=context;
    this.width=width;
    this.height=height;
    this.finished=finished_callback;

    // Requires tickTime
    this.tickTime=100;

    // Additional Initialization
    this.bubbles=[{x:0,y:0,size:1,life:0,children:0}]; 
    // NOTE: do not use this.finished, as this will be an assigned callback
}

Bubbles.prototype.tick = function(){
    // do your drawing here
    // call finished when your demo is done
    // this.finished();
    
    // for each bubble, add a new bubble if it has no children, and increase its size and life
    var new_bubbles=[];
    for(var i=0;i<this.bubbles.length;i++){
        var b=this.bubbles[i];
        b.life++;
        if(b.life >= 100){ 
            b.life = 100;  // halt growth at 100
        }else{
            b.size++; // CONSIDER do i need to have size if i have life, or should they be detached?
        }

        //draw bubble 1
        this.drawBubble(b);

        if(b.children > 1){ continue; } // add only one child
        var nb = {x: b.x + (1-Math.random()*b.size),y:b.y + Math.random()*b.size,life:0,size:1,children:0};
        new_bubbles.push(nb);

        // draw bubble 2
        this.drawBubble(nb);
    }
    this.bubbles = this.bubbles.concat(new_bubbles); 
}

Bubbles.prototype.drawBubble = function(b){
        this.ctx.fillStyle = "rgba(255,255,255,"+(b.life/100)+")";
        this.ctx.beginPath();
        this.ctx.arc(b.x+this.width/2,b.y+this.height,b.size,0,Math.PI*2,true);
        this.ctx.closePath();
        this.ctx.fill();
}

Bubbles.prototype.reset = function(width,height){
    this.width=width;
    this.height=height;
    this.ctx.clearRect(0,0,width,height);
}

// uncomment to add demo to list
demos.push(Bubbles);
