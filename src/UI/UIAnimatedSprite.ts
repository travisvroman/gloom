/// <reference path="UISprite.ts" />

namespace FPS {

    export class UIAnimatedSprite extends UISprite {

        private _defaultAnimation: string;
        private _animations: { [name: string]: AnimationData };
        private _activeAnimation: AnimationData;
        private _activeAnimationName: string;
        private _currentFrameIndex: number = 0;
        private _currentFrameTime: number = 0;
        private _frames: THREE.Vector2[];
        private _frameSizeX: number;
        private _frameSizeY: number;

        public constructor( rawData: any ) {
            super( rawData );
        }

        public get Width(): number {
            return this._frameSizeX;
        }

        public get Height(): number {
            return this._frameSizeY;
        }

        public get Scale(): THREE.Vector3 {
            // This overrides the default.
            // Because these are rendered with an orthographic matrix, the scale on these needs to be set at least to the 
            // size of the sprite in order to show up. I.E. If the image is 64x64, the scale should be set to 64, 64, 1.
            // The *configured* scale in the raw data is then multiplied against this to perform the *actual* scale.
            // Note that Z scale is ignored for sprites, and 1 is always used.

            if ( this._isLoaded ) {
                return new THREE.Vector3( this._internal.scale.x / this._frameSizeX, this._internal.scale.y / this._frameSizeY, 1 );
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
                this._internal.scale.set( this._frameSizeX * value.x, this._frameSizeY * value.y, 1 );
            } else {
                this._configuredScale.copy( value );
            }
        }

        public GetActiveAnimationName(): string {
            return this._activeAnimationName;
        }

        public SetAnimation( name: string ): void {

            if ( !Utilities.Exists( this._animations[name] ) ) {
                console.warn( "No animation exists named '" + name + "' on sprite '" + this.Name + "'" );
                return;
            }

            this._currentFrameIndex = 0;
            this._currentFrameTime = 0;
            this._activeAnimation = this._animations[name];
            this._activeAnimationName = name;

            this._texture.offset.x = this._frames[this._activeAnimation.Frames[this._currentFrameIndex]].x;
            this._texture.offset.y = this._frames[this._activeAnimation.Frames[this._currentFrameIndex]].y + ( this._frameSizeY / this._textureHeight );
        }

        public Update( dt: number ): void {
            super.Update( dt );

            if ( this._isLoaded ) {
                this._currentFrameTime += dt;
                if ( this._currentFrameTime >= ( ( 1 / this._activeAnimation.FramesPerSecond ) ) ) {
                    this._currentFrameIndex++;
                    this._currentFrameTime = 0;

                    // Wrap around if at the end of the sequence.
                    if ( this._currentFrameIndex >= this._activeAnimation.Frames.length ) {
                        if ( this._activeAnimation.Loop ) {
                            this._currentFrameIndex = 0;
                        } else {

                            // If not looping, set it back to the previous frame.
                            this._currentFrameIndex--;
                        }
                    }

                    this._texture.offset.x = this._frames[this._activeAnimation.Frames[this._currentFrameIndex]].x;
                    this._texture.offset.y = this._frames[this._activeAnimation.Frames[this._currentFrameIndex]].y + ( this._frameSizeY / this._textureHeight );
                }
            }
        }

        protected onLoaded(): void {
            super.onLoaded();

            // Because these are rendered with an orthographic matrix, the scale on these needs to be set at least to the 
            // size of the sprite in order to show up. I.E. If the image is 64x64, the scale should be set to 64, 64, 1.
            // The *configured* scale in the raw data is then multiplied against this to perform the *actual* scale.
            // Note that Z scale is ignored for sprites, and 1 is always used.
            this._internal.scale.set( this._frameSizeX * this._configuredScale.x, this._frameSizeY * this._configuredScale.y, 1 );

            this._activeAnimation = this._animations[this._defaultAnimation];
            this._activeAnimationName = this._defaultAnimation;
            this._currentFrameIndex = 0;

            let framesWide = Math.floor( this._textureWidth / this._frameSizeX );
            let framesHigh = Math.floor( this._textureHeight / this._frameSizeY );

            this._texture.wrapS = this._texture.wrapT = THREE.RepeatWrapping;
            this._texture.repeat.set( 1 / framesWide, 1 / framesHigh );

            // Work out the frame source rectangles. Left->right, top->bottom.
            for ( let y = 0; y < framesHigh; ++y ) {
                for ( let x = 0; x < framesWide; ++x ) {
                    let index = ( y * framesWide ) + x;
                    let pxLeft = x * this._frameSizeX;
                    let pxTop = y * this._frameSizeY;
                    this._frames[index] = new THREE.Vector2( pxLeft / this._textureWidth, pxTop / this._textureHeight );
                }
            }

            // Set initial frame.
            this.SetAnimation( this._defaultAnimation );
        }

        protected populateData( rawData: any ): void {
            super.populateData( rawData );

            this._animations = {};
            this._frames = [];

            if ( Utilities.Exists( rawData.defaultAnimation ) ) {
                this._defaultAnimation = String( rawData.defaultAnimation );
            } else {
                throw new Error( "Unable to create UIAnimatedSpriteData as required parameter 'defaultAnimation' is missing!" );
            }

            if ( Utilities.Exists( rawData.frameSizeX ) ) {
                this._frameSizeX = Number( rawData.frameSizeX );
            } else {
                throw new Error( "Unable to create UIAnimatedSpriteData as required parameter 'frameSizeX' is missing!" );
            }

            if ( Utilities.Exists( rawData.frameSizeY ) ) {
                this._frameSizeY = Number( rawData.frameSizeY );
            } else {
                throw new Error( "Unable to create UIAnimatedSpriteData as required parameter 'frameSizeY' is missing!" );
            }

            // Parse animations.
            if ( Utilities.Exists( rawData.animations ) ) {
                for ( let key of Object.keys( rawData.animations ) ) {
                    let anim = new AnimationData();
                    if ( Utilities.Exists( rawData.animations[key].frames ) ) {
                        anim.Frames = rawData.animations[key].frames as number[];
                    } else {
                        throw new Error( "Unable to create AnimationData as required parameter 'frames' on animation '" + key + "' is missing!" );
                    }

                    if ( Utilities.Exists( rawData.animations[key].framesPerSecond ) ) {
                        anim.FramesPerSecond = Number( rawData.animations[key].framesPerSecond );
                    } else {
                        throw new Error( "Unable to create AnimationData as required parameter 'framesPerSecond' on animation '" + key + "' is missing!" );
                    }

                    // Loop has a default of true and is not required.
                    if ( Utilities.Exists( rawData.animations[key].loop ) ) {
                        anim.Loop = Boolean( rawData.animations[key].loop );
                    }

                    this._animations[key] = anim;
                }
            } else {
                throw new Error( "Unable to create UIAnimatedSpriteData as required parameter 'animations' is missing!" );
            }
        }
    }
}