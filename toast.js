import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function initGame(){
    document.getElementById("boring_stuff").className += " fadeout";

    const clock = new THREE.Clock()
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set( 0, 50, 25 );
    camera.lookAt(new THREE.Vector3(0,0,0))

    const renderer = new THREE.WebGLRenderer({canvas:document.getElementById("canvas")});
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0xffffff);

    const ambientLight = new THREE.AmbientLight( 0x404040 );
    scene.add( ambientLight );
    const light = new THREE.DirectionalLight( 0xFFFFFF );
    scene.add( light );

    const skier = new THREE.Group()
    skier.position.z = -100
    scene.add(skier)
    
    let mixer;
    let speed = 10

    const tick = (delta) => {
        if(skier.position.z < -30){
            skier.position.z += delta * speed
        }
    }

    const animate = () => {
        const delta = clock.getDelta()
        tick(delta)
        mixer.update(delta)
        renderer.render( scene, camera ); 
    }

    const loader = new GLTFLoader()
    loader.load("toasterbot_skifree.glb",  (gltf) => {
        mixer = new THREE.AnimationMixer( gltf.scene );
        const clip = gltf.animations.find((clip) => clip.name === "skiing")
        const action = mixer.clipAction(clip)
        action.play()
        skier.add(gltf.scene)
        renderer.setAnimationLoop(animate) 
    },undefined,console.error)

    window.addEventListener('resize',() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

}

function main(){
    document.getElementById("🍞").addEventListener("click",()=>{
        initGame();
    })
}

main()