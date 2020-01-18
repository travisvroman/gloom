import { Renderer } from "./Renderer";
import * as Box2D from "@flyover/box2d"

export class Engine {

    private _renderer: Renderer;

    private _physicsWorld: Box2D.b2World;

    public constructor( canvas: HTMLCanvasElement ) {
        this._renderer = new Renderer( canvas );
        this._physicsWorld = new Box2D.b2World( new Box2D.b2Vec2( 0, 0 ) );
    }

    public Start(): void {

        console.log("Started!");
    }
}