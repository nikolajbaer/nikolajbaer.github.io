let scene,renderer,camera,uniforms,vSource,fSource,time,controls;
const N = 100.0;
const S = 0.5; // space between particles 
const P = 16.0;
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
        thickness: { value: 5. },
        reef_location: { value: new THREE.Vector3(-N*0.5,0,0) }
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
    points.rotation.y = Math.PI/4;
    scene.add( points );

    const reef_ref = new THREE.Mesh( 
        new THREE.BoxGeometry(1,1,1), 
        new THREE.MeshBasicMaterial( {color: 0xFF0000 })
    )
    reef_ref.position = uniforms.reef_location
    //scene.add(reef_ref)

    camera.position.x = -77
    camera.position.y = 15 
    camera.position.z = -1.5
    camera.lookAt(0,5,0)

    controls = new THREE.OrbitControls(camera,renderer.domElement);

    time = 0;
    let last = performance.now();
    let debug_t_el = document.getElementById("debug_time");

    // *** init shader editor ***
    let reload_shader_button = document.getElementById("reload_shaders");
    reload_shader_button.addEventListener("click", e => {
        load_shaders( () => {
            const new_material = new THREE.ShaderMaterial( {
                uniforms: uniforms,
                vertexShader: vSource,
        	    fragmentShader: fSource
            } );                
            points.material = new_material;
            console.log("reloaded shaders")
        })
    })

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
    if(window.location.hostname != "localhost"){  // only useful for dev
        document.getElementById("reload_shaders").style.display = "none"
    }
    load_shaders(main)
    init_info_button()
}

function init_info_button(){
    document.getElementById("show_info").addEventListener("click", () => {
        const e = document.getElementById("info")
        if(e.style.display == "block"){ e.style.display = "none" }
        else{  e.style.display = "block" }
    })
}

function load_shaders(callback){
    var vSrcRq = new XMLHttpRequest();
    vSrcRq.open('GET', 'vertex.glsl', true);
    vSrcRq.onload = function() {
        vSource = this.response;
        if(vSource && fSource){
            callback()
        }
    }
    vSrcRq.send();
    var fSrcRq = new XMLHttpRequest();
    fSrcRq.open('GET', 'frag.glsl', true);
    fSrcRq.onload = function() {
        fSource = this.response;
        if(vSource && fSource){
            callback()
        }
    }
    fSrcRq.send();
}