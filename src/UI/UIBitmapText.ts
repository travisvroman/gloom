namespace FPS {

    export class UIBitmapText extends UIObject {

        private _text: string;
        private _font: BitmapFont;
        private _fontName: string;
        private _textMesh: THREE.Mesh;
        private _textureSize: THREE.Vector2;

        private _canvas: HTMLCanvasElement;
        private _context: CanvasRenderingContext2D;
        private _texture: THREE.Texture;

        public constructor( rawData: any ) {
            super( rawData );
        }

        public SetText( text: string ): void {
            this._text = text;
            if ( this._isLoaded ) {
                this._font.ApplyText( text, this._textMesh, this._context, this._textureSize, new THREE.Vector2( 4, 4 ) );
                this._texture.needsUpdate = true;
            }
        }

        protected populateData( rawData: any ): void {
            super.populateData( rawData );

            this._internal = new THREE.Object3D();
            this._internal.position.copy( this._configuredPosition );

            this._textMesh = new THREE.Mesh( new THREE.PlaneGeometry( 1, 1 ), new THREE.MeshBasicMaterial( { transparent: true, color: 0xFF0000 } ) );
            this._internal.add( this._textMesh );

            if ( Utilities.Exists( rawData.fontName ) ) {
                this._fontName = String( rawData.fontName );
            } else {
                throw new Error( "Unable to create UIBitmapText as required parameter 'fontName' is missing!" );
            }

            if ( Utilities.Exists( rawData.text ) ) {
                this._text = String( rawData.text );
            } else {
                this._text = "";
            }

            this._font = BitmapFontManager.GetFont( this._fontName );

            this._textureSize = new THREE.Vector2( 256, 16 );
            if ( !Utilities.Exists( this._canvas ) ) {
                this._canvas = document.createElement( "canvas" ) as HTMLCanvasElement;
                this._context = this._canvas.getContext( "2d" );
                this._canvas.width = this._textureSize.x;
                this._canvas.height = this._textureSize.y;
            }

            if ( !Utilities.Exists( this._texture ) ) {
                this._texture = new THREE.Texture( this._canvas );
                this._texture.minFilter = this._texture.magFilter = THREE.NearestFilter;
                this._texture.needsUpdate = true;
            }

            if ( !Utilities.Exists( ( this._textMesh.material as THREE.MeshBasicMaterial ).map ) ) {
                ( this._textMesh.material as THREE.MeshBasicMaterial ).map = this._texture;
            }
            this._texture.needsUpdate = true;

            this._font.ApplyText( this._text, this._textMesh, this._context, new THREE.Vector2( 256, 16 ), new THREE.Vector2( 4, 4 ) );
            this._isLoaded = true;
        }
    }
}