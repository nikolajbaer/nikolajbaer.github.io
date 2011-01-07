/* Demo Base */

DemoBase=function(context,width,height,finished_callback){
    // Wise to hang onto these
    this.ctx=context;
    this.width=width;
    this.height=height;
    this.finished=finished_callback;

    // Requires tickTime
    this.tickTime=100;

    // Additional Initialization
    // NOTE: do not use this.finished, as this will be an assigned callback
}

DemoBase.prototype.tick = function(){
    // do your drawing here
    // call finished when your demo is done
    // this.finished();
}

DemoBase.prototype.reset = function(width,height){
    this.width=width;
    this.height=height;
    this.ctx.clearRect(0,0,width,height);
}

// uncomment to add demo to list
//demos.push(DemoBase);
