import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function initGame(){
    document.getElementById("boring_stuff").className += " fadeout";
    const srcLink = document.createElement('div')
    srcLink.innerHTML = `WIP! <a href="https://github.com/nikolajbaer/nikolajbaer.github.io/blob/master/surf.js" target="_blank">&lt;&gt;</a>`
    srcLink.className = "srclink fadein"
    document.body.appendChild(srcLink)

    const UP = new THREE.Vector3(0,1,0)
    const keys = new Map()
    const clock = new THREE.Clock()
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.far = 1000
    camera.position.set( -15, 10, 30 );
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
    scene.add( light );

    let waveSplines
    const SPLINE_POINT_COUNT = 29
    const waveLines = []

    const zWidth = 4
    let waveZMax
    const topPoints = []
    let topCurve
    const WAVE_SPEED = 8
    const waveLineMaterial = new THREE.LineBasicMaterial({color:'black'})
    const waveGroup = new THREE.Group()
    scene.add(waveGroup)
    const initWaveLines = () => {
        // TODO extend a bit beyond either side by 2 lines
        waveSplines.forEach((points,i) => {
            const curve = new THREE.CatmullRomCurve3(points,false)
            if(curve.length ===0) return
            const curveGeometry = new THREE.BufferGeometry()
            curveGeometry.setFromPoints(curve.getPoints(200))
            const line = new THREE.Line(curveGeometry,waveLineMaterial)
            const z = i*zWidth
            line.position.set(0,0,z)
            waveGroup.add(line)
            const topPoint = points[points.length-1].clone()
            topPoint.z = z
            topPoints.push(topPoint)
            waveZMax = z
            // TODO warp line as it moves along Z
            waveLines.push(line)
        }) 
        topCurve = new THREE.CatmullRomCurve3(topPoints,false)
        const curveGeometry = new THREE.BufferGeometry()
        curveGeometry.setFromPoints(topCurve.getPoints(200))
        const topline = new THREE.Line(curveGeometry,waveLineMaterial)
        waveGroup.add(topline)
    }

    let mixer;
    const surfer = new THREE.Group()
    scene.add(surfer)

    let waterParticles = []
    const waterParticleGravity = new THREE.Vector3(0,-10,0.2)
    const N_PARTICLES = 100
    const waterParticleMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,4),new THREE.MeshStandardMaterial({color:"white"}),N_PARTICLES)
    waterParticleMesh.frustumCulled = false
    scene.add(waterParticleMesh)

    let velocity = new THREE.Vector3(0,0,10)
    const GRAVITY = new THREE.Vector3(0,0,9.8)

    let gameOver = false

    const actions = {} 
    let currentAction = null
    const surfTrackPoints = [[],[]]

    // TODO this should really be done in a shader.
    const interpolateWave = (z) => {
        const index = z * waveSplines.length
        const waveFrom = waveSplines[Math.max(Math.floor(index),0)]
        let waveTo = waveSplines[Math.ceil(index)]
        if(!waveTo){ waveTo = waveSplines[waveSplines.length - 1] }
        try{
            const points = waveFrom.map((point,i) => {
                return point.clone().lerp(waveTo[i],index-Math.floor(index))
            })
            return new THREE.CatmullRomCurve3(points)
        }catch(err){
            console.error(waveFrom,waveTo,index,err)
            throw err
        }
    }

    const updateWaveLines = (delta) => {
        waveLines.forEach(line => {
            line.position.z -= WAVE_SPEED * delta
            if(line.position.z < 0){
                line.position.z = (zWidth * waveLines.length) + line.position.z 
            }
            const newCurve = interpolateWave(line.position.z / (waveLines.length * zWidth))
            const curveGeometry = new THREE.BufferGeometry()
            curveGeometry.setFromPoints(newCurve.getPoints(200))
            const oldGeo = line.geometry
            line.geometry = curveGeometry
            oldGeo.dispose()
        })
    }
    
    const spawnParticles = (delta) => {
        if(!topCurve) return
        const t = 0.2+ Math.random()*0.1
        const spawnPoint = topCurve.getPoint(t)
        waterParticles.unshift({
            position: spawnPoint,
            velocity: new THREE.Vector3(-6+Math.random()*0.2,1+Math.random(),-WAVE_SPEED*(0.8+Math.random()*0.2)),
            scale: Math.random()*0.2+0.1,
            grow: Math.random()*0.8,
        })
    }

    const updateParticles = (delta) => {
        const particleGravity = waterParticleGravity.clone().multiplyScalar(delta)
        for(let i=0;i<waterParticles.length;i++){
            const p = waterParticles[i]
            if(p.position.y > p.scale/2){
                p.position.add(p.velocity.clone().multiplyScalar(delta))
                p.velocity.add(particleGravity)
                p.scale += p.grow * delta
            }
        }
        waterParticles = waterParticles.slice(0,N_PARTICLES)
        for(let i=0;i<N_PARTICLES;i++){
            const p = waterParticles[i]
            if(!p){
                waterParticleMesh.setMatrixAt(i,new THREE.Matrix4().makeScale(0,0,0))
            }else{
                const matrix = new THREE.Matrix4().makeScale(p.scale,p.scale,p.scale)
                matrix.premultiply(new THREE.Matrix4().makeTranslation(p.position.x,p.position.y,p.position.z))
                waterParticleMesh.setMatrixAt(i,matrix)
            }
        }
        waterParticleMesh.instanceMatrix.needsUpdate = true
    }

    const tick = (delta) => {
        // handle input
        if(!gameOver){
            if(keys.get('ArrowLeft') || keys.get('MouseLeft')){
            }else if(keys.get('ArrowRight') || keys.get('MouseRight')){
            }else{
            }
        }
        spawnParticles()
        updateParticles(delta)
        updateWaveLines(delta)
    }

    const animate = () => {
        const delta = clock.getDelta()
        tick(delta)
        mixer.update(delta)
        renderer.render(scene,camera) 
    }

    const loader = new GLTFLoader()
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
    loader.load("toasterbot_surf.glb",  (gltf) => {
        mixer = new THREE.AnimationMixer( gltf.scene );
        for(const clipName of ["surf"]){
            const clip  = gltf.animations.find((clip) => clip.name === clipName)
            actions[clipName.replace('.','_')] = mixer.clipAction(clip)
        }
        actions.surf.play()
        currentAction = actions.surf

        const toasterBody = gltf.scene.children.find(obj=>obj.name==="rig").children.find(obj=>obj.name==="ToasterBody")

        //boardTail = findChild(gltf.scene,"boardTail")
        surfer.add(gltf.scene)
        renderer.setAnimationLoop(animate) 
    },undefined,console.error)
    loader.load("toasterbot_wavesplines.glb",  (gltf) => {
        waveSplines = gltf.scene.children.filter(obj => obj.name.startsWith('spline')).map(obj => {
            const position = obj.geometry.getAttribute('position')
            const points = new Array(position.count).fill(null)
            // TODO figure out why this isn't being exported correctly from blender!
            const ordering = [0,2,7,3,4,6,5,1]
            for(let i=0;i<position.count; i++){
                const p0 = i*3
                const o = ordering[i]
                points[o] = new THREE.Vector3(position.array[p0],position.array[p0+1],position.array[p0+2])
            }
            return points
        })
        initWaveLines()
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
    document.getElementById("🍞").addEventListener("click",(e)=>{
        if(e.shiftKey){
            initGame();
        }
    })
}

main()