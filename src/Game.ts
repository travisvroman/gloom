namespace FPS {

    export class Game implements IMessageHandler {

        private _camera: THREE.PerspectiveCamera;
        private _activeLevel: Level;
        private _mouseSensitivity: number = 0.1;
        private _weaponsManager: WeaponsManager;

        public constructor() {
            this._weaponsManager = new WeaponsManager( this );
        }

        public get ActiveCamera(): THREE.Camera {
            return this._camera;
        }

        public get ActiveLevel(): Level {
            return this._activeLevel;
        }

        public OnStartup( aspect: number ): void {

            this._camera = new THREE.PerspectiveCamera( 45, aspect, 0.1, 1000 );
            this._camera.position.set( 0, 0, 0 );

            this._camera.layers.enableAll();
            this._camera.layers.disable( ObjectMask.RAY_COLLISION );

            // Prepare some default values.
            DataManager.SetValue<THREE.Color>( DataName.PLAYER_POSITION_LIGHT_COLOR, new THREE.Color( 0xFFFFFF ) );

            Message.Subscribe( "LeftMouseDown", this );
            Message.Subscribe( "LEVEL_LOADED", this );
            Message.Subscribe( InputEventMessage.KEY_DOWN, this );
            Message.Subscribe( InputEventMessage.KEY_UP, this );
            Message.Subscribe( "WEAPON_PICKUP", this );
        }

        public StartNew(): void {
            Inventory.Initialize();
            this._weaponsManager.DefaultLoadout();

            // TODO: This should be menu driven!
            // Check to see if the level was overridden (from the editor, for example);
            const urlParams = new URLSearchParams( window.location.search );
            const levelOverride = urlParams.get( 'level' );
            if ( Utilities.Exists( levelOverride ) ) {
                this.loadLevelFile( `assets/maps/${levelOverride}.json` );
            } else {

                // Auto-load the first level for now.
                // TODO: Should be triggered from the UI.
                this.loadLevelFile( "assets/maps/A0M1.json" );
            }
        }

        public LoadExisting(): void {
            throw new Error( "Not yet implemented." );
        }

        public Update( dt: number ): void {
            this._weaponsManager.Update( dt );

            let playerIsMoving = false;
            if ( Utilities.Exists( this._activeLevel ) && this._activeLevel.IsLoaded ) {

                // TODO: move this to game.
                if ( InputHandler.MouseDeltaX !== 0 ) {
                    this._activeLevel.PlayerPawn.Turn( InputHandler.MouseDeltaX * this._mouseSensitivity );
                }

                // A
                if ( InputHandler.IsKeyDown( 65 ) ) {
                    //this._activeLevel.PlayerPawn.TurnLeft();
                    this._activeLevel.PlayerPawn.MoveLeft();
                    playerIsMoving = true;
                }

                // d
                if ( InputHandler.IsKeyDown( 68 ) ) {
                    //this._activeLevel.PlayerPawn.TurnRight();
                    this._activeLevel.PlayerPawn.MoveRight();
                    playerIsMoving = true;
                }

                // // q
                // if ( this._keys[81] ) {
                //     this._activeLevel.PlayerPawn.MoveLeft();
                //     playerIsMoving = true;
                // }

                // // e
                // if ( this._keys[69] ) {
                //     this._activeLevel.PlayerPawn.MoveRight();
                //     playerIsMoving = true;
                // }

                // // space
                // if ( this._keys[32] ) {

                //     this._camera.position.add( new THREE.Vector3( 0, 1, 0 ).multiplyScalar( moveSpeed ) );
                // }

                // // x
                // if ( this._keys[88] ) {
                //     this._camera.position.add( new THREE.Vector3( 0, -1, 0 ).multiplyScalar( moveSpeed ) );
                // }

                // w
                if ( InputHandler.IsKeyDown( 87 ) ) {
                    this._activeLevel.PlayerPawn.MoveForward();
                    playerIsMoving = true;
                }

                // s
                if ( InputHandler.IsKeyDown( 83 ) ) {
                    this._activeLevel.PlayerPawn.MoveBackward();
                    playerIsMoving = true;
                }

                // Make the camera's position and rotation match the control pawn.
                if ( Utilities.Exists( this._activeLevel.PlayerPawn ) ) {
                    let pawnPos = this._activeLevel.PlayerPawn.GetPosition();
                    this._camera.position.set( pawnPos.x, pawnPos.y, pawnPos.z );
                    let angle = this._activeLevel.PlayerPawn.GetAngle();
                    this._camera.quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), angle );

                    // TODO: Should probably only update this when it changes.
                    DataManager.SetValue<THREE.Color>( DataName.PLAYER_POSITION_LIGHT_COLOR, this._activeLevel.GetColorForPosition( pawnPos.x + 0.5, pawnPos.z + 0.5 ) );
                }

                // Update data values
                DataManager.SetValue<boolean>( DataName.PLAYER_IS_MOVING, playerIsMoving );

                // Update the level.
                this._activeLevel.Update( dt );
            }
        }

        public Render( renderer: THREE.WebGLRenderer, dt: number ): void {
            if ( Utilities.Exists( this._activeLevel ) ) {
                this._activeLevel.Render( dt, renderer, this._camera );
            }
        }

        public OnLevelLoaded( level: Level ): void {
            console.debug( "LEVEL_LOADED" );
            this._weaponsManager.SelectBestWeapon();
        }

        public OnKeyDown( event: KeyboardEvent ): void {

        }

        public OnKeyUp( event: KeyboardEvent ): void {
            if ( event.keyCode === 49 ) {//1
                this._weaponsManager.SelectWeapon( 1 );
            } else if ( event.keyCode === 50 ) {//2
                this._weaponsManager.SelectWeapon( 2 );
            }
        }

        public OnMessage( message: Message ): void {
            switch ( message.Code ) {
                case "LeftMouseDown":

                    // TODO: check if currently loaded in a game.
                    this._weaponsManager.ActiveWeapon.Fire();
                    break;
                case "LEVEL_LOADED":
                    this.OnLevelLoaded( message.Sender );
                    break;
                case InputEventMessage.KEY_UP:
                    this.OnKeyUp( message.Context as KeyboardEvent );
                    break;
                case InputEventMessage.KEY_DOWN:
                    this.OnKeyDown( message.Context as KeyboardEvent );
                    break;
                case "WEAPON_PICKUP":
                    this._weaponsManager.SelectIfBetter( message.Context as InventoryItem );
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
                if ( Utilities.Exists( this._activeLevel ) ) {
                    this._activeLevel.Unload();
                    this._activeLevel = undefined;
                }

                // Load up the new level.
                let obj = JSON.parse( xhr.responseText );
                let data = new LevelData( obj );

                this._activeLevel = new Level( data );
                this._activeLevel.Load();
            }
        }
    }
}