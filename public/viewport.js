"use strict";

import * as THREE from 'three';

import {OrbitControls} from "orbitcontrols";
import {BasicCharacterController} from "./basiccharactercontroller.js";

class NodeMmoRpg {
    dimX = 20;
    dimY = 20;

    constructor() {
        this.init();
    }

    init() {
        const now = window.performance.now();
        console.log("init started ...")
        this.initThreeJs();
        this.initCamera();
        this.initScene();
        this.initLights();
        this.initSkybox();

        this.loadAnimatedModels();

        window.addEventListener("resize", () => this.onResize(), false);

        this.addFlatPlane();

        document.body.appendChild(this.threejs.domElement);

        const controls = new OrbitControls(this._camera, this.threejs.domElement);
        controls.target.set(0, 20, 0);
        controls.update();

        this.centerCursor();

        console.log(`init finished in ${(window.performance.now()) - now} ms`)
        this.requestAF();

    }

    onResize() {
        this.threejs.setSize(window.innerWidth, window.innerHeight);
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this.centerCursor();
    }

    centerCursor() {
        let cursor = document.getElementById("cursor");
        cursor.style.left = ((0.5 * window.innerWidth) - (0.5 * cursor.width)).toString() + "px";
        cursor.style.top = ((0.5 * window.innerHeight) - (0.5 * cursor.height)).toString() + "px";
    }

    initCamera() {
        const fov = 60;
        const aspect = window.innerWidth / window.innerHeight;
        const near = 1.0;
        const far = 1000.0;

        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(75, 20, 0);
    }

    initScene() {
        this._scene = new THREE.Scene();

    }

    initLights() {
        let directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.3);
        directionalLight.position.set(20, 100, 10);
        directionalLight.target.position.set(0, 0, 0);
        directionalLight.castShadow = true;
        directionalLight.shadow.bias = -0.001;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 500.0;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500.0;
        directionalLight.shadow.camera.left = 100;
        directionalLight.shadow.camera.right = -100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this._scene.add(directionalLight);

        let ambientLight = new THREE.AmbientLight(0xFFFFFF, 2.0);
        this._scene.add(ambientLight);
    }

    initThreeJs() {
        this.threejs = new THREE.WebGLRenderer({
            antialias: true,
        });
        this.threejs.shadowMap.enabled = true;
        this.threejs.shadowMap.type = THREE.PCFSoftShadowMap;
        this.threejs.setPixelRatio(window.devicePixelRatio);
        this.threejs.setSize(window.innerWidth, window.innerHeight);

        this.textureLoader = new THREE.TextureLoader();
    }

    requestAF() {
        requestAnimationFrame((t) => {
            if (this.previousRAF === null) {
                this.previousRAF = t;
            }

            this.requestAF();

            this.render();
            this.threejs.render(this._scene, this._camera);
            this.step(t - this.previousRAF);
            this.previousRAF = t;
        });
    }

    step(timeElapsed) {
        const timeElapsedS = timeElapsed * 0.001;
        if (this._controls) {
            this._controls.Update(timeElapsedS);
        }
    }


    initSkybox() {
        this._scene.background = new THREE.CubeTextureLoader()
            .setPath('assets/skybox/')
            .load([
                'px.png',
                'nx.png',
                'py.png',
                'ny.png',
                'pz.png',
                'nz.png'
            ]);
    }

    addFlatPlane() {

        const singleBlockGeometry = new THREE.BoxGeometry(5, 5, 5);
        const grassMaterialArray = [
            new THREE.MeshBasicMaterial({map: this.textureLoader.load("assets/textures/grass/side.jpeg")}),
            new THREE.MeshBasicMaterial({map: this.textureLoader.load("assets/textures/grass/side.jpeg")}),
            new THREE.MeshBasicMaterial({map: this.textureLoader.load("assets/textures/grass/top.jpeg")}),
            new THREE.MeshBasicMaterial({map: this.textureLoader.load("assets/textures/grass/bottom.jpeg")}),
            new THREE.MeshBasicMaterial({map: this.textureLoader.load("assets/textures/grass/side.jpeg")}),
            new THREE.MeshBasicMaterial({map: this.textureLoader.load("assets/textures/grass/side.jpeg")})
        ];

        // create a flat area
        this.cubeMesh = new THREE.InstancedMesh(singleBlockGeometry, grassMaterialArray, this.dimX * this.dimY);
        this.cubeMesh.castShadow = false;
        this.cubeMesh.receiveShadow = true;
        this.cubeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
        this._scene.add(this.cubeMesh);

    }

    render() {
        const empty = new THREE.Object3D();
        const offsetX = Math.floor(this.dimX / 2);
        const offsetY = Math.floor(this.dimY / 2);

        let count = 0;
        for (let i = 0; i < this.dimX; i++) {
            for (let j = 0; j < this.dimY; j++) {
                const posX = (offsetX - i) * 5;
                const posY = (offsetY - j) * 5;
                empty.position.set(posX, -2.5, posY);
                empty.updateMatrix();
                this.cubeMesh.setMatrixAt(count++, empty.matrix);
            }
        }
        this.cubeMesh.instanceMatrix.needsUpdate = true;
    }

    loadAnimatedModels() {
        const params = {
            camera: this._camera,
            scene: this._scene
        }
        this._controls = new BasicCharacterController(params);
    }
}

let app = null;
window.addEventListener('DOMContentLoaded', () => {
    app = new NodeMmoRpg();
});
