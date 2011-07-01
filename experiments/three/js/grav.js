/* 
   grav three.js demo
   author: Nikolaj Baer
   Copyright 2011

   many thanks to the three.js crew (http://github.com/mrdoob/three.js)

*/
var camera, scene, renderer, geometry, material, core, light, asteroid;

var path,path_material,path_geometry,velocity_line;

var sim=null;
var ctl={lastmousex:0,lastmousey:0,mousex:0,mousey:0,mx:0,my:0,mousedown:false};
var realtime_stats={};

var logcache="";

function log(txt){
    d=document.getElementById("debug");
    if(d!=null){
        d.innerHTML += logcache?logcache:"" + txt+"\n";
        logcache=null;
        d.scrollTop = d.scrollHeight - d.style.height;
    }else{
        logcache += txt+"\n";
    }
}

function updateRealtimeStats(){
    var d = document.getElementById("stats");
    if(d==null){ return; }
    var txt =""
    for(var k in realtime_stats){
        txt += k +": "+realtime_stats[k] + "\n";
    } 
    d.innerHTML = txt;
}

function handle_onmousedown(e){
    ctl.mousedown=true;
}
function handle_onmouseup(e){
    ctl.mousedown=false;
}
function handle_onmousemove(e){
    ctl.lastmousex=ctl.mousex;
    ctl.lastmousey=ctl.mousey;
    ctl.mousex=e.clientX;
    ctl.mousey=e.clientY;
    ctl.mx = e.clientX/window.innerWidth;
    ctl.my = e.clientY/window.innerHeight;

    core.rotation.y = Math.PI*ctl.mx
    if(ctl.mousedown){
        var s=1/ctl.my+0.5;
        core.scale = new THREE.Vector3(s,s,s);
    }else{
    core.rotation.x = Math.PI*ctl.my;
    }
}

function init() {

    log("initializing");

    camera = new THREE.Camera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;
    camera.position.y = 500;
    
    scene = new THREE.Scene();
    
    geometry = new THREE.SphereGeometry( 20, 20, 20 );
    foof = new THREE.MeshPhongMaterial( { color: 0xff00ff, wireframe: false } );
    ofo = new THREE.MeshPhongMaterial( { color: 0x00ff00, wireframe: false } );
    gray = new THREE.MeshPhongMaterial( { color: 0xe0e0e0, wireframe: false } );
    
    core = new THREE.Object3D();
    scene.addObject( core );


    // add some planetoids
    var planetoids=[];
    for(var i=0;i<5;i++){
        mesh = new THREE.Mesh( geometry, i%2?foof:ofo  );
        var p ={x:(0.5-Math.random())*500,
                y:(0.5-Math.random())*500,
                z:(0.5-Math.random())*500,
                m:500+Math.random()*500};
        mesh.position.x = p.x;
        mesh.position.z = p.y; 
        mesh.position.y = p.z;
        mesh.scale = new THREE.Vector3(p.m/1000,p.m/1000,p.m/1000);
        planetoids.push(p);
        core.addChild(mesh);
    }

    // TODO scale asteroid?
    mesh = new THREE.Mesh( geometry, gray  );
    asteroid = mesh;
    asteroid.scale = new THREE.Vector3(0.5,0.5,0.5);
    core.addChild(mesh);
   
    // for Path, TODO Refactor, currently uses cubes to draw. would like glpoints
    path_material = new THREE.MeshBasicMaterial( {color: 0xffe433 });
    path_geometry = new THREE.CubeGeometry( 2, 2, 2 );

    // for current gravity vector (debug tool)
    velocity_material = new THREE.LineBasicMaterial( {color: 0xffffff, opacity: 0.75, linewidth: 3 });   
    velocity_geometry = new THREE.Geometry();
    velocity_geometry.vertices.push( new THREE.Vertex( new THREE.Vector3(0,0,0)) );
    velocity_geometry.vertices.push( new THREE.Vertex( new THREE.Vector3(0,0,1)) );
    velocity_line = new THREE.Line(velocity_geometry,velocity_material);
    velocity_line.scale = new THREE.Vector3(50,50,50);
    asteroid.addChild(velocity_line);

    // Add lighting
    ambient = new THREE.AmbientLight(0xffffff);
    scene.addLight(ambient);

    light = new THREE.PointLight(0xffffff);
    light.position.y = 500;
    scene.addLight(light);
    
    // Setup Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    
    document.body.appendChild( renderer.domElement );

    // And fire up simulation
    sim = new Sim();
    for(var i=0;i<planetoids.length;i++){
        sim.addPlanet(p.x,p.y,p.z,1.0,p.m); //not doing radius yet
    }
    sim.updateAsteroidPosition(asteroid);
    sim.init();    

    window.onmousemove = handle_onmousemove; 
    window.onmouseup = handle_onmouseup; 
    window.onmousedown = handle_onmousedown; 

}

