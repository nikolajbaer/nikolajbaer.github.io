import * as THREE from 'three';
var ColladaLoader = require('three-collada-loader');

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

        var toaster_mat = new THREE.MeshBasicMaterial({color: "white"});
        var line_mat =  new THREE.LineBasicMaterial( { color: 0x000000 } );
        var outline_mat = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.BackSide } );

        function update_material(obj){
            //obj.children[0].material = toaster_mat;
            //var edges = new THREE.EdgesGeometry( obj.children[0].geometry, 80  );
            //var line = new THREE.LineSegments( edges,line_mat );
            //obj.add(line);

            // add outline
    	    var outlineMesh1 = new THREE.Mesh( obj.children[0].geometry, outline_mat );
    	    outlineMesh1.scale.multiplyScalar(1.05);
    	    obj.add( outlineMesh1 );
        }


        function handle_obj(item){
            update_material(item);
        }

        var objs = [];
        collada.scene.children.forEach(function(item){
            console.log(item.name,item.type);
            handle_obj(item);
            objs.push(item);
        });
    
        objs.forEach(function(o){ toaster_bot.add(o); });
         

        toaster_bot.rotation.x = -Math.PI/2;
        toaster_bot.scale.multiplyScalar(0.5);
        scene.add(toaster_bot);
        window.scene = scene;
    });
  
//    camera = new THREE.Camera();
//    var material = new THREE.ShaderMaterial({
//        uniforms: uniforms,
//        fragmentShader: document.getElementById("fragment_shader").innerHTML,
//    }); 
//    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(2,2), material);

//    scene.add(mesh);
    camera.position.z = 5;
    camera.position.y = 0;
    window.camera = camera;
    
    function animate(now) {
    	requestAnimationFrame( animate );
        uniforms.u_time.value = clock.getElapsedTime();
    	renderer.render( scene, camera );
        if(toaster_bot){
            toaster_bot.rotation.z += 0.005;
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



