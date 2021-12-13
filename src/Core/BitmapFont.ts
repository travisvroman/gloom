namespace FPS {

    export class BitmapFontGlyph {
        public readonly CharacterCode: number;
        public readonly Bounds: Rectangle2D;


        public constructor( characterCode: number, x: number, y: number, width: number, height: number ) {
            this.CharacterCode = characterCode;
            this.Bounds = new Rectangle2D( x, y, width, height );
        }
    }

    export abstract class BitmapFont {

        private _fontImage: HTMLImageElement;
        private _isLoaded: boolean = false;
        private _lineHeight: number = 0;

        private _glyphs: { [charCode: number]: BitmapFontGlyph } = {};

        

        public readonly Name: string;

        public constructor( name: string, texturePath: string, glyphs: BitmapFontGlyph[] ) {
            this.Name = name;

            for ( let g of glyphs ) {
                this._glyphs[g.CharacterCode] = g;
                if ( g.Bounds.H > this._lineHeight ) {
                    this._lineHeight = g.Bounds.H;
                }
            }

            this._fontImage = new Image();
            this._fontImage.addEventListener( "load", this.onTextureLoaded.bind( this ) );
            this._fontImage.src = texturePath;
        }

        public get IsLoaded(): boolean {
            return this._isLoaded;
        }

        public ApplyText( text: string, mesh: THREE.Mesh, context: CanvasRenderingContext2D, textureSize: THREE.Vector2, scale: THREE.Vector2 ): void {
            //let size = this.measureString( text );
            let texture = this.applyStringToContext( text, context, textureSize );
            //mesh.scale.set( size.x * 4, size.y * 4, 1 );
            mesh.scale.set( textureSize.x * scale.x, textureSize.y * scale.y, 1 );

            // Left align
            mesh.position.set( ( ( textureSize.x * scale.x ) / 2 ), -( ( textureSize.y * scale.y ) / 2 ), 0 );
        }

        private measureString( text: string ): THREE.Vector2 {
            let maxWidth: number = 0;
            let maxHeight: number = this._lineHeight;

            let x: number = 0;
            let y: number = 0;
            let upperText = text.toUpperCase();
            for ( let char of upperText ) {

                // Handle newlines
                if ( char === "\n" ) {
                    x = 0;
                    y = maxHeight;
                    maxHeight += this._lineHeight;
                    continue;
                }

                // For now, just measure the total size.
                let code = char.charCodeAt( 0 );
                let glyph = this._glyphs[code];
                if ( !Utilities.Exists( glyph ) ) {
                    glyph = this._glyphs[33]; // Use "!!" - TODO: Use "?" for unrecognized characters.
                }

                x += glyph.Bounds.W;
                if ( x > maxWidth ) {
                    maxWidth = x;
                }
            }

            return new THREE.Vector2( maxWidth, maxHeight );
        }

        private applyStringToContext( text: string, context: CanvasRenderingContext2D, textureSize: THREE.Vector2 ): void {

            // NOTE: might be able to re-use the texture/canvas.
            if ( !this._isLoaded ) {
                throw new Error( "Cannot generate texture from unloaded bitmap font." );
            }

            let x: number = 0;
            let y: number = 0;

            context.clearRect( 0, 0, textureSize.x, textureSize.y );

            x = 0;
            y = 0;
            let upperText = text.toUpperCase();
            for ( let char of upperText ) {

                // Handle newlines
                if ( char === "\n" ) {
                    x = 0;
                    y += this._lineHeight;
                    continue;
                }

                // For now, just measure the total size.
                let code = char.charCodeAt( 0 );
                let glyph = this._glyphs[code];
                if ( !Utilities.Exists( glyph ) ) {
                    glyph = this._glyphs[33]; // Use "!!" - TODO: Use "?" for unrecognized characters.
                }

                // Blit
                let source = new Rectangle2D(
                    glyph.Bounds.X,
                    glyph.Bounds.Y,
                    glyph.Bounds.W,
                    glyph.Bounds.H
                );

                let dest = new Rectangle2D( x, y, glyph.Bounds.W, glyph.Bounds.H );
                context.drawImage( this._fontImage, source.X, source.Y, source.W, source.H, dest.X, dest.Y, dest.W, dest.H );

                x += glyph.Bounds.W;
            }
        }

        private onTextureLoaded(): void {
            this._isLoaded = true;
        }
    }

    export class ConsoleSmallBitmapFont extends BitmapFont {

        public constructor() {

            // TEMP - should be loaded by engine first
            let glyphs: BitmapFontGlyph[] = [];

            // Each row.
            glyphs.push( new BitmapFontGlyph( 33, 0, 0, 4, 10 ) ); // !
            glyphs.push( new BitmapFontGlyph( 34, 4, 0, 6, 10 ) ); // "
            glyphs.push( new BitmapFontGlyph( 35, 10, 0, 8, 10 ) ); // #
            glyphs.push( new BitmapFontGlyph( 36, 18, 0, 7, 10 ) ); // $
            glyphs.push( new BitmapFontGlyph( 37, 25, 0, 9, 10 ) ); // %
            glyphs.push( new BitmapFontGlyph( 38, 34, 0, 8, 10 ) ); // &
            glyphs.push( new BitmapFontGlyph( 39, 42, 0, 4, 10 ) ); // '
            glyphs.push( new BitmapFontGlyph( 91, 46, 0, 4, 10 ) ); // [
            glyphs.push( new BitmapFontGlyph( 93, 50, 0, 4, 10 ) ); // ]
            glyphs.push( new BitmapFontGlyph( 40, 54, 0, 5, 10 ) ); // (
            glyphs.push( new BitmapFontGlyph( 41, 59, 0, 5, 10 ) ); // )

            glyphs.push( new BitmapFontGlyph( 42, 0, 10, 7, 10 ) ); // *
            glyphs.push( new BitmapFontGlyph( 43, 7, 10, 5, 10 ) ); // +
            glyphs.push( new BitmapFontGlyph( 44, 12, 10, 4, 10 ) ); // ,
            glyphs.push( new BitmapFontGlyph( 45, 16, 10, 5, 10 ) ); // -
            glyphs.push( new BitmapFontGlyph( 46, 21, 10, 3, 10 ) ); // .
            glyphs.push( new BitmapFontGlyph( 47, 24, 10, 7, 10 ) ); // /
            glyphs.push( new BitmapFontGlyph( 48, 31, 10, 8, 10 ) ); // 0
            glyphs.push( new BitmapFontGlyph( 49, 39, 10, 4, 10 ) ); // 1
            glyphs.push( new BitmapFontGlyph( 50, 43, 10, 8, 10 ) ); // 2
            glyphs.push( new BitmapFontGlyph( 51, 51, 10, 7, 10 ) ); // 3
            glyphs.push( new BitmapFontGlyph( 52, 58, 10, 6, 10 ) ); // 4

            glyphs.push( new BitmapFontGlyph( 53, 0, 20, 7, 10 ) ); // 5
            glyphs.push( new BitmapFontGlyph( 54, 7, 20, 8, 10 ) ); // 6
            glyphs.push( new BitmapFontGlyph( 55, 15, 20, 7, 10 ) ); // 7
            glyphs.push( new BitmapFontGlyph( 56, 22, 20, 8, 10 ) ); // 8
            glyphs.push( new BitmapFontGlyph( 57, 30, 20, 8, 10 ) ); // 9
            glyphs.push( new BitmapFontGlyph( 65, 38, 20, 8, 10 ) ); // A
            glyphs.push( new BitmapFontGlyph( 66, 46, 20, 8, 10 ) ); // B
            glyphs.push( new BitmapFontGlyph( 67, 54, 20, 7, 10 ) ); // C
            glyphs.push( new BitmapFontGlyph( 58, 61, 20, 3, 10 ) ); // :

            glyphs.push( new BitmapFontGlyph( 68, 0, 30, 8, 10 ) ); // D
            glyphs.push( new BitmapFontGlyph( 69, 8, 30, 8, 10 ) ); // E
            glyphs.push( new BitmapFontGlyph( 70, 16, 30, 8, 10 ) ); // F
            glyphs.push( new BitmapFontGlyph( 71, 24, 30, 8, 10 ) ); // G
            glyphs.push( new BitmapFontGlyph( 72, 32, 30, 8, 10 ) ); // H
            glyphs.push( new BitmapFontGlyph( 73, 40, 30, 4, 10 ) ); // I
            glyphs.push( new BitmapFontGlyph( 74, 44, 30, 8, 10 ) ); // J
            glyphs.push( new BitmapFontGlyph( 75, 52, 30, 8, 10 ) ); // K
            glyphs.push( new BitmapFontGlyph( 59, 60, 30, 4, 10 ) ); // ;

            glyphs.push( new BitmapFontGlyph( 76, 0, 40, 8, 10 ) ); // L
            glyphs.push( new BitmapFontGlyph( 77, 8, 40, 9, 10 ) ); // M
            glyphs.push( new BitmapFontGlyph( 78, 17, 40, 8, 10 ) ); // N
            glyphs.push( new BitmapFontGlyph( 79, 25, 40, 8, 10 ) ); // O
            glyphs.push( new BitmapFontGlyph( 80, 33, 40, 8, 10 ) ); // P
            glyphs.push( new BitmapFontGlyph( 81, 41, 40, 8, 10 ) ); // Q
            glyphs.push( new BitmapFontGlyph( 82, 49, 40, 8, 10 ) ); // R
            glyphs.push( new BitmapFontGlyph( 32, 57, 40, 7, 10 ) ); // [space]

            glyphs.push( new BitmapFontGlyph( 83, 0, 50, 8, 10 ) ); // S
            glyphs.push( new BitmapFontGlyph( 84, 8, 50, 8, 10 ) ); // T
            glyphs.push( new BitmapFontGlyph( 85, 16, 50, 8, 10 ) ); // U
            glyphs.push( new BitmapFontGlyph( 86, 24, 50, 7, 10 ) ); // V
            glyphs.push( new BitmapFontGlyph( 87, 31, 50, 9, 10 ) ); // W
            glyphs.push( new BitmapFontGlyph( 88, 40, 50, 9, 10 ) ); // X
            glyphs.push( new BitmapFontGlyph( 89, 49, 50, 8, 10 ) ); // Y
            glyphs.push( new BitmapFontGlyph( 90, 57, 50, 7, 10 ) ); // Z

            super( "consoleSmall", "assets/textures/font-small.png", glyphs );
        }
    }
}