import { Message } from "../Message";
import { InputEventMessage } from "./InputEventMessage";

export class InputManager {

    private static _keys: boolean[] = [];
    private static _viewport: HTMLCanvasElement;

    private constructor() { }

    public static Initialize( viewport: HTMLCanvasElement ): void {
        InputManager._viewport = viewport;

        // Setup all key states to not-pressed.
        for ( let i = 0; i < 256; ++i ) {
            InputManager._keys[i] = false;
        }

        window.addEventListener( "keydown", InputManager.onKeyDown );
        window.addEventListener( "keyup", InputManager.onKeyUp );
    }

    public static IsKeyDown( keyCode: number ): boolean {
        return InputManager._keys[keyCode] === true;
    }

    public static IsKeyUp( keyCode: number ): boolean {
        return InputManager._keys[keyCode] === false;
    }

    private static onKeyDown( event: KeyboardEvent ): void {
        InputManager._keys[event.keyCode] = true;
        Message.Send( InputEventMessage.KEY_DOWN, undefined, event );
    }

    private static onKeyUp( event: KeyboardEvent ): void {
        InputManager._keys[event.keyCode] = false;
        Message.Send( InputEventMessage.KEY_UP, undefined, event );
    }
}