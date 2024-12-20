import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function initGame(){
    document.getElementById("boring_stuff").className += " fadeout";
    const speedometer = document.createElement('div')
    speedometer.className = "speedometer fadein"
    document.body.appendChild(speedometer)
    const srcLink = document.createElement('div')
    srcLink.innerHTML = `<a href="https://github.com/nikolajbaer/nikolajbaer.github.io/blob/master/toast.js" target="_blank">&lt;&gt;</a>`
    srcLink.className = "srclink fadein"
    document.body.appendChild(srcLink)

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
    light.shadow.mapSize.width = 2048 
    camera.updateProjectionMatrix()
    light.shadow.mapSize.height = 2048 
    light.shadow.camera.near = 0.5
    light.shadow.camera.far = 500
    scene.add( light );

    const skier = new THREE.Group()
    skier.position.y = 1.5
    skier.position.z = -125
    const lastSkierPos = skier.position.clone()
    scene.add(skier)

    let snowParticles = []
    const snowParticleGravity = new THREE.Vector3(0,-10,0.2)
    const N_PARTICLES = 100
    const snowParticleMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,4),new THREE.MeshStandardMaterial({color:"white"}),N_PARTICLES)
    snowParticleMesh.frustumCulled = false
    scene.add(snowParticleMesh)

    const snow = new THREE.Mesh(new THREE.PlaneGeometry(1000,1000),new THREE.MeshBasicMaterial({color:"white"}))
    snow.rotation.x = -Math.PI/2
    scene.add(snow)

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
            skier.position.x + (Math.random() - 0.5)*FOREST_WIDTH,
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

    const handleYeti = (tree) => {
        gameOver = true
        const msg = document.createElement('div')
        msg.className = "message"
        msg.innerHTML = 'Oh no! The Yeti got you!<br><button onclick="window.location.reload()">reload</button>'
        document.body.appendChild(msg)
    } 

    const TREE_HIT_RADIUS = 5 
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
        if(currentAction){
            currentAction.fadeOut(0.1)
        }
        actions[name]
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(weight)
            .fadeIn(0.1)
            .play()
        currentAction = actions[name]
    }

    const handleCrash = (tree) => {
        gameOver = true
        const msg = document.createElement('div')
        msg.className = "message"
        msg.innerHTML = 'Woops, you crashed! Game Over!<br><button onclick="window.location.reload()">reload</button>'
        document.body.appendChild(msg)
        changeAction("crash",1.0)
        for(let i=0;i<20;i++){
            snowParticles.unshift({
                position: new THREE.Vector3(
                    skier.position.x + (Math.random()-0.5 * 3),
                    (Math.random() * 3),
                    skier.position.z + (Math.random()-0.5),
                ),
                velocity:new THREE.Vector3(
                    velocity.x*(Math.random()-0.5)*2,
                    Math.random()*0.4+0.2,
                    Math.random()*velocity.z*0.8,
                ),
                scale:Math.random()*0.7+0.1
            })
        }
    } 

    const skiTrackPoints = [[],[]]
    let leftSki
    let rightSki

    const tick = (delta) => {
        currentSpeed = velocity.length()/4 // completely made up scaling factor
        speedometer.innerHTML = `${currentSpeed.toFixed(0)}mph<br>${distanceTraveled.toFixed(0)}m`

        const leftSkiPos = leftSki.getWorldPosition(new THREE.Vector3())
        const rightSkiPos = rightSki.getWorldPosition(new THREE.Vector3())
        skiTrackPoints[0].unshift(leftSkiPos)
        skiTrackPoints[1].unshift(rightSkiPos)
        skiTrackPoints[0] = skiTrackPoints[0].slice(0,500)
        skiTrackPoints[1] = skiTrackPoints[1].slice(0,500)

        // handle input
        if(!gameOver && skier.position.z > SKIER_POS){
            const turnScale = Math.min(currentSpeed,20)/20 * 0.7 + 0.3
            let turning = 0 
            if(keys.get('ArrowLeft') || keys.get('MouseLeft')){
                if(skier.rotation.y > -Math.PI/2){
                    turning = 1 
                    skier.rotation.y -= delta * 3 
                    // we are facing the opposite way
                    // TODO scale weight based on speed
                    changeAction("right_turn",turnScale) 
                }
            }else if(keys.get('ArrowRight') || keys.get('MouseRight')){
                if(skier.rotation.y < Math.PI/2){
                    turning = -1 
                    skier.rotation.y += delta * 3 
                    changeAction("left_turn",turnScale) 
                }
            }else{
                changeAction("skiing",1.0)
            }

            const vFactor = Math.min(velocity.length(),40)/40
            if(turning && Math.random() > 1 - (vFactor*0.5 + 0.45)){
                const vThrow = vFactor * 5 
               if(turning === -1){
                    snowParticles.unshift({position:leftSkiPos.clone(),velocity:new THREE.Vector3(vThrow*(-2*Math.random()-1),vThrow/1000,0),scale:Math.random()*0.3+(vFactor*0.2)})
                }else if(turning === 1){
                    snowParticles.unshift({position:rightSkiPos.clone(),velocity:new THREE.Vector3(vThrow*(2*Math.random()+1),vThrow/1000,0),scale:Math.random()*0.3+(vFactor*0.2)})
                }
            }

            if(!tucking){
                if(keys.get('ArrowDown')){
                    tucking = true
                    actions.tuck.reset().fadeIn(0.2).play()
                }
            }else if(tucking){
                if(!keys.get('ArrowDown')){
                    tucking = false
                    actions.tuck.fadeOut(0.1).stop()
                }
                if(turning !== 0 && tucking){
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
        }

        // update velocity in the direction of skier
        const frictionScale = 0.01 * Math.max(tucking ? 0.1 : (snowplowing ? 50.0 : 1),1)
        velocity.set(0,0,velocity.length()).applyAxisAngle(UP,skier.rotation.y)
        velocity.add(GRAVITY.clone().multiplyScalar(delta * Math.sin(slopeAngle)))
        // Downhill friction
        velocity.add(FRICTION.clone().multiplyScalar(delta * Math.sin(skier.rotation.y)))
        // Ski / wind friction
        velocity.add(velocity.clone().normalize().multiplyScalar(-1).multiplyScalar(gameOver ? 1 : frictionScale))

        const dv = velocity.clone().multiplyScalar(delta)
        distanceTraveled += velocity.z * delta
        lastSkierPos.copy(dv)

        if(skier.position.z > SKIER_POS){
            camera.position.add(dv)
        }
        skier.position.add(dv)

        if(yeti.visible){
            const yetiToSkier = new THREE.Vector3().subVectors(skier.position,yeti.position)
            const yetiDist = yetiToSkier.length()
            if(yetiDist < 1 && !gameOver){
                handleYeti() 
            }else if(yetiDist < 100){
                const yetiVel = yetiToSkier.normalize().multiplyScalar(Math.max(velocity.length()*0.6,15))
                yeti.position.add(yetiVel.multiplyScalar(delta))
            }

            if(yeti.position.z < -350){
                yeti.visible = false
                yetiDistance = distanceTraveled
            }
        }else if(distanceTraveled - yetiDistance > YETI_SPAWN){
            spawnYeti()
        }
        for(let i = 0; i < trees.length; i++){
            const tree = trees[i]
            if(tree.position.z < skier.position.z-125){
                spawnTree(tree,10,zOffset+skier.position.z)
            }
            if(new THREE.Vector3().subVectors(skier.position,tree.position).length() < TREE_HIT_RADIUS){
                handleCrash(tree) 
            }
        }
       
        const particleGravity = snowParticleGravity.clone().multiplyScalar(delta)
        for(let i=0;i<snowParticles.length;i++){
            const p = snowParticles[i]
            if(p.position.y > p.scale/2){
                p.position.add(p.velocity.clone().multiplyScalar(delta))
                p.velocity.add(particleGravity)
            }
        }
        snowParticles = snowParticles.slice(0,N_PARTICLES)
        for(let i=0;i<N_PARTICLES;i++){
            const p = snowParticles[i]
            if(!p){
                snowParticleMesh.setMatrixAt(i,new THREE.Matrix4().makeScale(0,0,0))
            }else{
                const matrix = new THREE.Matrix4().makeScale(p.scale,p.scale,p.scale)
                matrix.premultiply(new THREE.Matrix4().makeTranslation(p.position.x,p.position.y,p.position.z))
                snowParticleMesh.setMatrixAt(i,matrix)
            }
        }
        snowParticleMesh.instanceMatrix.needsUpdate = true
    }

    let trackGeometries = [new THREE.BufferGeometry(),new THREE.BufferGeometry()]
    const trackMaterial =  new THREE.MeshBasicMaterial({color:"#eeeeee"})
    let leftTrack = new THREE.Mesh(trackGeometries[0],trackMaterial)
    let rightTrack = new THREE.Mesh(trackGeometries[1],trackMaterial)
    scene.add(leftTrack)
    scene.add(rightTrack)
    const tracks = [leftTrack,rightTrack]
    const updateTracks = () => {
        if(gameOver) return
        if(skiTrackPoints[0].length < 2) return
        for(let i=0;i<2;i++){
            const path = new THREE.CatmullRomCurve3(skiTrackPoints[i]) 
            path.closed = false
            const newGeometry = new THREE.TubeGeometry(path,500,0.4,4,false)
            tracks[i].geometry = newGeometry
            trackGeometries[i].dispose()
            trackGeometries[i] = newGeometry
        }
    }

    const animate = () => {
        const delta = clock.getDelta()
        tick(delta)
        updateTracks()
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
        for(const clipName of ["skiing","left.turn","right.turn","tuck","snow.plow","crash"]){
            const clip  = gltf.animations.find((clip) => clip.name === clipName)
            actions[clipName.replace('.','_')] = mixer.clipAction(clip)
        }
        actions.crash.clampWhenFinished = true
        actions.crash.loop = THREE.LoopOnce

        actions.skiing.play()
        currentAction = actions.skiing

        const toasterBody = gltf.scene.children.find(obj=>obj.name==="rig").children.find(obj=>obj.name==="ToasterBody")
        
        const findChild = (obj3d,name) => {
            for(const child of obj3d.children) {
                if(child.name.includes(name)){
                    return child
                }else{
                    const found = findChild(child,name)
                    if(found) return found
                }
            }
            return null
        }
        leftSki = findChild(gltf.scene,"skiL")
        rightSki = findChild(gltf.scene,"skiR")
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