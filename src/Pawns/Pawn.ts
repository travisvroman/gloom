namespace FPS {

    export enum PawnUserData {
        ENTITY_TYPE = "PawnUserData.EntityType",
        PAWN_TYPE = "PawnUserData.PawnType",
        OWNER = "PawnUserData.Owner"
    }

    export enum PawnType {
        PLAYER = "PawnType.Player",
        ENEMY = "PawnType.Enemy"
    }

    export abstract class Pawn implements ISpawnable {

        private _physicsBody: Box2D.Dynamics.b2Body;
        protected _movementSpeed: number;
        private _physicsWorld: Box2D.Dynamics.b2World;
        private _isMovingForward: boolean = false;
        private _isMovingBackward: boolean = false;
        private _isMovingLeft: boolean = false;
        private _isMovingRight: boolean = false;
        private _isTurning: boolean = false;
        private _angle: number = 0;
        private _turnAmount: number = 0;
        private _spriteTexturePath: string;
        protected _sprite: THREE.Sprite;
        private _texture: THREE.Texture;
        private _material: THREE.SpriteMaterial;
        protected _level: Level;

        protected _defaultAnimation: string;
        protected _animations: { [name: string]: AnimationData };
        private _activeAnimation: AnimationData;
        private _activeAnimationName: string;
        private _currentFrameIndex: number = 0;
        private _currentFrameTime: number = 0;
        private _frames: THREE.Vector2[];
        protected _frameSizeX: number;
        protected _frameSizeY: number;
        protected _tint: THREE.Color = new THREE.Color( 0xFFFFFF );
        protected _isLoaded: boolean = false;
        protected _collisionMesh: THREE.Mesh;

        // TODO: Store this in a texture cache later.
        protected _textureWidth: number = 0;
        protected _textureHeight: number = 0;
        protected _yOffset: number = 0;

        public constructor( speed: number, pawnType: PawnType, spriteTexture: string, level: Level ) {
            this._movementSpeed = speed;
            this._spriteTexturePath = spriteTexture;
            this._level = level;
            this._animations = {};
            this._frames = [];
            
            if ( Utilities.Exists( this._spriteTexturePath ) ) {
                let loader = new THREE.TextureLoader();
                this._texture = loader.load( this._spriteTexturePath, this.onTextureLoaded.bind( this ) );
                this._material = new THREE.SpriteMaterial( { transparent: true, map: this._texture } );
                this._sprite = new THREE.Sprite( this._material );
                this._sprite.layers.disableAll();
                this._sprite.layers.enable( ObjectMask.SPRITE );
                this._sprite.userData[OBJECT_TYPE] = ObjectType.SPRITE;
            }

            let g = new THREE.CylinderGeometry( 0.2, 0.2, 1 );
            let m = new THREE.MeshBasicMaterial( { transparent: true } );
            this._collisionMesh = new THREE.Mesh( g, m );
            this._collisionMesh.layers.disableAll();
            this._collisionMesh.layers.enable( ObjectMask.RAY_COLLISION );
            this._collisionMesh.userData[OBJECT_TYPE] = ObjectType.RAY_COLLISION;
            this._collisionMesh.userData[PawnUserData.ENTITY_TYPE] = EntityType.PAWN;
            this._collisionMesh.userData[PawnUserData.PAWN_TYPE] = pawnType;
            this._collisionMesh.userData[PawnUserData.OWNER] = this;
            this._level.InternalScene.add( this._collisionMesh );
        }

        public GetActiveAnimationName(): string {
            return this._activeAnimationName;
        }

        public SetAnimation( name: string ): void {

            if ( !Utilities.Exists( this._animations[name] ) ) {
                console.warn( "No animation exists named '" + name + "' on pawn " );
                return;
            }

            this._currentFrameIndex = 0;
            this._currentFrameTime = 0;
            this._activeAnimation = this._animations[name];
            this._activeAnimationName = name;

            this._texture.offset.x = this._frames[this._activeAnimation.Frames[this._currentFrameIndex]].x;
            this._texture.offset.y = this._frames[this._activeAnimation.Frames[this._currentFrameIndex]].y + ( this._frameSizeY / this._textureHeight );
        }

        public SetPhysicsWorld( world: Box2D.Dynamics.b2World ): void {
            this._physicsWorld = world;
        }

        public GetAngle(): number {
            //return this._physicsBody.GetAngle();
            return this._angle;
        }

        public SetAngle( radians: number ): void {
            this._angle = radians;
        }

        public GetPosition(): THREE.Vector3 {
            let pos = this._physicsBody.GetPosition();
            return new THREE.Vector3( pos.x, 0, pos.y );
        }

        public Spawn( x: number, y: number ): void {
            if ( Utilities.Exists( this._physicsWorld ) ) {
                this.setupPhysics( x, y );

                // Move sprite to position.
                if ( Utilities.Exists( this._sprite ) ) {
                    this._sprite.position.set( x, this._yOffset, y );
                    this._level.InternalScene.add( this._sprite );
                }
            }
        }

        public Despawn(): void {
            if ( Utilities.Exists( this._physicsBody ) ) {

                // Disable physics
                this._physicsBody.GetFixtureList()[0].IsSensor = false;
                this._level.InternalScene.remove( this._sprite );
            }
        }

        public MoveForward(): void {
            this._isMovingForward = true;
        }

        public MoveBackward(): void {
            this._isMovingBackward = true;
        }

        public MoveLeft(): void {
            this._isMovingLeft = true;
        }

        public MoveRight(): void {
            this._isMovingRight = true;
        }

        public Turn( amount: number = 5 ): void {
            this._turnAmount = amount;
            this._isTurning = true;
        }

        public Update( dt: number ): void {

            // Turning
            if ( this._isTurning ) {
                this._angle -= ( this._turnAmount * dt );
            }

            // NOTE: Something is off here. Camera direction and phys move direction don't seem to match.
            let velocity = new Box2D.Common.Math.b2Vec2( 0, 0 );
            if ( this._isMovingForward ) {
                velocity.x = -Math.sin( this._angle );
                velocity.y = -Math.cos( this._angle );
            }

            if ( this._isMovingBackward ) {
                velocity.x = Math.sin( this._angle );
                velocity.y = Math.cos( this._angle );
            }

            if ( this._isMovingLeft ) {
                velocity.x += Math.sin( this._angle - THREE.Math.degToRad( 90 ) );
                velocity.y += Math.cos( this._angle - THREE.Math.degToRad( 90 ) );
            }

            if ( this._isMovingRight ) {
                velocity.x += Math.sin( this._angle + THREE.Math.degToRad( 90 ) );
                velocity.y += Math.cos( this._angle + THREE.Math.degToRad( 90 ) );
            }
            velocity.Normalize();
            velocity.x *= this._movementSpeed;
            velocity.y *= this._movementSpeed;
            this._physicsBody.SetLinearVelocity( velocity );

            if ( Utilities.Exists( this._sprite ) ) {
                this.updateSprite( dt );
            }

            this.updateCollisionMesh( dt );

            // Reset flags
            this._isMovingForward = false;
            this._isMovingBackward = false;
            this._isMovingLeft = false;
            this._isMovingRight = false;
            this._isTurning = false;
            this._turnAmount = 0;
        }

        protected abstract setupAnimations(): void;

        protected onDeath(): void {
            console.debug( "Pawn has died!", this );

            // TODO: Play sound effect
            this.SetAnimation( "die" );

            this._physicsBody.SetActive( false );
        }

        private updateSprite( dt: number ): void {
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
            if ( Utilities.Exists( this._sprite ) ) {
                let physicsPos = this._physicsBody.GetPosition();
                this._sprite.position.set( physicsPos.x, this._yOffset, physicsPos.y );
            }
        }

        private updateCollisionMesh( dt: number ): void {
            let physicsPos = this._physicsBody.GetPosition();
            this._collisionMesh.position.set( physicsPos.x, 0, physicsPos.y );
        }

        private setupPhysics( x: number, y: number ): void {

            if ( !Utilities.Exists( this._physicsBody ) ) {
                // Setup physics object for this
                let bodyDef = new Box2D.Dynamics.b2BodyDef();
                bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
                bodyDef.position.Set( x, y );
                bodyDef.fixedRotation = true;
                bodyDef.linearDamping = 10;
                bodyDef.angularDamping = 1;
                bodyDef.bullet = false;
                bodyDef.allowSleep = false;
                this._physicsBody = this._physicsWorld.CreateBody( bodyDef );
                this._physicsBody.SetUserData( this );
                let colShape = new Box2D.Collision.Shapes.b2CircleShape( 0.2 );
                var bodyFixtureDef = new Box2D.Dynamics.b2FixtureDef();
                bodyFixtureDef.shape = colShape;
                // bodyFixtureDef.density = config.Density;
                // bodyFixtureDef.friction = config.Friction;
                // bodyFixtureDef.restitution = config.Restitution;
                this._physicsBody.CreateFixture( bodyFixtureDef );
            } else {
                this._physicsBody.GetFixtureList()[0].IsSensor = false;
                this._physicsBody.SetPosition( new Box2D.Common.Math.b2Vec2( x, y ) );

                this._collisionMesh.position.set( x, 0, y );
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

            // onloaded
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

            this.setupAnimations();

            // Set initial frame.
            this.SetAnimation( this._defaultAnimation );

            this._isLoaded = true;
        }
    }
}