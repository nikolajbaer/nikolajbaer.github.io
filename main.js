let scene,renderer,camera,uniforms;
const N = 100.0;
const P = 10.0;

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
    for ( let x = 0; x < N; x ++ ) {
        for( let y = 0; y < N; y ++ ){
	        vertices.push( (N/2)-x, 0, (N/2)-y );
        }
    }
    uniforms = {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2() },
        width: { value: N },
        period: { value: P },
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
    //points.rotation.y = Math.PI/4;
    scene.add( points );

    camera.position.y = N/10
    camera.position.z = -N/2
    camera.lookAt(0,0,N/2)


    function animate() {
        //points.rotation.y += 0.001
        requestAnimationFrame( animate );
		uniforms[ 'time' ].value = performance.now() / 1000;
        renderer.render( scene, camera );
    }
    animate();
}


window.onload = main;

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}

window.addEventListener( 'resize', onWindowResize, false );

/*
graphtoy.com notes

step(abs( mod(t/5,1.) -x/10),.1)
(1-step(1,abs(x)))*sin(x*PI) 
*/

const vSource = `
#define PI 3.141592653589793
#define E 2.718281828459045
uniform float time;
uniform float width;
uniform float period;
varying float distToCamera;

float wave(float x, float d, float a){
    float p = x/d;
    float t = time * 2.;
    return a * (cos(p) + 1.) * step(abs(x),PI * d); 
}

void main(){
    gl_PointSize = 1.;
    float y = wave(position.x,2.,2.);

    // track distance to camera per https://stackoverflow.com/a/16137020
    vec4 cs_position = modelViewMatrix * vec4(position,1.);
    distToCamera = -cs_position.z;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x,y,position.z,1.);
}

`;

const fSource = `
varying float distToCamera;
uniform float width;

void main() {
    vec4 color = vec4(0.,0.,0.,1.);
    vec4 fog_color = vec4(1.,1.,1.,1.);

    float fog_amount = pow(distToCamera/(width*.75),2.);
    gl_FragColor = mix( color, fog_color, fog_amount);

}

`;