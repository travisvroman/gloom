import { WebGLRenderer, WebGLRendererParameters, Color } from "three";

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

    public OnResize( width: number, height: number ): void {
        this._internal.setSize( width, height );
    }
}