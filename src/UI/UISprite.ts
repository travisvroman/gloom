/// <reference path="UIObject.ts" />
namespace FPS {


    export class UISprite extends UIObject {

        protected _spriteTexturePath: string;
        protected _tint: THREE.Color = new THREE.Color( 0xFFFFFF );

        // TODO: Store this in a texture cache later.
        protected _texture: THREE.Texture;
        protected _material: THREE.SpriteMaterial;
        protected _textureWidth: number = 0;
        protected _textureHeight: number = 0;

        public constructor( rawData: any ) {
            super( rawData );
            this._isDirty = true;
        }

        public get SpriteTexturePath(): string {
            return this._spriteTexturePath;
        }

        public set SpriteTexturePath( value: string ) {
            this._spriteTexturePath = value;
            this._isDirty = false;
        }

        public get Width(): number {
            return this._textureWidth;
        }

        public get Height(): number {
            return this._textureHeight;
        }

        public get Scale(): THREE.Vector3 {
            // This overrides the default.
            // Because these are rendered with an orthographic matrix, the scale on these needs to be set at least to the 
            // size of the sprite in order to show up. I.E. If the image is 64x64, the scale should be set to 64, 64, 1.
            // The *configured* scale in the raw data is then multiplied against this to perform the *actual* scale.
            // Note that Z scale is ignored for sprites, and 1 is always used.

            if ( this._isLoaded ) {
                return new THREE.Vector3( this._internal.scale.x / this._textureWidth, this._internal.scale.y / this._textureHeight, 1 );
            } else {
                return this._configuredScale;
            }
        }

        public set Scale( value: THREE.Vector3 ) {

            // This overrides the default.
            // Because these are rendered with an orthographic matrix, the scale on these needs to be set at least to the 
            // size of the sprite in order to show up. I.E. If the image is 64x64, the scale should be set to 64, 64, 1.
            // The *configured* scale in the raw data is then multiplied against this to perform the *actual* scale.
            // Note that Z scale is ignored for sprites, and 1 is always used.

            if ( this._isLoaded ) {
                this._internal.scale.set( this._textureWidth * value.x, this._textureHeight * value.y, 1 );
            } else {
                this._configuredScale.copy( value );
            }
        }

        public get Tint(): THREE.Color {
            if ( this._isLoaded ) {
                return this._material.color;
            }
            return this._tint;
        }

        public set Tint( value: THREE.Color ) {
            this._tint = value;
            if ( this._isLoaded ) {
                this._material.color = value;
            }
        }

        public Update( dt: number ): void {
            if ( this._isDirty ) {
                if ( Utilities.Exists( this._texture ) ) {
                    // TODO: Release from texture cache instead.
                    this._texture.dispose();
                    this._texture = undefined;
                }

                // Kick off the texture load. TODO: Get this from texture cache.
                this._texture = new THREE.TextureLoader().load( this._spriteTexturePath, this.onTextureLoaded.bind( this ) );

                // Make sure the tint is set.
                if ( Utilities.Exists( this._material ) ) {
                    this._material.color = this._tint;
                }

                this._isDirty = false;
            }
        }

        protected populateData( rawData: any ): void {
            super.populateData( rawData );

            if ( Utilities.Exists( rawData.spriteTexturePath ) ) {
                this.SpriteTexturePath = String( rawData.spriteTexturePath );
            } else {
                throw new Error( "Unable to create UISpriteData as required parameter 'spriteTexturePath' is missing!" );
            }
        }

        private onTextureLoaded( texture: THREE.Texture ): void {

            this._textureWidth = Number( texture.image.width );
            this._textureHeight = Number( texture.image.height );

            // NOTE: This should probably be configurable, but for this game this will always be needed.
            this._texture.minFilter = THREE.NearestFilter;
            this._texture.magFilter = THREE.NearestFilter;

            if ( !Utilities.Exists( this._material ) ) {
                this._material = new THREE.SpriteMaterial( { map: this._texture, color: 0xffffff } );
            } else {
                this._material.map = this._texture;
            }

            // Make sure the tint is set.
            this._material.color = this._tint;

            this._internal = new THREE.Sprite( this._material );

            // Because these are rendered with an orthographic matrix, the scale on these needs to be set at least to the 
            // size of the sprite in order to show up. I.E. If the image is 64x64, the scale should be set to 64, 64, 1.
            // The *configured* scale in the raw data is then multiplied against this to perform the *actual* scale.
            // Note that Z scale is ignored for sprites, and 1 is always used.
            this._internal.scale.set( this._textureWidth * this._configuredScale.x, this._textureHeight * this._configuredScale.y, 1 );

            this.onLoaded();
        }
    }
}