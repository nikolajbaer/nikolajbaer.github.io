/* Demo Base */
/* util */

// Game constants
var bspd = 5; // 15 bullet speed
var br = 3; // bullet radius 

var G = 1.0;
var max_grav_debug = 0;
var TIMESTEP = 0.05;
// TODO Tune gravity

// the angle from v1 to v2, provided center at 0,0
function angleTo(v1,v2){
    var a1 = Math.atan(v1.y/v1.x);
    var a2 = Math.atan(v2.y/v2.x);
    return (a2-a1);
}

function distanceBetween(p1,p2){
    return Math.sqrt(Math.pow(p2.x-p1.x,2) + Math.pow(p2.y-p1.y,2));
}

// TODO should i really be using gravity?
function gravityVector(b1,b2){
    var d = distanceBetween(b1,b2);
    var f = G * ((b1.m*b2.m)/d);
    f = f * TIMESTEP;
    var mag = f/b2.m; // we are moving b2
    var gv = unitize({x:b2.x-b1.x,y:b2.y-b1.y}); // TODO is this the right way?
    return {x:gv.x*mag,y:gv.y*mag}; 
}

function length(v){
    return Math.sqrt(v.x*v.x + v.y*v.y);
}

function unitize(v){
    var d = length(v);
    if( d == 0){
        return {x:0,y:1};
    }
    return {x:v.x/d,y:v.y/d};
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
    this.level = 2; // raise to make balls go faster
    this.score = 0;
    this.life = 10;
    this.maxd = 0.0; // gravity field tracking

    // Requires tickTime
    this.tickTime=1000*TIMESTEP;

    // Additional Initialization
    this.gun={x:0,y:0,r:0.0,ammo:100,ax:0,ay:0,charge:0};
    this.projectiles=[ ];
    this.targets = [];
    this.dirtyrects=[];
    // NOTE: do not use this.finished, as this will be an assigned callback
    $("#msg").animate({opacity:0.0,time:1000});
}

Game.prototype.spawnTarget = function(){
    var t = {   x:-1*(this.width/2),
                y:(Math.random()*(this.height/2-30)), 
                r:Math.random()*5+20,
                strength:10+this.level,
                m:Math.random()*150+100
            };
    if(Math.random()>0.5){ t.y*=-1; } // randomly place above or below
    t.dx=Math.random()*2+this.level;
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

Game.prototype.destroyTarget = function(i){
    // chop out the target
    var t = this.targets[i];
    this.targets.splice(i,1);
    // one last screen clean
    this.dirtyrects.push([t.x-t.r,t.y-t.r,t.r*2,t.r*2]); 
    var spd=20;
    var r=3;
    this.projectiles.push( {x:t.x,y:t.y,life:0,damage:1,dx:spd,dy:0,r:r,m:0.1});
    this.projectiles.push( {x:t.x,y:t.y,life:0,damage:1,dx:spd,dy:spd,r:r,m:0.1});
    this.projectiles.push( {x:t.x,y:t.y,life:0,damage:1,dx:0,dy:spd,r:r,m:0.1});
    this.projectiles.push( {x:t.x,y:t.y,life:0,damage:1,dx:-spd,dy:spd,r:r,m:0.1});
    this.projectiles.push( {x:t.x,y:t.y,life:0,damage:1,dx:-spd,dy:0,r:r,m:0.1});
    this.projectiles.push( {x:t.x,y:t.y,life:0,damage:1,dx:-spd,dy:-spd,r:r,m:0.1});
    this.projectiles.push( {x:t.x,y:t.y,life:0,damage:1,dx:0,dy:-spd,r:r,m:0.1});
    this.projectiles.push( {x:t.x,y:t.y,life:0,damage:1,dx:spd,dy:-spd,r:r,m:0.1});
    // and add new target
    this.targets.push(this.spawnTarget());
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
        //this.dirtyrects.push([p.x-p.r,p.y-p.r,p.r,p.r]);

        // acceleration from mass
        var g={x:p.dx,y:p.dy};
        if(max_grav_debug<10){
            for(var j=0;j<this.targets.length;j++){
                var gv = gravityVector(this.targets[j],p);
                //console.log("applying "+gv.x+","+gv.y);
                g.x+=gv.x;
                g.y+=gv.y;
            }
            max_grav_debug++;
        }
        p.x += g.x * 2;
        p.y += g.y * 2;
        p.life++;
        // Check bounds first
        if(Math.abs(p.x)-p.r > this.width/2 || Math.abs(p.y)-p.r > this.height/2){
            // OR if it hits something?
            // eliminate projectile
            this.projectiles.splice(i,1);
        }

        // check collisions
        for(var j=0;j<this.targets.length;j++){
            if(this.targets[j].strength <= 0){ continue; }
            var d = distanceBetween(p,this.targets[j])
            if(d < p.r+this.targets[j].r){
                this.hits++;
                this.targets[j].strength--;
                this.targets[j].r--; // decrease the radius too
                this.projectiles.splice(i,1);
                if(this.targets[j].strength==0){
                    this.destroyTarget(j);
                    this.score += 1;
                    //var level = Math.ceiling(Math.sqrt(this.score/4));
                }
            }
        }
    }

    // TODO score based upon size/speed/distance from gun

    // update targets
    while(this.targets.length < this.level){
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
            this.life--;
            if(this.life == 0){
                this.finished();
            }
        }
      
    }
    
    // fire if down
    if(this.mdown && this.gun.charge >= 3){
        this.projectiles.push( {x:this.gun.ax*10,y:this.gun.ay*10, life:0,damage:10,dx:this.gun.ax*bspd,dy:this.gun.ay*bspd,r:br,m:10} );
        this.gun.charge -= 5;  // deduct power 
        this.fired++;
    }

    this.draw(); 
    // this.finished();
    $("#hitrate").html("Score: "+this.score + " Level: "+this.level+" Life: "+this.life);
}

