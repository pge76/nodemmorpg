import {FiniteStateMachine} from "./finitestatemachine.js";
import {IdleState} from "./idle-state.js";
import {WalkState} from "./walk-state.js";

class CharacterFSM extends FiniteStateMachine {
    constructor(proxy) {
        super();
        this._proxy = proxy;

        this._AddState('idle', IdleState);
        this._AddState('walk', WalkState);
    }
}


export {CharacterFSM}