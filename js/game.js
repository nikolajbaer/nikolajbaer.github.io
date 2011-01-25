/* Demo Base */
/* util */

// the angle from v1 to v2, provided center at 0,0
function angleTo(v1,v2){
    var a1 = Math.atan(v1.y/v1.x);
    var a2 = Math.atan(v2.y/v2.x);
    return (a2-a1);
}

function distanceBetween(p1,p2){
    return Math.sqrt(Math.pow(p2.x-p1.x,2) + Math.pow(p2.y-p1.y,2));
}

/* game class */

Game=function(context,width,height,finished_callback){
    // Wise to hang onto these
    this.ctx=context;
    this.width=width;
    this.height=height;
    this.finished=finished_callback;
    this.mx=0;
    this.my=0;
    this.mdown = false;

    this.fired = 0;
    this.hits = 0;

    // Requires tickTime
    this.tickTime=50;

    // Additional Initialization
    this.gun={x:0,y:0,r:0.0,ammo:100,ax:0,ay:0,charge:0};
    this.projectiles=[ ];
    this.targets = [];
    this.dirtyrects=[];
    // NOTE: do not use this.finished, as this will be an assigned callback
}

Game.prototype.spawnTarget = function(){
    var t = {x:-1*(this.width/2),y:(Math.random()*(this.height/2-30)), r:Math.random()*15+10,strength:20};
    if(Math.random()>0.5){ t.y*=-1; } // randomly place above or below
    t.dx=Math.random()*5+2;
    t.dy = 0;
    return t; 
}

Game.prototype.aim = function(){

    this.gun.r = angleTo({x:this.my-this.height/2,y:this.mx-this.width/2},{x:1,y:0});
    // TODO not sure i have to do this.. *@#$@trig 
    if(this.my <  this.height/2){
        this.gun.r -= Math.PI; 
    }

    // get aiming vector
    this.gun.ax = this.mx - this.width/2.0;
    this.gun.ay = this.my - this.height/2.0
    var l = Math.sqrt(Math.pow(this.gun.ax,2) + Math.pow(this.gun.ay,2));
    this.gun.ax = this.gun.ax/l;
    this.gun.ay = this.gun.ay/l;
}


Game.prototype.tick = function(){
    // aim gun
    this.aim();

    // charge gun
    this.gun.charge++;
    if(this.gun.charge > 3){ this.gun.charge = 3; }

    this.dirtyrects.push([-20,-20,40,40]);
   
    // update projectiles 
    for(var i=0;i<this.projectiles.length;i++){
        var p = this.projectiles[i];
        this.dirtyrects.push([p.x-p.r,p.y-p.r,p.r*2,p.r*2]);
        p.x += p.dx;
        p.y += p.dy;
        p.life++;
        // Check bounds first
        if(Math.abs(p.x)-p.r > this.width/2 || Math.abs(p.y)-p.r > this.height/2){
            // OR if it hits something?
            // eliminate projectile
            this.projectiles.splice(i,1);
        }

        // check collissions
        for(var j=0;j<this.targets.length;j++){
            if(this.targets[j].strength <= 0){ continue; }
            var d = distanceBetween(p,this.targets[j])
            if(d < p.r+this.targets[j].r){
                console.log("Hit!");
                this.hits++;
                this.targets[j].strength--;
                this.projectiles.splice(i,1);
            }
        }
    }

    // TODO score based upon size/speed/distance from gun

    // update targets
    if(this.targets.length == 0){
        this.targets.push(this.spawnTarget());
    }
    // TODO
    for(var i=0;i<this.targets.length; i++){
       var t = this.targets[i];
        this.dirtyrects.push([t.x-t.r,t.y-t.r,t.r*2,t.r*2]); 
        t.x += t.dx;
        t.y += t.dy; 
        if(Math.abs(t.x)-t.r > this.width/2 || Math.abs(t.y)-t.r > this.height/2){
            this.targets.splice(i,1);
        }
      
    }
    
    // fire if down
    if(this.mdown && this.gun.charge >= 3){
        this.projectiles.push( {x:this.gun.ax*10,y:this.gun.ay*10, life:0,damage:10,dx:this.gun.ax*7,dy:this.gun.ay*7,r:3} );
        this.gun.charge -= 5;  // deduct power 
        this.fired++;
    }

    this.draw(); 
    // this.finished();
    $("#hitrate").html("Hit Rate: "+this.getHitRate());
}

Game.prototype.getHitRate = function(){
    if(this.fired > 0){
        return (this.hits/this.fired).toFixed(2);
    }
    return "n/a";
}

Game.prototype.onmousemove = function(e){
    this.mx = e.clientX;
    this.my = e.clientY;
}

Game.prototype.onmousedown = function(e){
    this.mdown = true;
}

Game.prototype.onmouseup = function(e){
    this.mdown = false;
}

Game.prototype.draw = function(){
    
    // draw from center
    this.ctx.save();
    this.ctx.translate(this.width/2,this.height/2); 
 
    // clear dirty rectangles
    while(this.dirtyrects.length){ 
        var r=this.dirtyrects.pop();
        this.ctx.clearRect(r[0],r[1],r[2],r[3]);
    }
   
    // draw all projectiles
    this.drawProjectiles();
    this.drawTargets();
    // draw gun
    this.drawGun();

    this.ctx.restore();
}

Game.prototype.drawGun = function(){
        this.ctx.save();
        this.ctx.rotate(this.gun.r);
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "white";
        this.ctx.beginPath();
        this.ctx.arc(0,0,10,0,Math.PI*2,true);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.moveTo(4,0);
        this.ctx.lineTo(4,18);
        this.ctx.lineTo(-4,18);
        this.ctx.lineTo(-4,0);
        this.ctx.lineTo(5,0);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
}

Game.prototype.drawProjectiles = function(){
    this.ctx.strokeStyle = "rgba(0,0,0,0)";
    for(var i=0;i<this.projectiles.length;i++){
        var p = this.projectiles[i];
        this.ctx.save();
        this.ctx.translate(p.x,p.y);
        this.ctx.fillStyle = p.life%4<2?"#ff00ff":"#00ff00";
        this.ctx.beginPath();
        this.ctx.arc(0,0,p.r-1,0,Math.PI*2,true); // circle
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }
}

Game.prototype.drawTargets = function(){
    this.ctx.strokeStyle = "rgba(255,255,255,1.0)";
    for(var i=0;i<this.targets.length;i++){
        var t = this.targets[i];
        this.ctx.fillStyle = "rgba(100,100,100,"+(t.strength/5)+")";
        this.ctx.save();
        this.ctx.translate(t.x,t.y);
        this.ctx.beginPath();
        this.ctx.arc(0,0,t.r-2,0,Math.PI*2,true); // circle
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
    }
}


Game.prototype.reset = function(width,height){
    this.width=width;
    this.height=height;
    this.ctx.clearRect(0,0,width,height);
}

// uncomment to add demo to list
demos.push(Game);
