var renderer, scene, camera, workPlane, cursor;
var raycaster;
var mouse = new THREE.Vector2();

var rotateY = new THREE.Matrix4().makeRotationY( 0.001 );
var threshold = 0.1;

function init() {
	var container = document.getElementById( 'container' );

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.applyMatrix( new THREE.Matrix4().makeTranslation( 0,0,20 ) );
	camera.applyMatrix( new THREE.Matrix4().makeRotationX( -0.5 ) );

    renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    raycaster = new THREE.Raycaster();
	raycaster.params.Points.threshold = threshold;

    var planeGeometry = new THREE.PlaneGeometry( 20, 20, 32, 32 );
    var gridGeometry = new THREE.EdgesGeometry(planeGeometry,0);
    var material = new THREE.LineBasicMaterial( {color: 0x00aaee, lineWidth:1} );
    workPlane = new THREE.LineSegments( gridGeometry, material );
    workPlane.rotation.x = THREE.Math.degToRad(-90);
    scene.add( workPlane );


    var points = new THREE.Geometry()
    points.vertices.push( new THREE.Vector3(0,0,0) );
    points.vertices.push( new THREE.Vector3(0,1,0) );
    points.vertices.push( new THREE.Vector3(0,-1,0) );
    var pointMaterial = new THREE.PointsMaterial( {color: 0xff0000 });
    cursor = new THREE.Points( points,pointMaterial);
    scene.add( cursor );

    window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );

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

function animate() {
    requestAnimationFrame( animate );
    render();
}

function render() {

    camera.applyMatrix( rotateY );
    camera.updateMatrixWorld();

    raycaster.setFromCamera( mouse, camera );

    var intersections = raycaster.intersectObjects( [workPlane] );
    intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;

    cursor.position.copy( intersection.point );
    renderer.render( scene, camera );

}

init();
animate();


