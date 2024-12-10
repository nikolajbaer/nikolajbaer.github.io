import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function initGame(){
    document.getElementById("boring_stuff").className += " fadeout";
    const speedometer = document.createElement('div')
    speedometer.className = "speedometer"
    document.body.appendChild(speedometer)

    const UP = new THREE.Vector3(0,1,0)
    const keys = new Map()
    const clock = new THREE.Clock()
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.fov = 20 
    camera.position.set( 0, 320, 200 );
    camera.lookAt(new THREE.Vector3(0,0,0))
    camera.updateProjectionMatrix()
    window.camera = camera

    const renderer = new THREE.WebGLRenderer({canvas:document.getElementById("canvas"),antialias:true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0xffffff);

    const ambient = new THREE.AmbientLight(0xeeeeee)
    scene.add(ambient)
    const light = new THREE.DirectionalLight( 0xFFFFFF, 3 );
    light.position.set(0,10,0)
    light.target.position.set(0,0,-30)
    light.castShadow = true
    light.shadow.mapSize.width = 2048 
    camera.updateProjectionMatrix()
    light.shadow.mapSize.height = 2048 
    light.shadow.camera.near = 0.5
    light.shadow.camera.far = 500
    scene.add( light );

    const skier = new THREE.Group()
    skier.position.y = 1.5
    skier.position.z = -125
    scene.add(skier)

    const snow = new THREE.Mesh(new THREE.PlaneGeometry(1000,1000),new THREE.MeshBasicMaterial({color:"white"}))
    snow.rotation.x = -Math.PI/2
    snow.receiveShadow = true
    scene.add(snow)

    let treeMesh
    let treeInstances
    const TREE_COUNT = 100
    const trees = Array.from({length:TREE_COUNT},() => ({pos:new THREE.Vector3(),scale:1}))
    
    let mixer;
    let velocity = new THREE.Vector3(0,0,10)
    
    let slopeAngle = THREE.MathUtils.degToRad(30) 

    const GRAVITY = new THREE.Vector3(0,0,9.8)
    const FRICTION = new THREE.Vector3(0,0,-1)
    const FOREST_WIDTH = 1000
    const zOffset = 300

    const spawnTree = (i) => {
        trees[i].pos.set(
            (Math.random() - 0.5)*FOREST_WIDTH,
            0,
            (Math.random() * 10) + zOffset,
        )
        trees[i].scale = 1 + (Math.random()*0.4)
        trees[i].slope = -slopeAngle
    }

    const initTrees = () => {
        trees.forEach(tree => {
            tree.pos.set(
                (Math.random() - 0.5)*FOREST_WIDTH,
                0,
                (Math.random() - 0.5)*(FOREST_WIDTH/2) + zOffset,
            )
            tree.scale = 1 + (Math.random()*0.4),
            tree.slope = -slopeAngle
        }) 
    }

    let gameOver = false

    const handleCrash = (tree) => {
        gameOver = true
        const msg = document.createElement('div')
        msg.className = "message"
        msg.innerHTML = 'Woops, you crashed! Game Over!'
        document.body.appendChild(msg)
    } 

    const TREE_HIT_RADIUS = 2
    const slopeAxis = new THREE.Vector3(1,0,0)
    const SKIER_POS = -50
    const actions = {} 
    let currentAction = null
    let currentSpeed = 0
    let tucking = false
    let snowplowing = false

    const changeAction = (name,weight) => {
        if(currentAction === actions[name]) return
        if(currentAction && currentAction !== actions.skiing){
            currentAction.fadeOut(0.1).stop()
        }
        actions[name]
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(weight)
            .fadeIn(0.1)
            .play()
        currentAction = actions[name]
    }

    const tick = (delta) => {
        if(gameOver){
            return
        }
        currentSpeed = velocity.length()/4 // completely made up scaling factor
        speedometer.innerHTML = `${currentSpeed.toLocaleString({minimumIntegerDigits:2,maximumFractionDigits:0})}mph`
        if(skier.position.z < SKIER_POS){
            skier.position.add(velocity.clone().multiplyScalar(delta))
        }else{
            const turnScale = Math.min(currentSpeed,40)/40
            let turning = false
            if(keys.get('ArrowLeft') || keys.get('MouseLeft')){
                if(skier.rotation.y > -Math.PI/2){
                    turning = true
                    skier.rotation.y -= delta * 3 
                    // we are facing the opposite way
                    // TODO scale weight based on speed
                    changeAction("right_turn",turnScale) 
                }
            }else if(keys.get('ArrowRight') || keys.get('MouseRight')){
                if(skier.rotation.y < Math.PI/2){
                    turning = true
                    skier.rotation.y += delta * 3 
                    changeAction("left_turn",turnScale) 
                }
            }

            
            if(!tucking){
                if(keys.get('ArrowDown') || keys.get('MouseDown')){
                    console.log("tuck")
                    tucking = true
                    actions.tuck.reset().fadeIn(0.2).play()
                }
            }else if(tucking){
                if(!(keys.get('ArrowDown') && keys.get('MouseDown'))){
                    console.log("untuck")
                    tucking = false
                    actions.tuck.fadeOut(0.1).stop()
                }
                if(turning && tucking){
                    actions.tuck.setEffectiveWeight(0.5)
                }else{
                    actions.tuck.setEffectiveWeight(1.0)
                }
            }

            if(!snowplowing && (keys.get('ArrowUp') || keys.get('MouseUp'))){
                snowplowing = true
                actions.snow_plow.reset().fadeIn(0.2).play()
            }else if(snowplowing && !(keys.get('ArrowUp') && keys.get('MouseUp'))){
                snowplowing = false
                actions.snow_plow.fadeOut(0.2).stop()
            }

            // update velocity in the direction of skier
            const frictionScale = 0.01 * Math.max(tucking ? 0.5 : (snowplowing ? 20.0 : 1),1)
            velocity.set(0,0,velocity.length()).applyAxisAngle(UP,skier.rotation.y)
            velocity.add(GRAVITY.clone().multiplyScalar(delta * Math.sin(slopeAngle)))
            // Downhill friction
            velocity.add(FRICTION.clone().multiplyScalar(delta * Math.sin(skier.rotation.y)))
            // Ski / wind friction
            velocity.add(velocity.clone().normalize().multiplyScalar(-1).multiplyScalar(frictionScale))

            for(let i=0; i< trees.length;i++){
                trees[i].pos.z -= velocity.z * delta
                trees[i].pos.x -= velocity.x * delta
            }
        }
        for(let i = 0; i < trees.length; i++){
            const tree = trees[i]
            if(tree.pos.z < -125){
                spawnTree(i)
            }
            if(new THREE.Vector3().subVectors(skier.position,tree.pos).length() < TREE_HIT_RADIUS){
                handleCrash(tree) 
            }
            const matrix = new THREE.Matrix4().makeScale(tree.scale,tree.scale,tree.scale)
            matrix.premultiply(new THREE.Matrix4().makeRotationAxis(slopeAxis,tree.slope))
            matrix.premultiply(new THREE.Matrix4().makeTranslation(tree.pos.x,tree.pos.y,tree.pos.z))
            treeInstances.setMatrixAt(i,matrix)
        }
        treeInstances.instanceMatrix.needsUpdate = true
    }

    const animate = () => {
        const delta = clock.getDelta()
        tick(delta)
        mixer.update(delta)
        renderer.render(scene,camera) 
    }

    const loader = new GLTFLoader()
    loader.load("toasterbot_skifree.glb",  (gltf) => {
        console.log(gltf)
        mixer = new THREE.AnimationMixer( gltf.scene );
        for(const clipName of ["skiing","left.turn","right.turn","tuck","snow.plow"]){
            const clip  = gltf.animations.find((clip) => clip.name === clipName)
            console.log("loading ",clipName,"as",clipName.replace('.','_'),clip)
            actions[clipName.replace('.','_')] = mixer.clipAction(clip)
        }

        changeAction("skiing",1) 

        const toasterBody = gltf.scene.children.find(obj=>obj.name==="rig").children.find(obj=>obj.name==="ToasterBody")
        toasterBody.castShadow = true
        gltf.scene.children.filter(obj=>obj.type==="Mesh").castShadow = true

        treeMesh = gltf.scene.children.find(obj => obj.name === "tree")
        gltf.scene.remove(treeMesh)
        treeInstances = new THREE.InstancedMesh(treeMesh.geometry,new THREE.MeshToonMaterial({color:'DarkGreen'}),TREE_COUNT)
        treeInstances.castShadow = true
        initTrees()
        scene.add(treeInstances)

        skier.add(gltf.scene)
        renderer.setAnimationLoop(animate) 
    },undefined,console.error)

    window.addEventListener('resize',() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('keydown',(e) => keys.set(e.key,true))
    window.addEventListener('keyup',(e) => keys.set(e.key,false))
    window.addEventListener('pointerdown', (e) => {
        if(e.button !== 0) return
        if(e.clientX < window.innerWidth/2){
            keys.set('MouseLeft',true)
            keys.set('MouseRight',false)
        }else{
            keys.set('MouseLeft',false)
            keys.set('MouseRight',true)
        }
    })
    window.addEventListener('pointermove', (e) => {
        if(e.buttons & 1){
            if(e.clientX < window.innerWidth/2){
                keys.set('MouseLeft',true)
                keys.set('MouseRight',false)
            }else{
                keys.set('MouseLeft',false)
                keys.set('MouseRight',true)
            }
            if(e.clientY > window.innerHeight * 0.9){
                keys.set('MouseUp',false)
                keys.set('MouseDown',true)
            }else if(e.clientY < window.innerHeight * 0.4){
                keys.set('MouseUp',true)
                keys.set('MouseDown',false)
            }else{
                keys.set('MouseUp',false)
                keys.set('MouseDown',false)
            }

        }
    })
    window.addEventListener('pointerup', (e) => {
        keys.set('MouseLeft',false)
        keys.set('MouseRight',false)
    })
 

}

function main(){
    document.getElementById("🍞").addEventListener("click",()=>{
        initGame();
    })
}

main()