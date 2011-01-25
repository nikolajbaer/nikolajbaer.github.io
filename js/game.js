/* Demo Base */


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

    // Requires tickTime
    this.tickTime=50;

    // Additional Initialization
    this.gun={x:0,y:0,r:0.0,ammo:100,ax:0,ay:0,charge:0};
    this.projectiles=[ ];
    this.dirtyrects=[];
    // NOTE: do not use this.finished, as this will be an assigned callback
}

Game.prototype.aim = function(){
    // TODO make this work

    if(this.mx > this.width/2){
        this.gun.r = Math.atan((this.my-this.height/2)/(this.mx-this.width/2));
    }else{
        this.gun.r = Math.atan((this.my-this.height/2)/(this.mx-this.width/2));
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
    if(this.gun.charge > 5){ this.gun.charge = 5; }

    this.dirtyrects.push([-20,-20,40,40]);
   
    // update projectiles 
    for(var i=0;i<this.projectiles.length;i++){
        var p = this.projectiles[i];
        this.dirtyrects.push([p.x-p.r,p.y-p.r,p.r*2,p.r*2]);
        p.x += p.dx;
        p.y += p.dy;
        p.life++;
        // TODO if it collides or goes off bounds, ice it 
        if(Math.abs(p.x)-p.r > this.width/2 || Math.abs(p.y)-p.r > this.height/2){
            // OR if it hits something?
            // eliminate projectile
            this.projectiles.splice(i,1);
        }
    }

    // fire if down
    if(this.mdown && this.gun.charge >= 5){
        this.projectiles.push( {x:0,y:0, life:0,damage:10,dx:this.gun.ax*5,dy:this.gun.ay*5,r:3} );
        this.gun.charge -= 5;  // deduct power 
    }

    this.draw(); 
    // this.finished();
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

Game.prototype.reset = function(width,height){
    this.width=width;
    this.height=height;
    this.ctx.clearRect(0,0,width,height);
}

// uncomment to add demo to list
demos.push(Game);
