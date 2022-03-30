import * as THREE from 'three';

/* variable definitions */
let scene, camera, renderer, textureLoader;
let cubeMesh;
const movementKeys = {
    forward : "w",
    backward : "s",
    right : "d",
    left : "a",
    jump : " ",
    placeBlock : "q"
};

/* functions */
function centerCursor() {
    let cursor = document.getElementById("cursor");
    cursor.style.left = ((0.5 * window.innerWidth) - (0.5 * cursor.width)).toString() + "px";
    cursor.style.top = ((0.5 * window.innerHeight) - (0.5 * cursor.height)).toString() + "px";
}


function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );

    textureLoader = new THREE.TextureLoader();

    const singleBlockGeometry = new THREE.BoxGeometry(5, 5, 5);
    const grassMaterialArray = [
        new THREE.MeshBasicMaterial({map : textureLoader.load("assets/textures/grass/side.jpeg")}),
        new THREE.MeshBasicMaterial({map : textureLoader.load("assets/textures/grass/side.jpeg")}),
        new THREE.MeshBasicMaterial({map : textureLoader.load("assets/textures/grass/top.jpeg")}),
        new THREE.MeshBasicMaterial({map : textureLoader.load("assets/textures/grass/bottom.jpeg")}),
        new THREE.MeshBasicMaterial({map : textureLoader.load("assets/textures/grass/side.jpeg")}),
        new THREE.MeshBasicMaterial({map : textureLoader.load("assets/textures/grass/side.jpeg")})
    ];


    cubeMesh = new THREE.InstancedMesh(singleBlockGeometry, grassMaterialArray, 1);
    cubeMesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame

    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    scene.add( cubeMesh );
    camera.position.z = 50;
    centerCursor();
}
function animate() {
    requestAnimationFrame( animate );
    
    const positionMatrix = new THREE.Object3D();
    positionMatrix.position.set(0,0,0);

    positionMatrix.updateMatrix();

    cubeMesh.setMatrixAt(0, positionMatrix.matrix);
    cubeMesh.instanceMatrix.needsUpdate = true;

    renderer.render( scene, camera );
}

window.addEventListener("resize", function(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    centerCursor();
});

init();
animate();

