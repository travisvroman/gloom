namespace FPS {

    export const OBJECT_TYPE: string = "ObjectType";

    export enum SectorType {
        NONE = 0,
        OPEN = 1,
        WALL = 2
    }

    export enum ObjectMask {
        LEVEL_GEOMETRY = 0,
        SPRITE = 1,
        RAY_COLLISION = 2
    }

    export enum ObjectType {
        LEVEL_GEOMETRY = 0,
        SPRITE = 1,
        RAY_COLLISION = 2,
        ENTITY = 3
    }

    export class Sector {
        public Type: SectorType = SectorType.NONE;
        public LightColour: string = "#FFFFFF";

        public readonly X: number;
        public readonly Y: number;

        public constructor( type: SectorType, lightColor: string, x: number, y: number ) {
            this.Type = type;
            this.LightColour = lightColor;
            this.X = x;
            this.Y = y;
        }
    }

    class EntityData {
        public Name: string;
        public Type: EntityType;
        public GridPosition: THREE.Vector2 = new THREE.Vector2( 0, 0 );
        public RawData: any;

        public constructor( rawData: any ) {
            this.RawData = rawData;
            if ( !Utilities.Exists( rawData.name ) ) {
                throw new Error( "Cannot create EntityData due to missing name." );
            }
            this.Name = String( rawData.name );

            if ( !Utilities.Exists( rawData.type ) ) {
                throw new Error( "Cannot create EntityData due to missing type." );
            }
            this.Type = rawData.type as EntityType;

            if ( !Utilities.Exists( rawData.gridPosition ) ) {
                throw new Error( "Cannot create EntityData due to missing gridPosition." );
            } else {
                if ( Utilities.Exists( rawData.gridPosition.x ) ) {
                    this.GridPosition.x = Number( rawData.gridPosition.x );
                }
                if ( Utilities.Exists( rawData.gridPosition.y ) ) {
                    this.GridPosition.y = Number( rawData.gridPosition.y );
                }
            }

        }
    }

    export class LevelData {

        public Width: number;
        public Length: number;
        public Sectors: Sector[][] = [];
        public TileMapPath: string;
        public TileWidth: number;
        public TileHeight: number;

        public WallTextureIDs: number[][] = [];
        public FloorTextureIDs: number[][] = [];
        public CeilingTextureIDs: number[][] = [];

        public SpawnPosition: THREE.Vector2;

        public Entities: { [name: string]: EntityData } = {};

        public constructor( rawJson: any ) {

            if ( !Utilities.Exists( rawJson.spawnPosition ) || !Utilities.Exists( rawJson.spawnPosition.x ) || !Utilities.Exists( rawJson.spawnPosition.y ) ) {
                throw new Error( "Unable to load map due to missing or invalid spawn position." );
            }
            this.SpawnPosition = new THREE.Vector2( Number( rawJson.spawnPosition.x ), Number( rawJson.spawnPosition.y ) );

            if ( !Utilities.Exists( rawJson.width ) ) {
                throw new Error( "Unable to load map due to missing width parameter." );
            }
            this.Width = Number( rawJson.width );

            if ( !Utilities.Exists( rawJson.length ) ) {
                throw new Error( "Unable to load map due to missing length parameter." );
            }
            this.Length = Number( rawJson.length );

            if ( !Utilities.Exists( rawJson.tilemap ) ) {
                throw new Error( "Unable to load map due to missing tilemap parameter." );
            }
            this.TileMapPath = String( rawJson.tilemap );

            if ( !Utilities.Exists( rawJson.tileWidth ) ) {
                throw new Error( "Unable to load map due to missing tileWidth parameter." );
            }
            this.TileWidth = Number( rawJson.tileWidth );

            if ( !Utilities.Exists( rawJson.tileHeight ) ) {
                throw new Error( "Unable to load map due to missing tileHeight parameter." );
            }
            this.TileHeight = Number( rawJson.tileHeight );

            this.WallTextureIDs = rawJson.wallTextureIDs;
            this.FloorTextureIDs = rawJson.floorTextureIDs;
            this.CeilingTextureIDs = rawJson.ceilingTextureIDs;

            for ( let y = 0; y < this.Length; y++ ) {
                this.Sectors[y] = [];
                for ( let x = 0; x < this.Width; x++ ) {
                    this.Sectors[y].push( new Sector( rawJson.sectorTypes[y][x], rawJson.lightColors[y][x], x, y ) );
                }
            }

            if ( !Utilities.Exists( rawJson.entities ) ) {
                throw new Error( "Unable to load map due to missing entities parameter." );
            } else {
                for ( let rawEntity of rawJson.entities ) {
                    let entity = new EntityData( rawEntity );
                    this.Entities[entity.Name] = entity;
                }
            }
        }
    }

    class DeferredPawnSpawnInfo {
        public X: number;
        public Y: number;
        public Pawn: Pawn;

        public constructor( x: number, y: number, pawn: Pawn ) {
            this.X = x;
            this.Y = y;
            this.Pawn = pawn;
        }
    }

    export class Level {

        private _scene: THREE.Scene;
        private _isLoaded: boolean = false;
        private _data: LevelData;

        private _physicsWorld: Box2D.Dynamics.b2World;

        private _pawns: Pawn[] = [];
        private _pendingPawns: DeferredPawnSpawnInfo[] = [];
        private _tilemapTexture: THREE.Texture;
        private _tilemapTilesWide: number;
        private _tilemapTilesHigh: number;
        private _mapMaterial: THREE.Material;

        private _sectorLightColours: THREE.Color[][] = [];
        private _loadTriggers: Trigger[] = [];
        private _activeTriggers: Trigger[] = [];
        private _interactiveTriggers: Trigger[] = [];
        private _playerSpawnerFound: boolean = false;

        private _entities: IEntity[] = [];

        public PlayerPawn: Pawn;

        public constructor( data: LevelData ) {
            this._data = data;
            this._scene = new THREE.Scene();

        }

        public get InternalScene(): THREE.Scene {
            return this._scene;
        }

        public get InternalPhysicsWorld(): Box2D.Dynamics.b2World {
            return this._physicsWorld;
        }

        public get IsLoaded(): boolean {
            return this._isLoaded;
        }

        public get SpawnPosition(): THREE.Vector2 {
            return this._data.SpawnPosition;
        }

        public GetChildren( mask?: THREE.Layers ): THREE.Object3D[] {
            let children: THREE.Object3D[] = [];
            for ( let c of this._scene.children ) {
                if ( !Utilities.Exists( mask ) || ( Utilities.Exists( mask ) && c.layers.test( mask ) ) ) {
                    children.push( c );
                    let cc = this.r_GetChildren( c, mask );
                    children.concat( cc );
                }
            }

            return children;
        }

        private r_GetChildren( parent: THREE.Object3D, mask?: THREE.Layers ): THREE.Object3D[] {
            let children: THREE.Object3D[] = [];
            for ( let c of parent.children ) {
                if ( !Utilities.Exists( mask ) || ( Utilities.Exists( mask ) && c.layers.test( mask ) ) ) {
                    children.push( c );
                    let cc = this.r_GetChildren( c, mask );
                    children.concat( cc );
                }
            }
            return children;
        }

        public RegisterLoadTrigger( trigger: Trigger ): void {
            this._loadTriggers.push( trigger );
        }

        public RegisterTrigger( trigger: Trigger ): void {
            this._activeTriggers.push( trigger );
        }

        public Load(): void {

            let loader = new THREE.TextureLoader();
            loader.load( this._data.TileMapPath, this.onTextureLoaded.bind( this ), undefined, undefined ); // TODO: Bleat about error


        }

        public Unload(): void {
            // TODO: dispose of everything
            for ( let t of this._interactiveTriggers ) {
                t.Destroy();
            }
            for ( let t of this._loadTriggers ) {
                t.Destroy();
            }
            this._isLoaded = false;
        }

        /**
         * Immediately adds a pawn to this scene. This should only be used during load or from an update loop
         * within this level.
         * @param pawn The pawn to be added.
         */
        private addPawn( pawn: Pawn ): void {
            if ( pawn instanceof PlayerPawn ) {
                this.PlayerPawn = pawn;
            }
            pawn.SetPhysicsWorld( this._physicsWorld );

            // TODO: Add sprite.

            // Track the pawn.
            this._pawns.push( pawn );
        }

        /**
         * Adds and spawns a pawn in this level. This is deferred to the next frame to avoid 
         * spawning during a physics update, which would be error-prone and buggy.
         * @param pawn The pawn to be added and spawned.
         * @param x The x location.
         * @param y The y location.
         */
        public AddAndSpawnPawn( pawn: Pawn, x: number, y: number ): void {
            this._pendingPawns.push( new DeferredPawnSpawnInfo( x, y, pawn ) );
        }

        public Update( dt: number ): void {

            for ( let p of this._pendingPawns ) {
                this.addPawn( p.Pawn );
                p.Pawn.Spawn( p.X, p.Y );
            }
            this._pendingPawns.length = 0;

            // Update physics world
            this._physicsWorld.Step( dt, 1, 3 );
            this._physicsWorld.ClearForces();

            // update each object.
            for ( let pawn of this._pawns ) {
                pawn.Update( dt );
            }

            // Triggers
            for ( let trigger of this._activeTriggers ) {
                trigger.Update( dt );
            }

            for ( let entity of this._entities ) {
                entity.Update( dt );
            }
        }

        public Render( dt: number, renderer: THREE.WebGLRenderer, camera: THREE.Camera ): void {
            renderer.render( this._scene, camera );
        }

        private buildPlane( position: THREE.Vector3, sourceRect: Rectangle2D, texWidth: number, texHeight: number, lightColour: THREE.Color, xRotDegrees: number, yRotDegrees: number, zRotDegrees: number ): THREE.PlaneGeometry {
            //let wallGeom = new THREE.PlaneGeometry( 1, 1, 1, 1 );
            let wallGeom = new THREE.PlaneGeometry( 1, 1, 1, 1 );

            // Assign vertex light colours
            Utilities.AssignVertexColour( wallGeom, lightColour );

            // Assign texture coordinates for this mesh.
            Utilities.SetPlaneTexCoordsFromSourceRect2( sourceRect, texWidth, texHeight, wallGeom.faceVertexUvs[0], false, true );

            // Perform required rotations.
            if ( Utilities.Exists( xRotDegrees ) ) {
                wallGeom.rotateX( THREE.Math.degToRad( xRotDegrees ) );
            }
            if ( Utilities.Exists( yRotDegrees ) ) {
                wallGeom.rotateY( THREE.Math.degToRad( yRotDegrees ) );
            }
            if ( Utilities.Exists( zRotDegrees ) ) {
                wallGeom.rotateZ( THREE.Math.degToRad( zRotDegrees ) );
            }

            wallGeom.translate( position.x, position.y, position.z );

            return wallGeom;
        }

        private onTextureLoaded( texture: THREE.Texture ): void {

            this._tilemapTexture = texture;
            texture.minFilter = THREE.NearestFilter;
            texture.magFilter = THREE.NearestFilter;
            let texWidth: number = texture.image.width;
            let texHeight: number = texture.image.height;
            this._tilemapTilesWide = texWidth / this._data.TileWidth;
            this._tilemapTilesHigh = texHeight / this._data.TileHeight;
            console.debug( "Tilemap: w/h/tw/th:", texWidth, texHeight, this._tilemapTilesWide, this._tilemapTilesHigh );

            // Setup material
            this._mapMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors, map: this._tilemapTexture } );

            // Setup physics
            this._physicsWorld = new Box2D.Dynamics.b2World( new Box2D.Common.Math.b2Vec2( 0, 0 ), false );
            console.log( this._data.WallTextureIDs );
            // Sectors
            let geometries: THREE.PlaneGeometry[] = [];
            for ( let y = 0; y < this._data.Length; y++ ) {
                this._sectorLightColours[y] = [];
                for ( let x = 0; x < this._data.Width; x++ ) {
                    let sector = this._data.Sectors[y][x];
                    this._sectorLightColours[y][x] = new THREE.Color( sector.LightColour );

                    switch ( sector.Type ) {
                        case SectorType.WALL: {

                            // Calculate texture coordinates for this mesh.
                            let tileId = this._data.WallTextureIDs[y][x];
                            let col = tileId % this._tilemapTilesWide;
                            let row = Math.floor( tileId / this._tilemapTilesWide );
                            let sourceRect = new Rectangle2D( col * this._data.TileWidth, row * this._data.TileHeight, this._data.TileWidth, this._data.TileHeight );

                            // south-facing
                            let southSector = this.getSectorSouth( sector );
                            if ( Utilities.Exists( southSector ) && southSector.Type === SectorType.OPEN ) {
                                geometries.push( this.buildPlane( new THREE.Vector3( x, 0, y + 0.5 ), sourceRect, texWidth, texHeight, new THREE.Color( southSector.LightColour ), undefined, undefined, undefined ) );
                            }

                            // north-facing
                            let northSector = this.getSectorNorth( sector );
                            if ( Utilities.Exists( northSector ) && northSector.Type === SectorType.OPEN ) {
                                geometries.push( this.buildPlane( new THREE.Vector3( x, 0, y - 0.5 ), sourceRect, texWidth, texHeight, new THREE.Color( northSector.LightColour ), 180, undefined, 180 ) );
                            }

                            // east-facing
                            let eastSector = this.getSectorEast( sector );
                            if ( Utilities.Exists( eastSector ) && eastSector.Type === SectorType.OPEN ) {
                                geometries.push( this.buildPlane( new THREE.Vector3( x + 0.5, 0, y ), sourceRect, texWidth, texHeight, new THREE.Color( eastSector.LightColour ), undefined, 90, undefined ) );
                            }

                            // west-facing
                            let westSector = this.getSectorWest( sector );
                            if ( Utilities.Exists( westSector ) && westSector.Type === SectorType.OPEN ) {
                                geometries.push( this.buildPlane( new THREE.Vector3( x - 0.5, 0, y ), sourceRect, texWidth, texHeight, new THREE.Color( westSector.LightColour ), undefined, 270, undefined ) );
                            }

                            // Setup physics object for this
                            let bodyDef = new Box2D.Dynamics.b2BodyDef();
                            bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
                            bodyDef.position.Set( x, y );
                            let blockBody = this._physicsWorld.CreateBody( bodyDef );
                            let colShape = new Box2D.Collision.Shapes.b2PolygonShape();
                            colShape.SetAsBox( 0.5, 0.5 );
                            var bodyFixtureDef = new Box2D.Dynamics.b2FixtureDef();
                            bodyFixtureDef.shape = colShape;
                            blockBody.CreateFixture( bodyFixtureDef );
                            break;
                        }
                        case SectorType.OPEN: {

                            // Calculate texture coordinates for the floor mesh.
                            let tileId = this._data.FloorTextureIDs[y][x];
                            let col = tileId % this._tilemapTilesWide;
                            let row = Math.floor( tileId / this._tilemapTilesWide );
                            let sourceRect = new Rectangle2D( col * this._data.TileWidth, row * this._data.TileHeight, this._data.TileWidth, this._data.TileHeight );

                            // Build floor
                            geometries.push( this.buildPlane( new THREE.Vector3( x, -0.5, y ), sourceRect, texWidth, texHeight, new THREE.Color( sector.LightColour ), -90, undefined, undefined ) );

                            // Calculate texture coordinates for the ceiling mesh.
                            let ceilTileId = this._data.CeilingTextureIDs[y][x];
                            let ceilCol = ceilTileId % this._tilemapTilesWide;
                            let ceilRow = Math.floor( ceilTileId / this._tilemapTilesWide );
                            let ceilSourceRect = new Rectangle2D( ceilCol * this._data.TileWidth, ceilRow * this._data.TileHeight, this._data.TileWidth, this._data.TileHeight );

                            // Build ceiling
                            geometries.push( this.buildPlane( new THREE.Vector3( x, 0.5, y ), ceilSourceRect, texWidth, texHeight, new THREE.Color( sector.LightColour ), 90, undefined, undefined ) );

                            // NOTE: open sectors do not have collision.
                            break;
                        }

                        // TODO: A new sector type which supports transparent, passable walls (used for vines, hanging wires, etc.)
                    }
                }
            }

            // Combine the geometries into one.
            let combined = new THREE.Geometry();
            for ( let g of geometries ) {
                combined.merge( g );

                // Make sure to clean up after it is merged.
                g.dispose();
            }
            geometries.length = 0;

            let sectorGroupMesh = new THREE.Mesh( combined, this._mapMaterial );
            sectorGroupMesh.layers.disableAll();
            sectorGroupMesh.layers.enable( ObjectMask.LEVEL_GEOMETRY );
            sectorGroupMesh.userData[OBJECT_TYPE] = ObjectType.LEVEL_GEOMETRY;
            this._scene.add( sectorGroupMesh );

            // Triggers, spawners, doors, etc.
            this.processEntities();

            // Execute load triggers, which should take care of spawning needed.
            for ( let t of this._loadTriggers ) {
                t.OnLevelLoaded();
            }

            // Listen for physics contacts within the level.
            this._physicsWorld.SetContactListener( new LevelContactListener() );

            // TODO: should wait on textures, models, etc.
            this._isLoaded = true;

            Message.Send( "LEVEL_LOADED", this );
        }

        public GetColorForPosition( x: number, y: number ): THREE.Color {
            return this._sectorLightColours[Math.floor( y )][Math.floor( x )];
        }

        private getSectorSouth( sector: Sector ): Sector {
            if ( sector.Y + 1 < this._data.Length ) {
                return this._data.Sectors[sector.Y + 1][sector.X];
            }
            return undefined;
        }

        private getSectorNorth( sector: Sector ): Sector {
            if ( sector.Y - 1 > 0 ) {
                return this._data.Sectors[sector.Y - 1][sector.X];
            }
            return undefined;
        }

        private getSectorEast( sector: Sector ): Sector {
            if ( sector.X + 1 < this._data.Width ) {
                return this._data.Sectors[sector.Y][sector.X + 1];
            }
            return undefined;
        }

        private getSectorWest( sector: Sector ): Sector {
            if ( sector.X - 1 > 0 ) {
                return this._data.Sectors[sector.Y][sector.X - 1];
            }
            return undefined;
        }

        private processEntities(): void {
            for ( let key of Object.keys( this._data.Entities ) ) {
                let entity = this._data.Entities[key];
                switch ( entity.Type ) {
                    case EntityType.PLAYER_SPAWNER:
                        this._playerSpawnerFound = true;
                        break;
                    case EntityType.PICKUP:
                        this.createPickup( entity );
                        break;
                    case EntityType.TRIGGER:

                        // Create trigger, link triggerables.
                        this.createTrigger( entity );
                        break;
                    case EntityType.DAMAGE_TRIGGER:
                        this.createDamageTrigger( entity );
                        break;
                }
            }
            if ( !this._playerSpawnerFound ) {
                throw new Error( "Cannot load map with no player spawner." );
            }
        }

        /**
         * Creates a pickup entity.
         * @param entity The entity data to create from.
         */
        private createPickup( entity: EntityData ): void {
            if ( Utilities.Exists( entity.RawData.pickupType ) ) {
                let pickupType = entity.RawData.pickupType as PickupType;
                let pickup: Pickup;
                switch ( pickupType ) {
                    default:
                    case PickupType.ITEM:

                        // Generic item pickup
                        if ( Utilities.Exists( entity.RawData.item ) ) {
                            let item = entity.RawData.item as InventoryItem;

                            let message: string;
                            if ( !Utilities.Exists( entity.RawData.message ) ) {
                                throw new Error( "Pickup requires message" );
                            }
                            message = String( entity.RawData.message );

                            let count: number = 1;
                            if ( Utilities.Exists( entity.RawData.count ) ) {
                                count = Number( entity.RawData.count );
                            }

                            let spriteTexturePath: string;
                            if ( !Utilities.Exists( entity.RawData.spriteTexturePath ) ) {
                                throw new Error( "Pickup requires spriteTexturePath" );
                            }
                            spriteTexturePath = String( entity.RawData.spriteTexturePath );

                            pickup = new Pickup( entity.GridPosition, spriteTexturePath, message, item, count, this );
                        }
                        break;
                    case PickupType.HEALTH:
                        pickup = new HealthPickup( entity.GridPosition, this );
                        break;
                    case PickupType.ARMOR:
                        pickup = new ArmorPickup( entity.GridPosition, this );
                        break;
                    case PickupType.WEAPON:
                        if ( Utilities.Exists( entity.RawData.item ) ) {
                            let item = entity.RawData.item as InventoryItem;
                            pickup = new WeaponPickup( entity.GridPosition, item, this );
                        }
                        break;
                }
            } else {
                throw new Error( "Missing pickupType!" );
            }
        }

        private createDamageTrigger( entity: EntityData ): void {
            let size = new THREE.Vector2( 1, 1 );
            if ( Utilities.Exists( entity.RawData.size ) ) {
                if ( Utilities.Exists( entity.RawData.size.x ) ) {
                    size.x = Number( entity.RawData.size.x );
                }
                if ( Utilities.Exists( entity.RawData.size.y ) ) {
                    size.y = Number( entity.RawData.size.y );
                }
            }
            let interval = 1;
            if ( Utilities.Exists( entity.RawData.interval ) ) {
                interval = Number( entity.RawData.interval );
            }

            let amount = 5;
            if ( Utilities.Exists( entity.RawData.amount ) ) {
                amount = Number( entity.RawData.amount );
            }

            let affectsEnemyPawns = false;
            if ( Utilities.Exists( entity.RawData.affectsEnemyPawns ) ) {
                affectsEnemyPawns = Boolean( entity.RawData.affectsEnemyPawns );
            }

            let damage = new DamageTrigger( entity.GridPosition, size, this, interval, amount, affectsEnemyPawns );
        }

        /**
         * Creates a trigger entity.
         * @param entity The entity data to create from.
         */
        private createTrigger( entity: EntityData ): void {
            if ( Utilities.Exists( entity.RawData.triggerType ) ) {
                let triggerType = entity.RawData.triggerType as TriggerType;
                let size = new THREE.Vector2( 1, 1 );
                if ( Utilities.Exists( entity.RawData.size ) ) {
                    if ( Utilities.Exists( entity.RawData.size.x ) ) {
                        size.x = Number( entity.RawData.size.x );
                    }
                    if ( Utilities.Exists( entity.RawData.size.y ) ) {
                        size.y = Number( entity.RawData.size.y );
                    }
                }
                let maxTriggerCount = 0;
                if ( Utilities.Exists( entity.RawData.maxTriggerCount ) ) {
                    maxTriggerCount = Number( entity.RawData.maxTriggerCount );
                }
                let trigger = new Trigger(
                    entity.GridPosition,
                    size,
                    entity.RawData.triggerType,
                    this,
                    maxTriggerCount
                );

                // Create/link triggerables.
                if ( Utilities.Exists( entity.RawData.triggerables ) ) {
                    let triggerables = entity.RawData.triggerables as string[];
                    for ( let triggerable of triggerables ) {
                        if ( Utilities.Exists( this._data.Entities[triggerable] ) ) {
                            let triggerableEntity = this._data.Entities[triggerable];
                            if ( triggerableEntity.Type === EntityType.PLAYER_SPAWNER ) {
                                this._playerSpawnerFound = true;
                                // TODO: set pos.
                                let spawner = new PlayerSpawner();
                                this._entities.push( spawner );
                                trigger.AddTriggerable( spawner );
                            } else if ( triggerableEntity.Type === EntityType.ENEMY_SPAWNER ) {

                                if ( Utilities.Exists( triggerableEntity.RawData.enemyType ) ) {

                                    // TODO: Other spawners.
                                    switch ( triggerableEntity.RawData.enemyType ) {
                                        case EnemyType.MASKED_SAMURAI:
                                            let spawner = new MaskedSamuraiSpawner( triggerableEntity.GridPosition );
                                            this._entities.push( spawner );
                                            trigger.AddTriggerable( spawner );
                                            break;
                                    }
                                } else {
                                    throw new Error( "Unable to create enemy spawner without enemy type." )
                                }
                            } else if ( triggerableEntity.Type === EntityType.DOOR ) {
                                let requiredItem: InventoryItem;
                                if ( Utilities.Exists( triggerableEntity.RawData.requiredItem ) ) {
                                    requiredItem = triggerableEntity.RawData.requiredItem as InventoryItem;
                                }
                                // Create new door
                                let door = new Door( triggerableEntity.GridPosition, "assets/textures/door1.jpg", DoorDirection.EAST_WEST, this, requiredItem );
                                this._entities.push( door );
                                trigger.AddTriggerable( door );
                            }
                        } else {
                            throw new Error( "Unable to link entity " + triggerable + " because it does not exist." );
                        }
                    }
                }
            }
        }
    }
}