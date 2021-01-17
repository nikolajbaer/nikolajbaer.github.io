let scene,renderer,camera,uniforms,vSource,fSource,mouse_xpos;
const N = 100.0;
const S = 0.5; // space between particles 
const P = 6.0;
const A = 2.0;
const mouse_buttons = [0,0,0,0,0,0]

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
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2() },
        width: { value: N },
        period: { value: P },
        amplitude: { value: A },
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

    camera.position.y = N/10
    camera.position.z = -N/2
    camera.lookAt(0,0,N/2)

    const t0 = performance.now()

    function animate() {
        //points.rotation.y += 0.001
        requestAnimationFrame( animate );
        if(mouse_buttons[0]){
		    uniforms[ 'time' ].value = mouse_xpos * (N/P) * 1.5; 
        }else{
		    uniforms[ 'time' ].value = (performance.now() - t0) / 1000;
        }
        renderer.render( scene, camera );
    }

    window.addEventListener( 'resize', onWindowResize, false );

    animate();

}

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}

// track mouse x position and button state
function onMouseMove(e){ mouse_xpos = (e.clientX / window.innerWidth) }
function onMouseDown(e){   ++mouse_buttons[e.button] }
function onMouseUp(e){  --mouse_buttons[e.button] }
function onTouchStart(e){   ++mouse_buttons[0] }
function onTouchEnd(e){  --mouse_buttons[0] }
function onTouchMove(e){ mouse_xpos = (e.touches[0].clientX / window.innerWidth) }

window.addEventListener( 'mousemove', onMouseMove, false);
window.addEventListener( 'mousedown', onMouseDown, false);
window.addEventListener( 'mouseup', onMouseUp, false);
window.addEventListener( 'touchstart', onTouchStart, false);
window.addEventListener( 'touchend', onTouchEnd, false);
window.addEventListener( 'touchmove', onTouchMove, false);

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