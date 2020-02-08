import { PerspectiveCamera, Scene, PlaneGeometry, MeshBasicMaterial, Color, Mesh, Camera } from "three";
import { Message } from "./Message";
import { InputEventMessage } from "./Core/InputEventMessage";
import { IMessageHandler } from "./IMessageHandler";
import * as Box2D from "@flyover/box2d"
import { InputManager } from "./Core/InputManager";

export class Game implements IMessageHandler {

    // TODO: move these
    private _camera: PerspectiveCamera;
    private _scene: Scene;

    private _physicsWorld: Box2D.b2World;

    public constructor() {

    }

    public get ActiveCamera(): Camera {
        return this._camera;
    }

    public get ActiveScene(): Scene {
        return this._scene;
    }

    public OnStartup( aspect: number ): void {
        this._camera = new PerspectiveCamera( 45, aspect, 0.1, 1000 );
        this._camera.position.set( 0, 0, 2 );

        Message.Subscribe( InputEventMessage.KEY_DOWN, this );
        Message.Subscribe( InputEventMessage.KEY_UP, this );
    }

    public StartNew(): void {
        this._scene = new Scene();
        // Test geometry
        let geometry = new PlaneGeometry( 1, 1, 1, 1 );
        let material = new MeshBasicMaterial( { color: new Color( "#FF6600" ) } );
        let mesh = new Mesh( geometry, material );
        this._scene.add( mesh );

        this._physicsWorld = new Box2D.b2World( new Box2D.b2Vec2( 0, 0 ) );
    }

    public Update( dt: number ): void {
        // W
        if ( InputManager.IsKeyDown( 87 ) ) {
            this._camera.position.z -= 5 * dt;
        }

        // S
        if ( InputManager.IsKeyDown( 83 ) ) {
            this._camera.position.z += 5 * dt;
        }
    }

    public LoadExisting(): void {
        throw new Error( "Not yet implemented." );
    }

    public OnKeyDown( event: KeyboardEvent ): void {

    }

    public OnKeyUp( event: KeyboardEvent ): void {

    }

    public OnMessage( message: Message ): void {
        switch ( message.Code ) {
            case InputEventMessage.KEY_UP:
                this.OnKeyUp( message.Context as KeyboardEvent );
                break;
            case InputEventMessage.KEY_DOWN:
                this.OnKeyDown( message.Context as KeyboardEvent );
                break;
        }
    }
}