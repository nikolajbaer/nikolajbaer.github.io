var camera, scene, renderer, geometry, material, core, light;


init();
animate();
 
function init() {

    camera = new THREE.Camera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;
    camera.position.y = 500;
    
    scene = new THREE.Scene();
    
    geometry = new THREE.Cube( 20, 20, 20 );
    //material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
    material = new THREE.MeshPhongMaterial( { color: 0xff0000  } );

    core = new THREE.Object3D();
    scene.addObject( core );

    // add some cubes 
    var T=20;
    var W=20;
    var SPACER = 30;

    cubes = [];
    for(var i=0;i<T;i++){
        for(var j=0;j<W;j++){
            mesh = new THREE.Mesh( geometry, material );
            mesh.position.x = (T/2 * SPACER)-(i * SPACER);
            mesh.position.z = (T/2 * SPACER)- (j * SPACER);
            mesh.position.y = Math.random()*200;
            core.addChild(mesh);
            cubes.push(mesh);
        } 
    }


    light = new THREE.Light({ color: 0xff0000 });
    light.position.y = 75;
    scene.addLight(light);
    
    //renderer = new THREE.CanvasRenderer();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    
    document.body.appendChild( renderer.domElement );
    /*
    document.body.onmouseup = function(){
        initPulse(); 
    }
    */
    
}

/**** pulse stuff ****/
function initPulse(){
    if(pulse_ival){
        clearInterval(pulse_ival);
    }
    pulse = {p:0};
    pulse_ival = setInterval(tickPulse,20);
    console.log("sending pulse");
}

function tickPulse(){
    for(var i=0;i<cubes.length;i++){
        var d = Math.abs(i-pulse.p)
        cubes[i].position.y = 50*(1/(d+1));
    }
    pulse.p+=1;
    if(pulse.p > cubes.length){
        clearInterval(pulse_ival); 
        pulse_ival=null;
    } 
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
    renderer.render( scene, camera );

               
}



