import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import listen from "key-state";
import TWEEN from '@tweenjs/tween.js';

//var EffectComposer = require('./postprocessing/EffectComposer');

var INTRO_TIME = 10000;
var intro_tween;
var renderer;
var camera;
var uniforms;
var mesh;
var mixer;
var toaster_bot;
var actions={};
var composer;

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
    scene.fog = new THREE.Fog( 0xffffff, 30, 40 );
    scene.background = new THREE.Color( 0xffffff );
    
    const keys = listen(window);
    window.keys = keys;
    window.THREE = THREE;

    uniforms = {
        u_time: { value: 0.0, type: "f" },
        u_resolution: { type: "v2", value: new THREE.Vector2(window.innerWidth,window.innerHeight) },
        u_offset: { type: "f", value: 0.1 }
    };

    renderer = new THREE.WebGLRenderer({canvas:document.getElementById("canvas"),antialias:true});
    renderer.setClearColor(new THREE.Color(1,1,1,1));
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.gammaOutput = true;
	renderer.gammaFactor = 2.2;
    renderer.shadowMap.enabled = true;

//    renderer.autoClear = false
//    renderer.gammaInput = true
//    renderer.gammaOutput = true   
//
    var clock = new THREE.Clock();
 
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight );

    var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0xefefef, depthWrite: false } ) );
    mesh.rotation.x = - Math.PI / 2;
	mesh.receiveShadow = true;
	scene.add( mesh );


    var dirLight = new THREE.DirectionalLight( 0xffffff );
    dirLight.position.set( 0, 20, 0 );
    dirLight.castShadow = true;
    //dirLight.lookAt(new THREE.Vector3(0,0,0));
    scene.add( dirLight );    
    //scene.add( new THREE.CameraHelper( dirLight.shadow.camera ));

    //composer.addPass(new EffectComposer.RenderPass(scene, camera))

    //var shaderPass = new EffectComposer.ShaderPass(THREE.SepiaShader)
    //composer.addPass(shaderPass);

    // Add FXAA pass
//     var shaderPass = new EffectComposer.ShaderPass(fxaa())
//     shaderPass.renderToScreen = true
//     composer.addPass(shaderPass)
    
    // Make sure screen resolution is set!
    //shaderPass.uniforms.resolution.value.set(renderer.width,renderer.height)
    
    var loader = new GLTFLoader();
    loader.load( 'toasterbot.gltf', function ( gltf ) {
        const animations = gltf.animations;
        const model = gltf.scene;
        model.traverse( function ( object ) {
            if ( object.isMesh ) {  
                object.castShadow = true;
            }
        } );
        toaster_bot = model; 
        scene.add(model);


        var toaster_mesh = model.getObjectByName("Armature")
                                    .getObjectByName("ToasterBody");
        window.toaster_mesh = toaster_mesh;
        window.toaster_bot = toaster_bot;

        mixer = new THREE.AnimationMixer(model);
        animations.forEach(function(obj){
            var clip = new THREE.AnimationClip.findByName( animations, obj.name );
            var action = mixer.clipAction(clip);
            actions[obj.name] = action;
        });
        actions["Idle"].play();

        window.scene = scene;
        intro_tween.start();
    });
  
    camera.position.z = 15;
    camera.position.y = 103;
    camera.lookAt(new THREE.Vector3(0,103,0));
    intro_tween = new TWEEN.Tween(camera.position).to({y:3},INTRO_TIME)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .onComplete(function(){
                        //intro_tween.stop();
                    });
    window.camera = camera;
    
    function animate(now) {
    	requestAnimationFrame( animate );
        uniforms.u_time.value = clock.getElapsedTime();
        //composer.render()
    	renderer.render( scene, camera );

        if(mixer){
    	    mixer.update( clock.getDelta()*100 );
        }
       
        if(intro_tween){ 
            intro_tween.update(now);
        }

        var walking = false;
        var dv = new THREE.Vector3(0,0,0);
        const SPD = 0.1;
        if(keys.ArrowUp){
            dv.z = SPD;
            walking = true;
        }
        if(keys.ArrowDown){
            dv.z = -SPD;
            walking = true;
        }
        if(keys.ArrowLeft){
            toaster_bot.rotation.y += 0.05;
            walking=true;
        }
        if(keys.ArrowRight){
            toaster_bot.rotation.y -= 0.05;
            walking=true;
        }
        if(toaster_bot){
            if(walking){ 
                dv.applyAxisAngle(new THREE.Vector3(0,1,0), toaster_bot.rotation.y);
                toaster_bot.position.add( dv );
                actions["Walk"].play(); actions["Idle"].stop(); 
            }
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
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
}



