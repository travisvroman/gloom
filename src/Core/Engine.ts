namespace FPS {

    enum EngineState {
        STARTING,
        CORE_LOADING,
        RUNNING
    }

    export class Engine {

        // TODO: move this to level.
        private _state: EngineState = EngineState.STARTING;

        private _renderer: THREE.WebGLRenderer;
        private _gameTime: number = 0;
        private _gameArea: HTMLDivElement;
        private _viewport: HTMLCanvasElement;
        private _aspect: number;
        private _stats: Stats;
        private _game: Game;
        private _ui: UIManager;

        public constructor() {
            this._game = new Game();
        }

        public Start( gameAreaElementId: string, canvasElementId: string, width: number, height: number ): void {
            console.log( "Engine start!" );

            this._stats = new Stats();

            if ( Utilities.Exists( gameAreaElementId ) ) {
                this._gameArea = document.getElementById( gameAreaElementId ) as HTMLDivElement;
            } else {
                throw new Error( "gameAreaElementId is required." );
            }


            if ( Utilities.Exists( canvasElementId ) ) {
                this._viewport = document.getElementById( canvasElementId ) as HTMLCanvasElement;
            } else {
                throw new Error( "canvasElementId is required." );
            }

            InputHandler.Initialize( this._viewport );
            BitmapFontManager.Initialize();
            AudioManager.Initialize();

            // Set canvas to specified physical size
            this._viewport.width = width;
            this._viewport.height = height;

            // Calculate aspect ratio.
            if ( width > height ) {
                this._aspect = width / height;
            } else {
                this._aspect = width / height;
            }

            this._renderer = new THREE.WebGLRenderer( { canvas: this._viewport } );
            this._renderer.setClearColor( new THREE.Color( 0.8, 0.8, 1 ) );
            this._renderer.setSize( width, height );

            // Events
            window.addEventListener( "resize", this.onWindowResize.bind( this ) );



            // Call the resize routine manually once to set everything correctly.
            this.onWindowResize();

            this._stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
            document.body.appendChild( this._stats.dom );

            // Startup process for the game
            this._game.OnStartup( this._aspect );

            this._state = EngineState.CORE_LOADING;

            // Kick off loop.
            this.loop( 0 );
        }

        private loop( gameTime: number ): void {
            this._stats.begin();
            requestAnimationFrame( this.loop.bind( this ) );

            let lastTime = this._gameTime;
            this._gameTime = gameTime;

            // Delta time is used everywhere else
            let delta = this._gameTime - lastTime;
            delta *= 0.001; // convert to seconds

            switch ( this._state ) {
                case EngineState.CORE_LOADING:
                    this.updateCoreLoading( delta );
                    break;
                case EngineState.RUNNING:
                    this.update( delta );
                    break;
            }

            this._stats.end();
        }

        private updateCoreLoading( dt: number ): void {
            if ( !BitmapFontManager.IsLoaded() || !AudioManager.IsLoaded() ) {
                return;
            }
            if ( !Utilities.Exists( this._ui ) ) {
                this._ui = new UIManager( this._viewport.width, this._viewport.height );                
            }
            this._ui.Update( dt );
            if ( this._ui.IsLoaded() ) {
                console.debug( "Core loading complete!" );

                // HACK: This needs to be driven by the menu - starts off the first level
                this._game.StartNew();

                this._state = EngineState.RUNNING;
            }
        }

        private update( dt: number ): void {

            this._renderer.autoClear = true;

            // Render the game, typically the world.
            this._game.Update( dt );
            this._game.Render( this._renderer, dt );

            this._renderer.autoClear = false;
            this._renderer.clearDepth();

            InputHandler.Update( dt );

            this._ui.Update( dt );

            // Render the UI
            this._ui.Render( this._renderer, dt );
        }

        private onWindowResize(): void {
            let width: number;
            let height: number;
            let windowAspect = window.innerWidth / window.innerHeight
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

            if ( Utilities.Exists( this._ui ) ) {
                this._ui.OnResize( this._viewport.width, this._viewport.height );
            }
        }
    }
}