namespace FPS {

    export enum InputEventMessage {
        KEY_DOWN = "KEY_DOWN",
        KEY_UP = "KEY_UP"
    }

    export class InputHandler {

        private static _keys: boolean[] = [];
        private static _mouseDeltaX: number = 0;
        private static _mouseDeltaY: number = 0;
        private static _viewport: HTMLCanvasElement;

        public static Initialize( viewport: HTMLCanvasElement ): void {

            InputHandler._viewport = viewport;

            // Setup all key states to not-pressed.
            for ( let i = 0; i < 256; ++i ) {
                InputHandler._keys[i] = false;
            }

            window.addEventListener( "keydown", InputHandler.onKeyDown );
            window.addEventListener( "keyup", InputHandler.onKeyUp );
            window.addEventListener( "mousedown", InputHandler.onMouseDown );

            document.addEventListener( "pointerlockchange", InputHandler.onPointerLockChange );
        }

        public static get MouseDeltaX(): number {
            return InputHandler._mouseDeltaX;
        }

        public static get MouseDeltaY(): number {
            return InputHandler._mouseDeltaY;
        }

        public static Update( dt: number ): void {
            // Reset input deltas.
            InputHandler._mouseDeltaX = 0;
            InputHandler._mouseDeltaY = 0;
        }

        public static IsKeyDown( keyCode: number ): boolean {
            return InputHandler._keys[keyCode] === true;
        }

        public static IsKeyUp( keyCode: number ): boolean {
            return InputHandler._keys[keyCode] === false;
        }

        private static onKeyDown( event: KeyboardEvent ): void {
            InputHandler._keys[event.keyCode] = true;
            Message.Send( InputEventMessage.KEY_DOWN, undefined, event );
        }

        private static onKeyUp( event: KeyboardEvent ): void {
            InputHandler._keys[event.keyCode] = false;
            Message.Send( InputEventMessage.KEY_UP, undefined, event );
        }

        private static onMouseDown( event: MouseEvent ): void {
            console.log( "down" );

            if ( !InputHandler.hasPointerLock() ) {
                InputHandler.requestPointerLock();
                return;
            }
            // TODO: Should be generic "fire weapon", which then fires the current weapon.
            if ( event.button === 0 ) {
                Message.Send( "LeftMouseDown", undefined );
            }
        }

        private static onMouseMove( event: MouseEvent ): void {
            if ( !InputHandler.hasPointerLock() ) {
                return;
            }

            if ( event.movementX !== 0 ) {
                InputHandler._mouseDeltaX += event.movementX;
            }
            if ( event.movementY !== 0 ) {
                InputHandler._mouseDeltaY += event.movementY;
            }
        }

        private static hasPointerLock(): boolean {
            return document.pointerLockElement === InputHandler._viewport;
        }

        private static requestPointerLock(): void {
            InputHandler._viewport.requestPointerLock();
        }

        private static onPointerLockChange(): void {
            if ( InputHandler.hasPointerLock() ) {
                document.addEventListener( "mousemove", InputHandler.onMouseMove, false );
                console.debug( "Pointer lock engaged." );

            } else {
                document.removeEventListener( "mousemove", InputHandler.onMouseMove, false );

                // Clear any deltas to avoid snapping issues during disengage.
                InputHandler._mouseDeltaX = 0;
                InputHandler._mouseDeltaY = 0;
                console.debug( "Pointer lock disengaged." );
            }
        }
    }
}