import * as THREE from 'three';
//var ColladaLoader = require('three-collada-loader');
var ColladaLoader = require("./ColladaLoader.js");
var EffectComposer = require('three-effectcomposer')(THREE)

var renderer;
var camera;
var uniforms;
var toaster_bot;

function v(){
    var scene = new THREE.Scene();
    var light = new THREE.AmbientLight( 0xeeeeee ); // soft white light
    scene.add( light );

    uniforms = {
        u_time: { value: 0.0, type: "f" },
        u_resolution: { type: "v2", value: new THREE.Vector2(window.innerWidth,window.innerHeight) }

    };

    renderer = new THREE.WebGLRenderer({canvas:document.getElementById("canvas"),antialias:true});
    renderer.setClearColor(new THREE.Color(1,1,1,1));
    renderer.setSize( window.innerWidth, window.innerHeight );

    var clock = new THREE.Clock();
 
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight );

    var loader = new ColladaLoader();
    loader.load( 'toasterbot.dae', function ( collada ) {
        console.log("scene",collada.scene); 
        toaster_bot = new THREE.Object3D();
        toaster_bot.add(collada.scene);
        toaster_bot.scale.multiplyScalar(0.3);
        scene.add(toaster_bot);
        window.scene = scene;
    });
  
    camera.position.z = 5;
    camera.position.y = 0;
    window.camera = camera;
    
    function animate(now) {
    	requestAnimationFrame( animate );
        uniforms.u_time.value = clock.getElapsedTime();
    	renderer.render( scene, camera );
        if(toaster_bot){
            toaster_bot.rotation.y += 0.005;
            //toaster_bot.rotation.x += 0.001;
        }
    }
    animate(0);
}

window.onload = v;


/* resize handling */
var resizeTimeout;

window.onresize = function(){ 
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handle_resize,250);
}

function handle_resize(){
    if(renderer){
        console.log("resizing");
        renderer.setSize( window.innerWidth, window.innerHeight );
        uniforms.u_resolution.value.x = window.innerWidth
        uniforms.u_resolution.value.y = window.innerHeight
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
}



