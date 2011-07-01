/* 
   grav three.js demo
   author: Nikolaj Baer
   Copyright 2011

   many thanks to the three.js crew (http://github.com/mrdoob/three.js)

*/
var camera, scene, renderer, geometry, material, core, light, asteroid;

var path,path_material,path_geometry;

var sim=null;

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
   
    // for Path, TODO Refactor
    path_material = new THREE.MeshBasicMaterial( {color: 0xffe433 });
    path_geometry = new THREE.CubeGeometry( 2, 2, 2 );

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
}

/****** render/animate loop *******/
function animate() {

    // Include examples/js/RequestAnimationFrame.js for cross-browser compatibility.
    requestAnimationFrame( animate );
    render();
}

function render() {
    
    //mesh.rotation.x += 0.01;
    core.rotation.y += 0.02;
    sim.updateAsteroidPosition(asteroid);

    if(sim.is_active()){
        // Why can't i do damn lines! 
        var s = new THREE.Mesh(path_geometry,path_material);
        s.position.x = asteroid.position.x;
        s.position.y = asteroid.position.y;
        s.position.z = asteroid.position.z;
        core.addChild(s);
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
            asteroid:{x:0,y:0,z:0,vx:0,vy:0,vz:0},
            pull:{x:0,y:0,z:0}
    }

    this.is_active = function(){
        return ival != null;
    }

    this.addPlanet = function(x,y,z,r,m){ 
        state.planetoids.push({x:x,y:y,z:z,r:r,m:m});
    };
    
    this.init = function(){
        t=0;
        if(ival){
            clearInterval(ival);
        }
        ival = setInterval(tick,cfg.tick_interval);
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
        var a={x:0,y:0,z:0};

        // governor
        if(t > 100){
            stop();
            return;
        }
    
        // sum up combined accelerations from planetoid gravitation in a
        for(var i=0;i<state.planetoids.length;i++){
            var p=state.planetoids[i];
            // distance between ast and p
            var d = dist(ast,p);
            // force to planet
            var f = p.m/Math.pow(d,2);
            //log(p.m);
            //log(f); 
            // acceleration from ast to p
            u = {   x: ((p.x-ast.x)/d) * f,
                    y: ((p.y-ast.y)/d) * f,
                    z: ((p.z-ast.z)/d) * f
                };
        
            log("t"+t+": u=("+u.x+","+u.y+","+u.z+")"); 
            a.x+=u.x;
            a.y+=u.y;
            a.z+=u.z;
        }
            
        log("t"+t+": a=("+u.x+","+u.y+","+u.z+")"); 
   
        state.pull = a; 
        // apply acceleration vector to asteroid velocity
        ast.vx += a.x;
        ast.vy += a.y;
        ast.vz += a.z;
    
        // and increment asteroid position
        ast.x += ast.vx;
        ast.y += ast.vy;
        ast.z += ast.vz;
    
        // and tick our sim
        t++;
        
        //log("updating position to "+state.asteroid.x+","+state.asteroid.y+","+state.asteroid.z);
    
    }
    
    this.updateAsteroidPosition = function(a){
        a.position.x=state.asteroid.x;
        a.position.y=state.asteroid.y;
        a.position.z=state.asteroid.z;
    }
};

/* RUN */

init();
animate();

 
