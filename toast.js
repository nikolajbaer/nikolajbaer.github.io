import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function initGame(){
    document.getElementById("boring_stuff").className += " fadeout";
    const speedometer = document.createElement('div')
    speedometer.className = "speedometer"
    document.body.appendChild(speedometer)
    const trackCanvas = document.createElement('canvas')
    trackCanvas.style.display = "none"
    document.body.appendChild(trackCanvas)

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

    const renderer = new THREE.WebGLRenderer({canvas:document.getElementById("canvas")});
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


    const drawingContext = trackCanvas.getContext( '2d' );
    const snowMaterial = new THREE.MeshStandardMaterial({color:"white"})
    // TODO
    //snowMaterial.bumpMap = new THREE.CanvasTexture(drawingContext)

    const snow = new THREE.Mesh(new THREE.PlaneGeometry(1000,1000),snowMaterial)
    snow.rotation.x = -Math.PI/2
    snow.receiveShadow = true
    scene.add(snow)

    let treeMesh
    let treeInstances
    const TREE_COUNT = 100
    const trees = []
    
    let mixer;
    let yetiMixer;
    let velocity = new THREE.Vector3(0,0,10)
    
    let slopeAngle = THREE.MathUtils.degToRad(30) 

    const GRAVITY = new THREE.Vector3(0,0,9.8)
    const FRICTION = new THREE.Vector3(0,0,-1)
    const FOREST_WIDTH = 1000
    const zOffset = 300

    const spawnTree = (tree,zRange,offset) => {
        tree.position.set(
            (Math.random() - 0.5)*FOREST_WIDTH,
            -0.5,
            (Math.random())*zRange + offset,
        )
        const scale = 2 + (Math.random()*2)
        tree.scale.set(scale,scale,scale)
        tree.rotation.x = -slopeAngle
    }


    const initTrees = (scene) => {
        const treeGroup = new THREE.Group()
        for(let i=0;i<TREE_COUNT;i++){
            const tree = scene.children[0].clone(true)
            spawnTree(tree,FOREST_WIDTH,100)
            trees.push(tree)
            treeGroup.add(tree)
        }
        return treeGroup
    }

    let gameOver = false

    const handleCrash = (tree) => {
        gameOver = true
        const msg = document.createElement('div')
        msg.className = "message"
        msg.innerHTML = 'Woops, you crashed! Game Over!'
        document.body.appendChild(msg)
    } 

    const handleYeti = (tree) => {
        gameOver = true
        const msg = document.createElement('div')
        msg.className = "message"
        msg.innerHTML = 'Oh no! The Yeti got you!'
        document.body.appendChild(msg)
    } 

    const TREE_HIT_RADIUS = 2
    const SKIER_POS = -50
    const actions = {} 
    let currentAction = null
    let currentSpeed = 0
    let tucking = false
    let snowplowing = false
    let distanceTraveled = 0

    let yeti = new THREE.Group()
    const YETI_SPAWN = 500
    yeti.visible = false
    yeti.scale.set(4,4,4)
    let yetiDistance = 0 
    const yetiActions = {}
    scene.add(yeti)

    const spawnYeti = () => {
        console.log("spawning yeti!")
        yeti.rotation.set(0,0,0)
        yeti.visible = true
        yeti.position.set(
            skier.position.x + (Math.random() > 0.5 ? 50 : -50),
            0,
            skier.position.z + 50,
        )
    }

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

    const updateTracks = () => {
        // TODO draw line from last ski pos to current ski pos
        // Also shift texture offset up by z-shift, and clear top of texture
        snowMaterial.needsUpdate = true
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
                if(keys.get('ArrowDown')){
                    console.log("tuck")
                    tucking = true
                    actions.tuck.reset().fadeIn(0.2).play()
                }
            }else if(tucking){
                if(!keys.get('ArrowDown')){
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

            if(!snowplowing && keys.get('ArrowUp')){
                snowplowing = true
                actions.snow_plow.reset().fadeIn(0.2).play()
            }else if(snowplowing && !keys.get('ArrowUp')){
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

            distanceTraveled += velocity.z * delta

            for(let i=0; i< trees.length;i++){
                trees[i].position.z -= velocity.z * delta
                trees[i].position.x -= velocity.x * delta
            }

            if(yeti.visible){
                yeti.position.z -= velocity.z * delta
                yeti.position.x -= velocity.x * delta
                
                const yetiToSkier = new THREE.Vector3().subVectors(skier.position,yeti.position)
                const yetiDist = yetiToSkier.length()
                if(yetiDist < 1){
                    handleYeti() 
                }else if(yetiDist < 100){
                    const yetiVel = yetiToSkier.normalize().multiplyScalar(velocity.length()*0.6)
                    yeti.position.add(yetiVel.multiplyScalar(delta))
                }

                if(yeti.position.z < -350){
                    yeti.visible = false
                    yetiDistance = distanceTraveled
                }
            }else if(distanceTraveled - yetiDistance > YETI_SPAWN){
                spawnYeti()
            }
        }
        for(let i = 0; i < trees.length; i++){
            const tree = trees[i]
            if(tree.position.z < -125){
                spawnTree(tree,10,zOffset)
            }
            if(new THREE.Vector3().subVectors(skier.position,tree.position).length() < TREE_HIT_RADIUS){
                handleCrash(tree) 
            }
        }
    }

    const animate = () => {
        const delta = clock.getDelta()
        tick(delta)
        mixer.update(delta)
        yetiMixer.update(delta)
        renderer.render(scene,camera) 
    }

    const loader = new GLTFLoader()
    loader.load("tree.glb", (gltf) => {
        scene.add(initTrees(gltf.scene))
    })
    loader.load("yeti.glb", (gltf) => {
        yeti.add(gltf.scene)
        yetiMixer = new THREE.AnimationMixer(gltf.scene)
        for(const clipName of ["gesticulate.001"]){
            const clip  = gltf.animations.find((clip) => clip.name === clipName)
            yetiActions[clipName.replace('.','_')] = yetiMixer.clipAction(clip)
        }
        yetiActions.gesticulate_001.play()
    })
    loader.load("toasterbot_skifree.glb",  (gltf) => {
        mixer = new THREE.AnimationMixer( gltf.scene );
        for(const clipName of ["skiing","left.turn","right.turn","tuck","snow.plow"]){
            const clip  = gltf.animations.find((clip) => clip.name === clipName)
            actions[clipName.replace('.','_')] = mixer.clipAction(clip)
        }

        actions.skiing.play()
        currentAction = actions.skiing

        const toasterBody = gltf.scene.children.find(obj=>obj.name==="rig").children.find(obj=>obj.name==="ToasterBody")
        toasterBody.castShadow = true
        gltf.scene.children.filter(obj=>obj.type==="Mesh").castShadow = true

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