/****** render/animate loop *******/
function animate() {

    // Include examples/js/RequestAnimationFrame.js for cross-browser compatibility.
    requestAnimationFrame( animate );
    render();

    updateRealtimeStats();
}

function render() {
    
    
    //mesh.rotation.x += 0.01;
    //core.rotation.y += 0.02;
    sim.updateAsteroidPosition(asteroid);

    if(sim.is_active()){
        // Why can't i do damn lines! 
        var s = new THREE.Mesh(path_geometry,path_material);
        s.position.x = asteroid.position.clone();
        core.addChild(s);

        //adjust debug velocity vector
        //velocity_line.scale = 
    }

    renderer.render( scene, camera );
}

/** math util **/

// distance between two points in 3space
function dist(p1,p2){
    return Math.sqrt(
        Math.pow(p2.x-p1.x,2) +
        Math.pow(p2.y-p1.y,2) +
        Math.pow(p2.z-p1.z,2) );

}


/**** simulation stuff ****/

var Sim = function( ){
    ival = null;
    t = 0; 
    cfg = { tick_interval:250 };
    state = { 
            planetoids:[],
            asteroid:{position:null,velocity:null},
            pull:null
    }

    this.is_active = function(){
        return ival != null;
    }

    this.addPlanet = function(x,y,z,r,m){ 
        state.planetoids.push({position:new THREE.Vector3(x,y,z),r:r,m:m});
    };
     
    this.init = function(){
        t=0;
        if(ival){
            clearInterval(ival);
        }
        ival = setInterval(tick,cfg.tick_interval);

        log("initting asteroid");
        state.asteroid.position = new THREE.Vector3(0,0,0);
        state.asteroid.velocity = new THREE.Vector3(0,0,0);
   };

    this.stop = function(){
        if(ival){
            log("stopping at "+t);
            clearInterval(ival);
        }
    }
    
    var tick = function (){

        // TODO iterate simulation
        //light.position.y = 100-Math.cos(t/50)*200
        var ast = state.asteroid;


        var a=new THREE.Vector3(0,0,0);

        // governor
        if(t > 100){
            stop();
            return;
        }
    

        // sum up combined accelerations from planetoid gravitation in a
        for(var i=0;i<state.planetoids.length;i++){
            var p=state.planetoids[i];
            // distance between ast and p
            var d = ast.position.distanceTo(p.position);
            // force to planet
            var f = p.m/Math.pow(d,2);
            //log(p.m);
            //log(f); 
            // acceleration from ast to p
            u = p.position.clone();
            u.subSelf(ast.position)
            u.normalize();
            u.multiplySelf(new THREE.Vector3(f,f,f));
            a.addSelf(u);
        }
  
        state.pull=a; 

        // apply acceleration vector to asteroid velocity
        ast.velocity.addSelf(a);
   
        // and increment asteroid position
        ast.position.addSelf(ast.velocity);
   
        // and tick our sim
        t++;
       
        // Update our stats view 
        realtime_stats.velocity = ast.velocity.x + "," + ast.velocity.y + "," + ast.velocity.z;
        realtime_stats.position = ast.position.x + "," + ast.position.y + "," + ast.position.z;
        realtime_stats.t = t;
       
        //log("updating position to "+state.asteroid.x+","+state.asteroid.y+","+state.asteroid.z);
    
    }
    
    this.updateAsteroidPosition = function(a){
        if(state.asteroid.position != null){
            a.position.copy(state.asteroid.position.clone());
        }
    }
};

/* RUN */

init();
animate();

 
