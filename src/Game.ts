import { PerspectiveCamera, Scene, PlaneGeometry, MeshBasicMaterial, Color, Mesh, Camera, Vector2 } from "three";
import { Message } from "./Message";
import { InputEventMessage } from "./Core/InputEventMessage";
import { IMessageHandler } from "./IMessageHandler";
import { InputManager } from "./Core/InputManager";
import { TMath } from "./Core/TMath";
import { Level } from "./Level/Level";
import { Utilities } from "./Core/Utilities";
import { LevelData } from "./Level/LevelData";

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

        // TODO: This should be menu driven!
        // Check to see if the level was overridden (from the editor, for example);
        const urlParams = new URLSearchParams( window.location.search );
        const levelOverride = urlParams.get( 'level' );
        if ( Utilities.Exists( levelOverride ) ) {
            this.loadLevelFile( `assets/maps/${levelOverride}.json` );
        } else {

            // Auto-load the first level for now.
            // TODO: Should be triggered from the UI.
            this.loadLevelFile( "assets/maps/A0M0.json" );
        }
    }

    public Update( dt: number ): void {

        if ( Utilities.Exists( this._level ) && this._level.IsLoaded ) {
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

    private loadLevelFile( filePath: string ): void {
        let xhr = new XMLHttpRequest();
        xhr.addEventListener( "load", this.onLevelFileLoaded.bind( this, xhr ) );
        // TODO: Error handling
        xhr.open( "GET", filePath );
        xhr.send();
    }

    private onLevelFileLoaded( xhr: XMLHttpRequest ): void {
        if ( xhr.status >= 200 && xhr.status < 300 ) {

            // Before loading a new level, unload the active level first.
            if ( Utilities.Exists( this._level ) ) {
                this._level.Unload();
                this._level = undefined;
            }

            // Load up the new level.
            let obj = JSON.parse( xhr.responseText );
            let data = new LevelData( obj );

            this._level = new Level( data );
            this._level.Load();
        }
    }
}