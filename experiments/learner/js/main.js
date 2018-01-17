var renderer, scene, camera, workPlane, cursor, controls;
var beast, blocks, brain;
var raycaster;
var t = 0;
var mouse = new THREE.Vector2();
var UP = new THREE.Vector3(0,1,0);
var rotateY = new THREE.Matrix4().makeRotationY( 0.001 );
var threshold = 0.1;

function init() {
	var container = document.getElementById( 'container' );

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.applyMatrix( new THREE.Matrix4().makeTranslation( 0,0,20 ) );
	camera.applyMatrix( new THREE.Matrix4().makeRotationX( -0.5 ) );

    renderer = new THREE.WebGLRenderer( {antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x000000, 1 );
    container.appendChild( renderer.domElement );

    raycaster = new THREE.Raycaster();
	raycaster.params.Points.threshold = threshold;

    var planeGeometry = new THREE.PlaneGeometry( 20, 20, 32, 32 );
    var gridGeometry = new THREE.EdgesGeometry(planeGeometry,0);
    var material = new THREE.LineBasicMaterial( {color: 0x00aaee, transparent: true,opacity:0.5 } );
    workPlane = new THREE.LineSegments( gridGeometry, material );
    workPlane.rotation.x = THREE.Math.degToRad(-90);
    scene.add( workPlane );

    var lights = [];
    lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
    lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
    lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

    lights[ 0 ].position.set( 0, 200, 0 );
    lights[ 1 ].position.set( 100, 200, 100 );
    lights[ 2 ].position.set( - 100, - 200, - 100 );

    scene.add( lights[ 0 ] );
    scene.add( lights[ 1 ] );
    scene.add( lights[ 2 ] );

    var points = new THREE.Geometry()
    points.vertices.push( new THREE.Vector3(0,0,0) );
    /*
    points.vertices.push( new THREE.Vector3(0,1,0) );
    points.vertices.push( new THREE.Vector3(0,-1,0) );
    */

    var pointMaterial = new THREE.PointsMaterial( {color: 0xff0000 });
    cursor = new THREE.Points( points,pointMaterial);
    scene.add( cursor ); 

   
    var manager = new THREE.LoadingManager(); 
    var loader = new THREE.OBJLoader( manager );
    loader.load( 'assets/trog.obj', function ( object ) {
        console.log(object);
        beast = new THREE.Group();
        beast.castShadow = true;
        var head = object.children[1];
        beast.add(head);
        
        brain = Learner();
        brain.init(5,3);
        beast.brain = brain;

        head.material = beastMaterial;
        var section = object.children[0];        
        var last = head;
        for(var i=0; i<30; i++){
            var s = new THREE.Mesh( section.geometry, beastMaterial);
            s.scale.multiplyScalar(1.0 - (i/50));
            s.position.z -= 0.1 + i*0.1;  
            last.add(s); 
            last = s;
        }
        head.position.y = 0;
        scene.add( beast );
    }, function(e){ console.log(e); },function(e){ console.log(e); } );

    var beastMaterial = new THREE.MeshPhongMaterial( {
                    color: 0xDADCC0,
                    emissive: 0x072534,
                    side: THREE.DoubleSide,
                    shininess: 0
                } )

    var controls = new THREE.OrbitControls( camera, renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );

    window.setInterval(update, 1.0/30.0);
}



function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
} 

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function beastMove(){
    var b = beast.children[0];

    // TODO figure out how to iterate this.
    var result = beast.brain.sense( [0,0,0] ); 
    // beast.brain.learn( [some reward data?] );

    if(cursor.visible){
        var qm = new THREE.Quaternion();
        var m1 = new THREE.Matrix4(); 
        var v = new THREE.Vector3(); 
        v.copy( beast.position );
        v.sub( cursor.position );
        m1.lookAt( beast.position, v, UP );
        b.quaternion.setFromRotationMatrix( m1 );
    }

    // and the tail
    while(b.children.length > 0){
        b.children[0].quaternion.slerp( b.quaternion,0.05 );
        b = b.children[0];
    }
}

function update(){
    t += 1;
    if(beast != null ){    
        beastMove();
    }
}

function animate() {
    requestAnimationFrame( animate );
    render();
}

function render() {

    //camera.applyMatrix( rotateY );
    //camera.updateMatrixWorld();

    raycaster.setFromCamera( mouse, camera );

    var intersections = raycaster.intersectObjects( [workPlane] );
    intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;

    if(intersection != null){
        cursor.visible = true;
        cursor.position.copy( intersection.point );
    }else{
        cursor.visible = false;
    }
    renderer.render( scene, camera );

}

init();
animate();


