import * as Box2D from "@flyover/box2d"
import { Scene, PlaneGeometry, MeshBasicMaterial, Color, Mesh, Vector2, TextureLoader, Texture, Material, NearestFilter, VertexColors, Vector3, Geometry } from "three";
import { LevelData } from "./LevelData";
import { SectorType } from "./SectorType";
import { Rectangle2D } from "../Core/Rectangle2D";
import { Utilities } from "../Core/Utilities";
import { TMath } from "../Core/TMath";
import { Sector } from "./Sector";
import { Message } from "../Message";

export class Level {

    private _scene: Scene;
    private _isLoaded: boolean = false;
    private _data: LevelData;

    private _tilemapTexture: Texture;
    private _tilemapTilesWide: number;
    private _tilemapTilesHigh: number;
    private _mapMaterial: Material;
    private _sectorLightColours: Color[][] = [];

    private _physicsWorld: Box2D.b2World;

    public constructor( data: LevelData ) {
        this._data = data;
        this._scene = new Scene();
    }

    public get InternalScene(): Scene {
        return this._scene;
    }

    public get IsLoaded(): boolean {
        return this._isLoaded;
    }

    public get SpawnPosition(): Vector2 {
        return this._data.SpawnPosition;
    }

    public Load(): void {
        let loader = new TextureLoader();
        loader.load( this._data.TileMapPath, this.onTextureLoaded.bind( this ), undefined, undefined ); // TODO: Bleat about error
    }

    public Unload(): void {
        this._isLoaded = false;
    }

    private onTextureLoaded( texture: Texture ): void {
        this._tilemapTexture = texture;
        texture.minFilter = NearestFilter;
        texture.magFilter = NearestFilter;

        let texWidth: number = texture.image.width;
        let texHeight: number = texture.image.height;
        this._tilemapTilesWide = texWidth / this._data.TileWidth;
        this._tilemapTilesHigh = texHeight / this._data.TileHeight;

        console.debug( "Tilemap: w/h/tw/th:", texWidth, texHeight, this._tilemapTilesWide, this._tilemapTilesHigh );

        // Setup material
        this._mapMaterial = new MeshBasicMaterial( { vertexColors: VertexColors, map: this._tilemapTexture } );

        // Setup physics
        this._physicsWorld = new Box2D.b2World( new Box2D.b2Vec2( 0, 0 ) );

        let geometries: PlaneGeometry[] = [];

        // Sectors
        for ( let y = 0; y < this._data.Length; y++ ) {
            this._sectorLightColours[y] = [];
            for ( let x = 0; x < this._data.Width; x++ ) {
                let sector = this._data.Sectors[y][x];
                this._sectorLightColours[y][x] = new Color( sector.LightColour );

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
                            geometries.push( this.buildPlane( new Vector3( x, 0, y + 0.5 ), sourceRect, texWidth, texHeight, new Color( southSector.LightColour ), undefined, undefined, undefined ) );
                        }

                        // north-facing
                        let northSector = this.getSectorNorth( sector );
                        if ( Utilities.Exists( northSector ) && northSector.Type === SectorType.OPEN ) {
                            geometries.push( this.buildPlane( new Vector3( x, 0, y - 0.5 ), sourceRect, texWidth, texHeight, new Color( northSector.LightColour ), 180, undefined, 180 ) );
                        }

                        // east-facing
                        let eastSector = this.getSectorEast( sector );
                        if ( Utilities.Exists( eastSector ) && eastSector.Type === SectorType.OPEN ) {
                            geometries.push( this.buildPlane( new Vector3( x + 0.5, 0, y ), sourceRect, texWidth, texHeight, new Color( eastSector.LightColour ), undefined, 90, undefined ) );
                        }

                        // west-facing
                        let westSector = this.getSectorWest( sector );
                        if ( Utilities.Exists( westSector ) && westSector.Type === SectorType.OPEN ) {
                            geometries.push( this.buildPlane( new Vector3( x - 0.5, 0, y ), sourceRect, texWidth, texHeight, new Color( westSector.LightColour ), undefined, 270, undefined ) );
                        }

                        // TODO: Setup physics object for this

                        break;
                    }
                    case SectorType.OPEN: {

                        // Calculate texture coordinates for the floor mesh.
                        let tileId = this._data.FloorTextureIDs[y][x];
                        let col = tileId % this._tilemapTilesWide;
                        let row = Math.floor( tileId / this._tilemapTilesWide );
                        let sourceRect = new Rectangle2D( col * this._data.TileWidth, row * this._data.TileHeight, this._data.TileWidth, this._data.TileHeight );

                        // Build floor
                        geometries.push( this.buildPlane( new Vector3( x, -0.5, y ), sourceRect, texWidth, texHeight, new Color( sector.LightColour ), -90, undefined, undefined ) );

                        // Calculate texture coordinates for the ceiling mesh.
                        let ceilTileId = this._data.CeilingTextureIDs[y][x];
                        let ceilCol = ceilTileId % this._tilemapTilesWide;
                        let ceilRow = Math.floor( ceilTileId / this._tilemapTilesWide );
                        let ceilSourceRect = new Rectangle2D( ceilCol * this._data.TileWidth, ceilRow * this._data.TileHeight, this._data.TileWidth, this._data.TileHeight );

                        // Build ceiling
                        geometries.push( this.buildPlane( new Vector3( x, 0.5, y ), ceilSourceRect, texWidth, texHeight, new Color( sector.LightColour ), 90, undefined, undefined ) );
                        break;
                    }
                }
            }
        }

        // Combine the geometries into one.
        let combined = new Geometry();
        for ( let g of geometries ) {
            combined.merge( g );

            g.dispose();
        }
        geometries.length = 0;

        let sectorGroupMesh = new Mesh( combined, this._mapMaterial );
        this._scene.add( sectorGroupMesh );



        this._isLoaded = true;
        Message.Send( "LEVEL_LOADED", this );
    }

    private buildPlane( position: Vector3, sourceRect: Rectangle2D, texWidth: number, texHeight: number, lightColour: Color, xRotDegrees: number, yRotDegrees: number, zRotDegrees: number ): PlaneGeometry {
        let wallGeom = new PlaneGeometry( 1, 1, 1, 1 );

        // Assign vertex light colours
        Utilities.AssignVertexColour( wallGeom, lightColour );

        // Assign texture coordinates for this mesh.
        Utilities.SetPlaneTexCoordsFromSourceRect( sourceRect, texWidth, texHeight, wallGeom.faceVertexUvs[0], false, true );

        // Perform required rotations.
        if ( Utilities.Exists( xRotDegrees ) ) {
            wallGeom.rotateX( TMath.DegToRad( xRotDegrees ) );
        }
        if ( Utilities.Exists( yRotDegrees ) ) {
            wallGeom.rotateY( TMath.DegToRad( yRotDegrees ) );
        }
        if ( Utilities.Exists( zRotDegrees ) ) {
            wallGeom.rotateZ( TMath.DegToRad( zRotDegrees ) );
        }

        wallGeom.translate( position.x, position.y, position.z );

        return wallGeom;
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
}