let scene,renderer,camera,uniforms,vSource,fSource,time,controls;
const N = 100.0;
const S = 0.5; // space between particles 
const P = 8.0;
const A = 3.0;
const keys = {};
let paused = false;

function main(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 5000 );

    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById("glCanvas"),
        antialias: true
    });
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setClearColor( 0xffffff, 1)

    const vertices = [];
    const W = N/S;
    const D = N/S;
    for ( let x = 0; x < D; x += S ) {
        for( let z = 0; z < W; z += S ){
	        vertices.push( (D/2)-x, 0, (W/2)-z );
        }
    }
    uniforms = {
        elapsed: { value: 0.0 },
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2() },
        width: { value: N },
        period: { value: P },
        amplitude: { value: A },
        reef_location: { value: new THREE.Vector3(W*0.65,0,0) }
    }


    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    //const material = new THREE.PointsMaterial( { color: 0x888888, size: 0.1 } );
    const material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: vSource,
	    fragmentShader: fSource
    } );
    const points = new THREE.Points( geometry, material );
    points.position.y = -1
    points.rotation.y = -Math.PI/9.3;
    scene.add( points );

    camera.position.x = 0;
    camera.position.y = 15 
    camera.position.z = -N/2
    camera.lookAt(0,-15,N/2)

    controls = new THREE.OrbitControls(camera,renderer.domElement);

    time = 0;
    let last = performance.now();
    let debug_t_el = document.getElementById("debug_time");

    function animate() {
        const now = performance.now();
        const dt = now - last;
        last = now;

        requestAnimationFrame( animate );

        controls.update();

        if(keys['ArrowLeft']){
            time -= dt;
        }else if(keys['ArrowRight']){
            time += dt;
        }else if(!paused){
            time += dt;
        }

        uniforms[ 'time' ].value = time / 1000;
        uniforms[ 'elapsed' ].value = now / 1000;
        debug_t_el.textContent = (time/1000).toFixed(3)
        renderer.render( scene, camera );
    }

    window.addEventListener( 'resize', onWindowResize, false );

    animate();

}


window.addEventListener('keydown', e => {keys[e.key] = 1; } )
window.addEventListener('keyup', e => { keys[e.key] = 0; } )
window.addEventListener('keypress', e => { 
    if( e.key == ' '){ paused = ! paused; }
});

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}

// Load our GLSL then init THREE.js scene
window.onload = function(){
    var vSrcRq = new XMLHttpRequest();
    vSrcRq.open('GET', 'vertex.glsl', true);
    vSrcRq.onload = function() {
        vSource = this.response;
        if(vSource && fSource){
            main()
        }
    }
    vSrcRq.send();
    var fSrcRq = new XMLHttpRequest();
    fSrcRq.open('GET', 'frag.glsl', true);
    fSrcRq.onload = function() {
        fSource = this.response;
        if(vSource && fSource){
            main()
        }
    }
    fSrcRq.send();
}