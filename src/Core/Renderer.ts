import { WebGLRenderer, WebGLRendererParameters, Color, Scene, Camera } from "three";
import { Level } from "../Level/Level";

export class Renderer {

    private _internal: WebGLRenderer;

    public constructor( canvasElement: HTMLCanvasElement ) {
        let params: WebGLRendererParameters = {
            canvas: canvasElement
        };
        this._internal = new WebGLRenderer( params );

        this._internal.setClearColor( new Color( 0.8, 0.8, 1 ) );
    }

    public Update( dt: number ): void {
        this._internal.clear();
    }

    public Render( dt: number, level: Level, camera: Camera ): void {
        this._internal.render( level.InternalScene, camera );
    }

    public OnResize( width: number, height: number ): void {
        this._internal.setSize( width, height );
    }
}