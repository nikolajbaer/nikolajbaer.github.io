import * as THREE from 'three';
var ColladaLoader = require('three-collada-loader');

var renderer;
var camera;
var uniforms;
var toaster;

function v(){
    var scene = new THREE.Scene();
    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
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
        console.log(collada.scene.children[0]);
        toaster = collada.scene.children[0]
        var cube = new THREE.Mesh(new THREE.CubeGeometry(1,1,1), new THREE.MeshBasicMaterial({ color: "red"}));
        //scene.add(cube);
        toaster.children[0].material = new THREE.MeshBasicMaterial({color: "white"});
        var edges = new THREE.EdgesGeometry( toaster.children[0].geometry, 80  );
        var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) );
        toaster.children[0].add( line );

        var outlineMaterial1 = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.BackSide } );
	    var outlineMesh1 = new THREE.Mesh( toaster.children[0].geometry, outlineMaterial1 );
	    outlineMesh1.scale.multiplyScalar(1.05);
	    toaster.children[0].add( outlineMesh1 );

        toaster.rotation.x = -Math.PI/2;
        toaster.scale.multiplyScalar(0.5);
        scene.add(toaster);
    });
  
//    camera = new THREE.Camera();
//    var material = new THREE.ShaderMaterial({
//        uniforms: uniforms,
//        fragmentShader: document.getElementById("fragment_shader").innerHTML,
//    }); 
//    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(2,2), material);

//    scene.add(mesh);
    camera.position.z = 5;
    camera.position.y = 1;
    window.camera = camera;
    
    function animate(now) {
    	requestAnimationFrame( animate );
        uniforms.u_time.value = clock.getElapsedTime();
    	renderer.render( scene, camera );
        if(toaster){
            toaster.rotation.z += 0.005;
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



