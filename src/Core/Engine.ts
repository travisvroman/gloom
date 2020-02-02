import { Renderer } from "./Renderer";
import * as Box2D from "@flyover/box2d"

export class Engine {

    private _renderer: Renderer;
    private _gameArea: HTMLDivElement;
    private _viewport: HTMLCanvasElement;
    private _aspect: number;
    private _gameTime: number = 0;

    private _physicsWorld: Box2D.b2World;

    public constructor( canvas: HTMLCanvasElement, gameArea: HTMLDivElement ) {
        this._viewport = canvas;
        this._gameArea = gameArea;
        this._renderer = new Renderer( canvas );
        this._physicsWorld = new Box2D.b2World( new Box2D.b2Vec2( 0, 0 ) );
    }

    public Start( width: number, height: number ): void {

        console.log( "Started!" );

        // Set canvas to specified physical size
        this._viewport.width = width;
        this._viewport.height = height;

        // Calculate aspect ratio.
        if ( width > height ) {
            this._aspect = width / height;
        } else {
            this._aspect = height / width;
        }

        // TODO: Set renderer size

        // Events
        window.addEventListener( "resize", this.onWindowResize.bind( this ) );

        // Call the resize routine manually once to set everything correctly.
        this.onWindowResize();

        // Kick off loop.
        this.loop( 0 );
    }

    private update( dt: number ): void {
        this._renderer.Update( dt );
    }

    private loop( gameTime: number ): void {
        requestAnimationFrame( this.loop.bind( this ) );

        let lastTime = this._gameTime;
        this._gameTime = gameTime;

        // Delta time is used everywhere else
        let delta = this._gameTime - lastTime;
        delta *= 0.001; // convert to seconds

        this.update( delta );
    }

    private onWindowResize(): void {
        let width: number;
        let height: number;
        let windowAspect = window.innerWidth / window.innerHeight;
        if ( windowAspect >= this._aspect ) {

            // Horizontal
            height = window.innerHeight;
            width = height * this._aspect;
        } else {

            // Vertical
            width = window.innerWidth;
            height = width / this._aspect;
        }

        this._gameArea.style.width = width + "px";
        this._gameArea.style.height = height + "px";

        this._gameArea.style.marginLeft = ( -( width / 2 ) ) + "px";
        this._gameArea.style.marginTop = ( -( height / 2 ) ) + "px";

        this._renderer.OnResize( width, height );
    }
}