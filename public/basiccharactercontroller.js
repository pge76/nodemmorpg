import * as THREE from 'three';
import {BasicCharacterControllerInput} from "./basiccharactercontrollerinput.js";
import {CharacterFSM} from "./characterFsm.js";
import {FBXLoader} from "fbxloader";


class BasicCharacterControllerProxy {
    constructor(animations) {
        this._animations = animations;
    }

    get animations() {
        return this._animations;
    }
}


class BasicCharacterController {
    constructor(params) {
        this._params = params;
        this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
        this._acceleration = new THREE.Vector3(1, 0.25, 50.0);
        this._velocity = new THREE.Vector3(0, 0, 0);

        this._animations = {};
        this._input = new BasicCharacterControllerInput();
        this._stateMachine = new CharacterFSM(
            new BasicCharacterControllerProxy(this._animations));

        this._LoadModels();
    }

    _LoadModels() {
        const loader = new FBXLoader();
        loader.setPath("assets/models/");
        loader.load("ybot.fbx", (fbx) => {
                fbx.scale.setScalar(0.1);
                fbx.traverse(c => {
                    c.castShadow = true;
                });

                this._target = fbx;
                this._params.scene.add(this._target);

                this._mixer = new THREE.AnimationMixer(this._target);

                this._manager = new THREE.LoadingManager();
                this._manager.onLoad = () => {
                    this._stateMachine.SetState('idle');
                };

                const _OnLoad = (animName, anim) => {
                    const clip = anim.animations[0];
                    const action = this._mixer.clipAction(clip);

                    this._animations[animName] = {
                        clip: clip,
                        action: action,
                    };
                };

                const _OnProgress = (animName, progressEvent) => {
                    console.log('animation: [' + animName + '] ' + (progressEvent.loaded / progressEvent.total * 100) + '% loaded');
                }

                const loader = new FBXLoader(this._manager);
                loader.setPath('assets/animations/');
                loader.load('chad-walk.fbx', (a) => {
                    _OnLoad('chad-walk', a);
                }, (pe) => _OnProgress('chad-walk', pe));

                loader.load('hip-hop-dancing.fbx', (a) => {
                    _OnLoad('dance', a);
                }, (pe) => _OnProgress('dance', pe));
                loader.load('idle.fbx', (a) => {
                    _OnLoad('idle', a)
                }, (pe) => _OnProgress('idle', pe));
                loader.load('jogging.fbx', (a) => {
                    _OnLoad('run', a);
                }, (pe) => _OnProgress('run', pe));

                loader.load('walking.fbx', (a) => {
                    _OnLoad('walk', a);
                }, (pe) => _OnProgress('walk', pe));

                loader.load('standing-greeting.fbx', (a) => {
                    _OnLoad('greet', a);
                }, (pe) => _OnProgress('greet', pe));

            },
            (xhr) => {
                console.log('model: ' + (xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('error while loading model: ' + error);
            });
    }


    Update(timeInSeconds) {
        if (!this._target) {
            return;
        }

        this._stateMachine.Update(timeInSeconds, this._input);

        const velocity = this._velocity;
        const frameDecceleration = new THREE.Vector3(
            velocity.x * this._decceleration.x,
            velocity.y * this._decceleration.y,
            velocity.z * this._decceleration.z
        );
        frameDecceleration.multiplyScalar(timeInSeconds);
        frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
            Math.abs(frameDecceleration.z), Math.abs(velocity.z));

        velocity.add(frameDecceleration);

        const controlObject = this._target;
        const _Q = new THREE.Quaternion();
        const _A = new THREE.Vector3();
        const _R = controlObject.quaternion.clone();

        const acc = this._acceleration.clone();
        if (this._input._keys.shift) {
            acc.multiplyScalar(2.0);
        }

        /*        if (this._stateMachine._currentState.Name === 'dance') {
                    acc.multiplyScalar(0.0);
                }
        */
        if (this._input._keys.forward) {
            velocity.z += acc.z * timeInSeconds;
        }
        if (this._input._keys.backward) {
            velocity.z -= acc.z * timeInSeconds;
        }
        if (this._input._keys.left) {
            _A.set(0, 1, 0);
            _Q.setFromAxisAngle(_A, 4.0 * Math.PI * timeInSeconds * this._acceleration.y);
            _R.multiply(_Q);
        }
        if (this._input._keys.right) {
            _A.set(0, 1, 0);
            _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * timeInSeconds * this._acceleration.y);
            _R.multiply(_Q);
        }

        controlObject.quaternion.copy(_R);

        const oldPosition = new THREE.Vector3();
        oldPosition.copy(controlObject.position);

        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(controlObject.quaternion);
        forward.normalize();

        const sideways = new THREE.Vector3(1, 0, 0);
        sideways.applyQuaternion(controlObject.quaternion);
        sideways.normalize();

        sideways.multiplyScalar(velocity.x * timeInSeconds);
        forward.multiplyScalar(velocity.z * timeInSeconds);

        controlObject.position.add(forward);
        controlObject.position.add(sideways);

        oldPosition.copy(controlObject.position);

        if (this._mixer) {
            this._mixer.update(timeInSeconds);
        }
    }
}

export {BasicCharacterController, BasicCharacterControllerProxy}