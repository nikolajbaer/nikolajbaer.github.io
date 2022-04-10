let scene,renderer,camera,uniforms,vSource,fSource,time,controls;
const N = 100.0;
const S = 0.5; // space between particles 
const P = 8.0;
const A = 3.0;
const keys = {};
let paused = false;

function main(material){
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

    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1, 100 );
    directionalLight.castShadow = true
    directionalLight.position.set( 0, 0, 10 )
    directionalLight.lookAt(0,0,0)
    scene.add( directionalLight );

    //const geometry = new THREE.BufferGeometry();
    //geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    const geometry = new THREE.PlaneGeometry( N/S, N/S, N, N );
    /*
    const points = new THREE.Points( geometry, material );
    points.position.y = -1
    points.rotation.y = Math.PI/4;
    scene.add( points );
    */
    const mesh = new THREE.Mesh( geometry, material ) // new THREE.MeshBasicMaterial({color: 0xff00ff, side: THREE.DoubleSide}) )
    scene.add( mesh )


    // gizmo
    const gizmo = new THREE.Group()
    gizmo.add(new THREE.Line( new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector4(1,0,0)]), new THREE.LineBasicMaterial({ color: 0xff0000 })))
    gizmo.add(new THREE.Line( new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector4(0,1,0)]), new THREE.LineBasicMaterial({ color: 0x00ff00 })))
    gizmo.add(new THREE.Line( new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector4(0,0,1)]), new THREE.LineBasicMaterial({ color: 0x0000ff })))
    scene.add(gizmo)

    camera.position.x = 0
    camera.position.y = 10 
    camera.position.z = 5 
    camera.up = new THREE.Vector3(0,0,1)

    controls = new THREE.OrbitControls(camera,renderer.domElement);
    controls.minPolarAngle = 0
    controls.maxPolarAngle = Math.PI/2 * 0.98
    
    time = 0;
    let last = performance.now();

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

        const shader = mesh.material.userData.shader;
			  if(shader) {
          shader.uniforms.time.value = time / 1000;
          shader.uniforms.elapsed.value = now / 1000;
			  }
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

function create_custom_material(vSource){
  // modify vertex shader only via this techinque
  // https://github.com/mrdoob/three.js/blob/master/examples/webgl_materials_modified.html
  material = new THREE.MeshPhongMaterial({color: 0xff00ff})
  const vParts = vSource.split('//DIVIDER')
  material.onBeforeCompile = function(shader) {
    console.log(shader.vertexShader)
    //return
    // add uniforms for our vertex shader
    shader.uniforms.elapsed = { value: 0.0 }
    shader.uniforms.time = { value: 1.0 }
    shader.uniforms.resolution = { value: new THREE.Vector2() }
    shader.uniforms.width = { value: N }
    shader.uniforms.period = { value: P }
    shader.uniforms.amplitude = { value: A }
    shader.uniforms.thickness = { value: 5. }
    shader.uniforms.reef_location = { value: new THREE.Vector3(-N*0.5,0,0) }
    shader.vertexShader = shader.vertexShader.replace('#include <common>',vParts[0] + '\n#include <common>')
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',vParts[1])
    material.userData.shader = shader
    console.log(shader.vertexShader)
  }
  //material.customProgramCacheKey = function(){ return something }

  main(material)
}

function load_shaders(){
    fetch('vertex.glsl')
      .then( resp => resp.text())
      .then( vSource => create_custom_material(vSource) )
}
window.onload = load_shaders