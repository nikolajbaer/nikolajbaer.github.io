var camera, scene, renderer, geometry, material, core;

init();
animate();
    
function init() {

    camera = new THREE.Camera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;
    
    scene = new THREE.Scene();
    
    geometry = new THREE.Cube( 200, 200, 200 );
    material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

    core = new THREE.Object3D();
    scene.addObject( core );
    for(var i=0;i<10;i++){
        mesh = new THREE.Mesh( geometry, material );
        mesh.position.x=i*10;
        core.addChild(mesh);
    }
    
    renderer = new THREE.CanvasRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    
    document.body.appendChild( renderer.domElement );
    
}

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



