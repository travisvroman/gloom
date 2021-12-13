/// <reference path="../BaseEntity.ts" />

namespace FPS {

    enum DoorState {
        CLOSED,
        OPENING,
        OPEN,
        CLOSING
    }

    export enum DoorDirection {
        NORTH_SOUTH,
        EAST_WEST
    }

    export class Door extends BaseEntity implements ITriggerable {

        private _gridPosition: THREE.Vector2;
        private _level: Level;
        private _doorState: DoorState;
        private _physicsBody: Box2D.Dynamics.b2Body;
        private _fixture: Box2D.Dynamics.b2Fixture;
        private _spriteTexturePath: string;
        private _direction: DoorDirection;
        private _material: THREE.Material;
        private _mesh: THREE.Mesh;

        private _openY: number = 1;
        private _closedY: number = 0;
        private _rate: number = 2;
        private _holdTime: number = 5;
        private _openTime: number = 0;
        private _requiredItem: InventoryItem;

        public constructor( gridPosition: THREE.Vector2, spriteTexturePath: string, direction: DoorDirection, level: Level, requiredItem?: InventoryItem ) {
            super();
            this._gridPosition = gridPosition;
            this._level = level;
            this._doorState = DoorState.CLOSED;
            this._spriteTexturePath = spriteTexturePath;
            this._direction = direction;
            this._requiredItem = requiredItem;

            // Geometry/mesh
            //let wallGeom = new THREE.PlaneGeometry( 1, 1, 1, 1 );
            let wallGeom = new THREE.PlaneGeometry( 1, 1, 1, 1 );

            // Assign vertex light colours
            let lightColour = level.GetColorForPosition( this._gridPosition.x, this._gridPosition.y );
            Utilities.AssignVertexColour( wallGeom, lightColour );

            let loader = new THREE.TextureLoader();
            let tex = loader.load( this._spriteTexturePath );
            this._material = new THREE.MeshBasicMaterial( { map: tex, side: THREE.DoubleSide } );

            // Assign texture coordinates for this mesh.
            //Utilities.SetPlaneTexCoordsFromSourceRect2( sourceRect, texWidth, texHeight, wallGeom.faceVertexUvs[0], false, true );

            // Perform required rotations.
            if ( this._direction === DoorDirection.EAST_WEST ) {
                wallGeom.rotateY( THREE.Math.degToRad( 90 ) );
            }

            this._mesh = new THREE.Mesh( wallGeom, this._material );
            this._mesh.position.set( this._gridPosition.x, 0, this._gridPosition.y );
            this._level.InternalScene.add( this._mesh );

            // Setup physics object for this. Active if closed; otherwise inactive.
            let bodyDef = new Box2D.Dynamics.b2BodyDef();
            bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
            bodyDef.position.Set( this._gridPosition.x, this._gridPosition.y );
            this._physicsBody = this._level.InternalPhysicsWorld.CreateBody( bodyDef );
            let colShape = new Box2D.Collision.Shapes.b2PolygonShape();
            colShape.SetAsBox( 0.5, 0.5 );
            var bodyFixtureDef = new Box2D.Dynamics.b2FixtureDef();
            bodyFixtureDef.shape = colShape;
            this._fixture = this._physicsBody.CreateFixture( bodyFixtureDef );
        }

        public Destroy(): void {
            this._gridPosition = undefined;
            this._level = undefined;
        }

        public Trigger( trigger: Trigger ): boolean {
            if ( this._doorState === DoorState.CLOSED || this._doorState === DoorState.CLOSING ) {
                if ( this._doorState === DoorState.CLOSED ) {
                    if ( Utilities.Exists( this._requiredItem ) && !Inventory.HasItem( this._requiredItem ) ) {

                        // TODO: Translate this to a user-friendly item name.
                        Message.Send( "SHOW_MESSAGE", this, "You need the " + this._requiredItem.toString() + "!" );
                        return false;
                    }

                    AudioManager.PlaySoundEffect( "doorOpen" );
                    // Deactivate physics.
                    this._physicsBody.SetActive( false );
                }
                this._doorState = DoorState.OPENING;
            }
            return true;
        }

        public Update( dt: number ): void {
            if ( this._doorState === DoorState.OPENING ) {
                this._mesh.position.y += ( this._rate * dt );
                if ( this._mesh.position.y >= this._openY ) {
                    this._mesh.position.y = this._openY;
                    this._doorState = DoorState.OPEN;
                }
            } else if ( this._doorState === DoorState.CLOSING ) {
                this._mesh.position.y -= ( this._rate * dt );
                if ( this._mesh.position.y <= this._closedY ) {
                    this._mesh.position.y = this._closedY;
                    this._doorState = DoorState.CLOSED;

                    // Reactivate physics
                    this._physicsBody.SetActive( true );
                }
            } else if ( this._doorState === DoorState.OPEN ) {
                this._openTime += dt;
                if ( this._openTime >= this._holdTime ) {
                    this._doorState = DoorState.CLOSING;
                    this._openTime = 0;
                    AudioManager.PlaySoundEffect( "doorOpen" );
                }
            }
        }


    }
}