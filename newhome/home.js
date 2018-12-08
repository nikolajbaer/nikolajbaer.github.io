import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import listen from "key-state";
 
var EffectComposer = require('three-effectcomposer')(THREE)

var renderer;
var camera;
var uniforms;
var mesh;
var mixer;
var toaster_bot;
var actions={};

/*
    TODO
    - turn and walk
    - outline and white color
    - shadow / ground
    - Dramatic entry / fade in key control help
    - Dance mode

*/

function v(){
    var scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );
    
    const keys = listen(window);
    window.keys = keys;

    uniforms = {
        u_time: { value: 0.0, type: "f" },
        u_resolution: { type: "v2", value: new THREE.Vector2(window.innerWidth,window.innerHeight) }

    };

    renderer = new THREE.WebGLRenderer({canvas:document.getElementById("canvas"),antialias:true});
    renderer.setClearColor(new THREE.Color(1,1,1,1));
    renderer.setSize( window.innerWidth, window.innerHeight );

    var clock = new THREE.Clock();
 
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight );

    var loader = new GLTFLoader();
    loader.load( 'toasterbot.gltf', function ( gltf ) {
        const animations = gltf.animations;
        const model = gltf.scene;
        toaster_bot = model; 
        scene.add(model);

        console.log(animations);
        mixer = new THREE.AnimationMixer(model);
        animations.forEach(function(obj){
            console.log(obj.name);
            var clip = new THREE.AnimationClip.findByName( animations, obj.name );
            var action = mixer.clipAction(clip);
            actions[obj.name] = action;
        });
        actions["Idle"].play();
        window.scene = scene;
    });
  
    camera.position.z = 10;
    camera.position.y = 0;
    window.camera = camera;
    
    function animate(now) {
        if(toaster_bot && camera){
            //camera.lookAt(toaster_bot);
        }
    	requestAnimationFrame( animate );
        uniforms.u_time.value = clock.getElapsedTime();
    	renderer.render( scene, camera );
        if(mixer){
    	    mixer.update( clock.getDelta()*50 );
        }

        var walking = false;
        if(keys.ArrowUp){
            toaster_bot.position.z -= 0.1;
            walking = true;
        }
        if(keys.ArrowDown){
            toaster_bot.position.z += 0.1;
            walking = true;
        }
        if(keys.ArrowLeft){
            toaster_bot.position.x -= 0.1;
            walking = true;
        }
        if(keys.ArrowRight){
            toaster_bot.position.x += 0.1;
            walking = true;
        }
        if(toaster_bot){
            if(walking){ actions["Walk"].play(); actions["Idle"].stop(); }
            else{ actions["Walk"].stop(); actions["Idle"].play(); }
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