Game.prototype.spawnParticle = function(){
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

Game.prototype.touchstart = function(e){
    this.mx = e.originalEvent.touches[0].clientX;
    this.my = e.originalEvent.touches[0].clientY;
    this.onmousedown();
}

Game.prototype.touchend = function(e){ 
    this.mdown = false;
}

Game.prototype.touchmove = function(e){
    this.mx = e.originalEvent.touches[0].clientX;
    this.my = e.originalEvent.touches[0].clientY;
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

    
    // draw gravity flow vectors
    this.drawTellTales(21);
   
    // draw all projectiles
    this.drawProjectiles();
    this.drawTargets();
    // draw gun
    this.drawGun();

    this.ctx.restore();
}

Game.prototype.drawTellTales = function(grid_size){
    this.ctx.save()
    var grid_w=grid_size;
    var grid_h=grid_size;
    var amp=10;
    this.ctx.strokeStyle="#fff";
    var w=this.width-2;
    var h=this.height-2;
    for(var i=0;i<grid_w;i++){
        for(var j=0;j<grid_h;j++){
            var gv = {x:0.0,y:0.0};
            var p = {x:(w/grid_w)*i-(w/2),y:(h/grid_h)*j-(h/2),m:100};
            var maxd=0;
            for(var k=0;k<this.targets.length; k++){
                var gvt = gravityVector(p,this.targets[k]);
                gv.x += gvt.x;
                gv.y += gvt.y;
            }
            var gvd = length(gv);
            if(gvd>this.maxd){
                this.maxd=gvd;
            }
            var gvn = unitize(gv);
            var ampv = amp*(gvd/this.maxd);
            var t = {x:gvn.x*ampv,y:gvn.y*ampv};
            this.ctx.moveTo(p.x,p.y);
            this.ctx.lineTo(t.x+p.x,t.y+p.y);
            this.dirtyrects.push([p.x-amp-1,p.y-amp-1,2*amp+1,2*amp+1]);
        } 
    }
    this.ctx.stroke();
    this.ctx.restore();
}

Game.prototype.drawGun = function(){
        this.ctx.save();
        this.ctx.rotate(this.gun.r);
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "none";
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
