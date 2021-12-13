namespace FPS {

    export class Utilities {


        public static Exists( object: any ): boolean {
            return object !== undefined && object !== null;
        }

        public static SetPlaneTexCoordsFromSourceRect( sourceRect: Rectangle2D, texWidth: number, texHeight: number, texCoords: THREE.Vector2[][], flipX: boolean = false, flipY: boolean = false ) {
            let minX = sourceRect.X;
            let maxX = sourceRect.X + sourceRect.W;
            let minY = sourceRect.Y;
            let maxY = sourceRect.Y + sourceRect.H;
            texCoords[0][0].set( ( flipX ? maxX : minX ) / texWidth, ( flipY ? minY : maxY ) / texHeight );
            texCoords[0][1].set( ( flipX ? maxX : minX ) / texWidth, ( flipY ? maxY : minY ) / texHeight );
            texCoords[0][2].set( ( flipX ? minX : maxX ) / texWidth, ( flipY ? minY : maxY ) / texHeight );
            texCoords[1][0].set( ( flipX ? maxX : minX ) / texWidth, ( flipY ? maxY : minY ) / texHeight );
            texCoords[1][1].set( ( flipX ? minX : maxX ) / texWidth, ( flipY ? maxY : minY ) / texHeight );
            texCoords[1][2].set( ( flipX ? minX : maxX ) / texWidth, ( flipY ? minY : maxY ) / texHeight );
        }

        public static SetPlaneTexCoordsFromSourceRect2( sourceRect: Rectangle2D, texWidth: number, texHeight: number, texCoords: THREE.Vector2[][], flipX: boolean = false, flipY: boolean = false ) {
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


        public static SetPlaneTexCoordsFromSourceRect3( sourceRect: Rectangle2D, texWidth: number, texHeight: number, geometry: THREE.BufferGeometry, flipX: boolean = false, flipY: boolean = false ) {
            let minX = sourceRect.X;
            let maxX = sourceRect.X + sourceRect.W;
            let minY = sourceRect.Y;
            let maxY = sourceRect.Y + sourceRect.H;
            let texCoords = new Float32Array( [
                ( flipX ? maxX : minX ) / texWidth, 1.0 - ( ( flipY ? maxY : minY ) / texHeight ),
                ( flipX ? minX : maxX ) / texWidth, 1.0 - ( ( flipY ? maxY : minY ) / texHeight ),
                ( flipX ? maxX : minX ) / texWidth, 1.0 - ( ( flipY ? minY : maxY ) / texHeight ),

                ( flipX ? minX : maxX ) / texWidth, 1.0 - ( ( flipY ? minY : maxY ) / texHeight ),
                ( flipX ? minX : maxX ) / texWidth, 1.0 - ( ( flipY ? maxY : minY ) / texHeight ),
                ( flipX ? maxX : minX ) / texWidth, 1.0 - ( ( flipY ? maxY : minY ) / texHeight ),
            ] );
            geometry.setAttribute( "uv", new THREE.BufferAttribute( texCoords, 2, false ) );
        }

        public static AssignVertexColour( geometry: THREE.Geometry, lightColor: THREE.Color, faceCount: number = 2, vertsPerFace: number = 3 ): void {
            for ( let i = 0; i < faceCount; ++i ) {
                for ( let j = 0; j < vertsPerFace; ++j ) {
                    geometry.faces[i].vertexColors[j] = new THREE.Color( lightColor );
                }
            }
            geometry.elementsNeedUpdate=true;

            // let colors = new Float32Array( [
            //     lightColor.r, lightColor.g, lightColor.b,
            //     lightColor.r, lightColor.g, lightColor.b,
            //     lightColor.r, lightColor.g, lightColor.b,
            //     lightColor.r, lightColor.g, lightColor.b,
            //     lightColor.r, lightColor.g, lightColor.b,
            //     lightColor.r, lightColor.g, lightColor.b
            // ] );
            // geometry.setAttribute( "color", new THREE.BufferAttribute( colors, 3, false ) );
        }
    }
}