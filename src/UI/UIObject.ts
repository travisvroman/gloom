namespace FPS {

    export abstract class UIObject {

        protected _configuredPosition: THREE.Vector3 = new THREE.Vector3();
        protected _configuredScale: THREE.Vector3 = new THREE.Vector3( 1, 1, 1 );

        protected _isDirty: boolean = false;
        protected _internal: THREE.Object3D;
        protected _isLoaded: boolean = false;
        protected _scene: THREE.Scene;

        public Name: string;

        public constructor( rawData: any ) {
            this.populateData( rawData );
        }

        public get Internal(): THREE.Object3D {
            return this._internal;
        }

        public get IsVisible(): boolean {
            return this._internal.visible;
        }

        public set IsVisible( value: boolean ) {
            this._internal.visible = value;
        }

        public get IsLoaded(): boolean {
            return this._isLoaded;
        }

        public get Position(): THREE.Vector3 {
            if ( this._isLoaded ) {
                return this._internal.position;
            } else {
                return this._configuredPosition;
            }
        }

        public set Position( value: THREE.Vector3 ) {
            if ( this._isLoaded ) {
                this._internal.position.copy( value );
            } else {
                this._configuredPosition.copy( value );
            }
        }

        public get Scale(): THREE.Vector3 {
            if ( this._isLoaded ) {
                return this._internal.scale;
            } else {
                return this._configuredScale;
            }
        }

        public set Scale( value: THREE.Vector3 ) {
            if ( this._isLoaded ) {
                this._internal.scale.copy( value );
            } else {
                this._configuredScale.copy( value );
            }
        }


        public Update( dt: number ): void {

        }

        public Render( dt: number ): void {

        }

        protected onLoaded(): void {
            this._internal.position.copy( this._configuredPosition );
            
            this._isDirty = false;
            this._isLoaded = true;
        }

        protected populateData( rawData: any ): void {
            if ( Utilities.Exists( rawData.name ) ) {
                this.Name = String( rawData.name );
            } else {
                throw new Error( "Unable to create UIObjectData as required parameter 'name' is missing!" );
            }

            if ( Utilities.Exists( rawData.position ) ) {
                if ( Utilities.Exists( rawData.position.x ) ) {
                    this.Position.x = Number( rawData.position.x );
                }

                if ( Utilities.Exists( rawData.position.y ) ) {
                    this.Position.y = Number( rawData.position.y );
                }

                if ( Utilities.Exists( rawData.position.z ) ) {
                    this.Position.z = Number( rawData.position.z );
                }
            }

            if ( Utilities.Exists( rawData.scale ) ) {
                if ( Utilities.Exists( rawData.scale.x ) ) {
                    this.Scale.x = Number( rawData.scale.x );
                }

                if ( Utilities.Exists( rawData.scale.y ) ) {
                    this.Scale.y = Number( rawData.scale.y );
                }

                if ( Utilities.Exists( rawData.scale.z ) ) {
                    this.Scale.z = Number( rawData.scale.z );
                }
            }
        }
    }
}