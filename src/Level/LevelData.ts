import { Sector } from "./Sector";
import { Utilities } from "../Core/Utilities";
import { Vector2 } from "three";

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

    public SpawnPosition: Vector2;

    public constructor( rawJson: any ) {
        if ( !Utilities.Exists( rawJson.spawnPosition ) || !Utilities.Exists( rawJson.spawnPosition.x ) || !Utilities.Exists( rawJson.spawnPosition.y ) ) {
            throw new Error( "Unable to load map due to missing or invalid spawn position." );
        }
        this.SpawnPosition = new Vector2( Number( rawJson.spawnPosition.x ), Number( rawJson.spawnPosition.y ) );

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
    }
}