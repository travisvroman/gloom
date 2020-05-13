import { PerspectiveCamera, Scene, PlaneGeometry, MeshBasicMaterial, Color, Mesh, Camera, Vector2 } from "three";
import { Message } from "./Message";
import { InputEventMessage } from "./Core/InputEventMessage";
import { IMessageHandler } from "./IMessageHandler";
import { InputManager } from "./Core/InputManager";
import { TMath } from "./Core/TMath";
import { Level } from "./Level";

export class Game implements IMessageHandler {

    private _camera: PerspectiveCamera;
    private _level: Level;

    // TODO: move these
    private _angle: number = 0;
    private _movementSpeed: number = 5;



    public constructor() {

    }

    public get ActiveCamera(): Camera {
        return this._camera;
    }

    public get ActiveLevel(): Level {
        return this._level;
    }

    public OnStartup( aspect: number ): void {
        this._camera = new PerspectiveCamera( 45, aspect, 0.1, 1000 );
        this._camera.position.set( 0, 0, 2 );

        Message.Subscribe( InputEventMessage.KEY_DOWN, this );
        Message.Subscribe( InputEventMessage.KEY_UP, this );
    }

    public StartNew(): void {
        this._level = new Level();
        this._level.Load();
    }

    public Update( dt: number ): void {
        let movingForward: boolean;
        let movingBackward: boolean;
        let movingLeft: boolean;
        let movingRight: boolean;
        let turningLeft: boolean;
        let turningRight: boolean;

        movingForward = movingBackward = movingLeft = movingRight = turningLeft = turningRight = false;

        // W
        if ( InputManager.IsKeyDown( 87 ) ) {
            movingForward = true;
        }

        // S
        if ( InputManager.IsKeyDown( 83 ) ) {
            movingBackward = true;
        }

        // A
        if ( InputManager.IsKeyDown( 65 ) ) {
            movingLeft = true;
        }

        // D
        if ( InputManager.IsKeyDown( 68 ) ) {
            movingRight = true;
        }

        // Q
        if ( InputManager.IsKeyDown( 81 ) ) {
            turningLeft = true;
        }

        // E
        if ( InputManager.IsKeyDown( 69 ) ) {
            turningRight = true;
        }

        let velocity = new Vector2();
        if ( movingForward ) {
            velocity.x = -Math.sin( this._angle );
            velocity.y = -Math.cos( this._angle );
        }

        if ( movingBackward ) {
            velocity.x = Math.sin( this._angle );
            velocity.y = Math.cos( this._angle );
        }

        if ( movingLeft ) {
            velocity.x += Math.sin( this._angle - TMath.DegToRad( 90 ) );
            velocity.y += Math.cos( this._angle - TMath.DegToRad( 90 ) );
        }

        if ( movingRight ) {
            velocity.x += Math.sin( this._angle + TMath.DegToRad( 90 ) );
            velocity.y += Math.cos( this._angle + TMath.DegToRad( 90 ) );
        }

        velocity = velocity.normalize();
        velocity.x *= this._movementSpeed * dt;
        velocity.y *= this._movementSpeed * dt;

        this._camera.position.x += velocity.x;
        this._camera.position.z += velocity.y;

        if ( turningLeft ) {
            this._angle += 1.5 * dt;
        }

        if ( turningRight ) {
            this._angle -= 1.5 * dt;
        }

        this._camera.rotation.y = this._angle;
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