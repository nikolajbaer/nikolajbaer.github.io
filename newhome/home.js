var renderer;
var camera;
var plane;
var cubes;
var uniforms;

function v(){
    var scene = new THREE.Scene();
    uniforms = {
        u_time: { value: 0.0, type: "f" },
        u_resolution: { type: "v2", value: new THREE.Vector2(window.innerWidth,window.innerHeight) }

    };

    camera = new THREE.Camera();
    renderer = new THREE.WebGLRenderer({canvas:document.getElementById("canvas"),antialias:true});
    renderer.setClearColor(new THREE.Color(1,1,1,1));
    renderer.setSize( window.innerWidth, window.innerHeight );

    var clock = new THREE.Clock();
  
    var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        fragmentShader: document.getElementById("fragment_shader").innerHTML,
    }); 
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(2,2), material);
    scene.add(mesh);
    camera.position.z = 1;
    
    function animate(now) {
    	requestAnimationFrame( animate );

        // update uniforms
        uniforms.u_time.value = clock.getElapsedTime();

    	renderer.render( scene, camera );
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



