/* Line Subdivide Demo */

LineSubdivideDemo=function(context,width,height,finished_callback){
    this.ctx=context;
    this.width=width;
    this.height=height;
    this.segs=[];
    this.pause=0;
    this.tickTime=100;
    this.finished=finished_callback;
}

LineSubdivideDemo.prototype.tick = function(){
    //ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
    if(this.segs.length > 0 && this.segs.length<this.width){
        var new_segs=[this.segs[0]];
        for(var i=1;i<this.segs.length;i++){
            var p1=this.segs[i-1];
            var p2=this.segs[i];
            var mp={x:(p2.x-p1.x)/2.0,y:(p2.y-p1.y)/2.0};
            var l=Math.sqrt(mp.x*mp.x+mp.y*mp.y);
            mp.x+=l/2-Math.random()*l+p1.x;
            mp.y+=l/2-Math.random()*l+p1.y;
            new_segs.push(mp);
            new_segs.push(p2);
        }  
        this.segs=new_segs;
    }else{
        this.pause+=1;
        if(this.pause>50){
            if(this.finished){
                this.finished();
            }
        }
    }

    this.ctx.strokeStyle="rgba(255,255,255,0.2)";
    this.ctx.beginPath();
    this.ctx.moveTo(this.segs[0].x,this.segs[0].y);
    for(var i=1;i<this.segs.length;i++){
        this.ctx.lineTo(this.segs[i].x,this.segs[i].y);
    }
    this.ctx.stroke();
}

LineSubdivideDemo.prototype.reset = function(width,height){
    this.width=width;
    this.height=height;
    this.segs=[{x:0,y:height/2},{x:width,y:height/2}];
    this.ctx.clearRect(0,0,width,height);
    this.pause=0;
}

demos.push(LineSubdivideDemo);
