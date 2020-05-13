import { Geometry, Color, Vector2 } from "three";
import { Rectangle2D } from "./Rectangle2D";

export class Utilities {

    public static Exists( object: any ): boolean {
        return object !== undefined && object !== null;
    }

    public static SetPlaneTexCoordsFromSourceRect( sourceRect: Rectangle2D, texWidth: number, texHeight: number, texCoords: Vector2[][], flipX: boolean = false, flipY: boolean = false ) {
        let minX = sourceRect.X;
        let maxX = sourceRect.X + sourceRect.W;
        let minY = sourceRect.Y;
        let maxY = sourceRect.Y + sourceRect.H;

        texCoords[0][0].set( ( flipX ? maxX : minX ) / texWidth, 1.0 - ( ( flipY ? minY : maxY ) / texHeight ) );
        texCoords[0][1].set( ( flipX ? maxX : minX ) / texWidth, 1.0 - ( ( flipY ? maxY : minY ) / texHeight ) );
        texCoords[0][2].set( ( flipX ? minX : maxX ) / texWidth, 1.0 - ( ( flipY ? minY : maxY ) / texHeight ) );
        texCoords[1][0].set( ( flipX ? maxX : minX ) / texWidth, 1.0 - ( ( flipY ? maxY : minY ) / texHeight ) );
        texCoords[1][1].set( ( flipX ? minX : maxX ) / texWidth, 1.0 - ( ( flipY ? maxY : minY ) / texHeight ) );
        texCoords[1][2].set( ( flipX ? minX : maxX ) / texWidth, 1.0 - ( ( flipY ? minY : maxY ) / texHeight ) );
    }

    public static AssignVertexColour( geometry: Geometry, lightColor: Color, faceCount: number = 2, vertsPerFace: number = 3 ): void {
        for ( let i = 0; i < faceCount; ++i ) {
            for ( let j = 0; j < vertsPerFace; ++j ) {
                geometry.faces[i].vertexColors[j] = lightColor;
            }
        }

        geometry.elementsNeedUpdate = true;
    }
}