namespace FPS {

    export abstract class UIScreen {

        // Each screen has its own camera and scene.
        protected _scene: THREE.Scene;
        protected _camera: THREE.OrthographicCamera;
        protected _width: number;
        protected _height: number;
        protected _name: string;
        protected _isLoaded: boolean = false;

        protected _objects: UIObject[] = [];
        protected _loadingObjects: UIObject[] = [];

        public constructor( name: string, rawData: any, width: number, height: number ) {
            this._name = name;
            this.populateData( rawData );

            this._width = width;
            this._height = height;
            this._camera = new THREE.OrthographicCamera( this._width / - 2, this._width / 2, this._height / 2, this._height / - 2, 1, 20 );
            this._camera.position.z = 10;
            this._scene = new THREE.Scene();
        }

        public get IsLoaded(): boolean {
            return this._isLoaded;
        }

        public AddObject( object: UIObject ): void {

            // Note: This does not support nested objects. This can be added later if needed.
            if ( object.IsLoaded ) {
                this._objects.push( object );
                this._scene.add( object.Internal );
            } else {
                // Defer addition to scene until loaded.
                this._loadingObjects.push( object );
            }
        }

        public Update( dt: number ): void {

            // Update loading objects first.
            if ( this._loadingObjects.length > 0 ) {
                for ( let o of this._loadingObjects ) {
                    o.Update( dt );
                }

                // Check for objects which are now loaded, but were not on the last frame
                // and mark them to be transferred.
                let objectsNowLoaded: UIObject[] = [];
                for ( let o of this._loadingObjects ) {
                    if ( o.IsLoaded ) {
                        objectsNowLoaded.push( o );
                    }
                }

                // Remove now-loaded objects from loading-objects, transfer them and add them to the scene.
                for ( let o of objectsNowLoaded ) {
                    this._loadingObjects.splice( this._loadingObjects.indexOf( o ), 1 );
                    this._objects.push( o );
                    this._scene.add( o.Internal );
                }

                if ( this._loadingObjects.length === 0 ) {
                    this._isLoaded = true;
                    this.onLoaded();
                }
            }
            for ( let o of this._objects ) {
                o.Update( dt );
            }
        }

        public Render( renderer: THREE.WebGLRenderer, dt: number ): void {
            for ( let o of this._objects ) {
                o.Render( dt );
            }

            renderer.render( this._scene, this._camera );
        }
        protected onLoaded(): void {
            console.debug( "Screen loaded!" );
        }

        protected populateData( rawData: any ): void {
            // if ( Utilities.Exists( rawData.name ) ) {
            //     this._name = String( rawData.name );
            // } else {
            //     throw new Error( "Unable to create UIScreen as required parameter 'name' is missing!" );
            // }
        }
    }
}