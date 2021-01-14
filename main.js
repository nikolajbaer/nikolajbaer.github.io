let scene,renderer,camera,uniforms;
const N = 100.0;
const P = 4.0;

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
    const W = N;
    const D = N;
    for ( let x = 0; x < D; x ++ ) {
        for( let z = 0; z < W; z ++ ){
	        vertices.push( (D/2)-x, 0, (W/2)-z );
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
    points.rotation.y = -Math.PI/9.3;
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
varying float distFromCenter;

// Vertical Component (height)
float wave_y(float x, float t, float d, float a){
    float t1 = width * .75 - mod(t*period,width * 1.5);
    float p = (x+t1)/d;
    return a * (cos(p-t1) + 1.) * step(abs(t1-p),PI); 
}
 
// Horizontal Component (translates on X or the path of the wave)
// Currently disabled until i figure out a better way to do this
float wave_x(float x,float z,float t,float d, float a){
    return x;
    float t1 = width * .75 - mod(t*period,width*1.5);
    float p = (x+t1)/d;
    float a1 = a;
    // TODO how to make the lip fall when it gets high enough
    return x - (a1 * cos(p-t1) * step(abs(t1-p),2.*PI)); 
}

void main(){
    // NOTE I am composing functions, not doing a proper first principles approach
    // this may or may not yield a nice looking result

    gl_PointSize = 2.;

    // shape our amplitude relative to z (breadth of wave)
    float a = cos( (position.z+(width/2.))/width );

    // shape when we crest the wave relative to x (wave path)
    float v = (1. - (position.x + (width/2.)) / width) * a * 2.;

    // calculate vertical component as sine wave, amplified later on by v
    // TODO and later by A if we focus like a reef a-frame
    float y = wave_y(position.x,time * 2.,2.,v * 2. );

    // calculate horizontal drift amplified by v along path, and a long breadth
    float x = wave_x(position.x,position.z,time * 2.,2.,v * 5. * a);

    // track distance to camera per https://stackoverflow.com/a/16137020
    vec4 cs_position = modelViewMatrix * vec4(position,1.);
    distToCamera = -cs_position.z;

    distFromCenter = sqrt(pow(position.x,2.) + pow(position.z,2.));

    // and update our position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(x,y,position.z,1.);
}

`;

const fSource = `
varying float distToCamera;
varying float distFromCenter;
uniform float width;
uniform float time;

void main() {
    vec4 color = vec4(max(1. - (time - 1.)/3.,0.));
    vec4 fog_color = vec4(1.);

    float fog_amount = pow(distFromCenter/(width*0.5),1.);
    gl_FragColor = mix( color, fog_color, fog_amount);

}

`;