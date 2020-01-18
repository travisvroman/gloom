import { WebGLRenderer, WebGLRendererParameters } from "three";

export class Renderer {

    private _internal: WebGLRenderer;

    public constructor( canvasElement: HTMLCanvasElement ) {
        let params: WebGLRendererParameters = {
            canvas: canvasElement
        };
        this._internal = new WebGLRenderer( params );
    }
}