import * as Box2D from "@flyover/box2d"
import { Scene, PlaneGeometry, MeshBasicMaterial, Color, Mesh } from "three";
import { Renderer } from "./Core/Renderer";

export class Level {

    private _scene: Scene;
    private _physicsWorld: Box2D.b2World;

    public get InternalScene(): Scene {
        return this._scene;
    }

    public Load(): void {
        this._scene = new Scene();
        // Test geometry
        let geometry = new PlaneGeometry( 1, 1, 1, 1 );
        let material = new MeshBasicMaterial( { color: new Color( "#FF6600" ) } );
        let mesh = new Mesh( geometry, material );
        this._scene.add( mesh );

        this._physicsWorld = new Box2D.b2World( new Box2D.b2Vec2( 0, 0 ) );
    }
}