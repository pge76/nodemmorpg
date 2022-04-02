import {State} from "./state.js";

class WalkState extends State {
    constructor(parent) {
        super(parent);
    }

    get Name() {
        return 'walk';
    }

    Enter(prevState) {
        const walkAction = this._parent._proxy._animations['walk'].action;
        if (prevState) {
            const prevAction = this._parent._proxy._animations[prevState.Name].action;

            walkAction.time = 0.0;
            walkAction.enabled = true;

            walkAction.setEffectiveTimeScale(1.0);
            walkAction.setEffectiveWeight(1.0);
            walkAction.crossFadeFrom(prevAction, 0.5, true);
            walkAction.play();
        } else {
            walkAction.play();
        }
    }

    Exit() {
    }

    Update(timeElapsed, input) {
        if (input._keys.forward || input._keys.backward) {
        } else {
            this._parent.SetState('idle');
        }
    }
}

export {WalkState}