namespace FPS {

    const EDITOR_GRID_SIZE: number = 16;

    export class Editor {

        private _openedMapContent: string;

        private _texturePath: string = "";
        private _tileMapTexture: HTMLImageElement;
        private _tileWidth: number = 16;
        private _tileHeight: number = 16;

        private _rawMap: any;
        private _width: number;
        private _length: number;
        private _currentMapName: string;

        private _floorLayerElement: HTMLCanvasElement;
        private _wallLayerElement: HTMLCanvasElement;
        private _ceilLayerElement: HTMLCanvasElement;
        private _lightLayerElement: HTMLCanvasElement;
        private _colLayerElement: HTMLCanvasElement;
        private _entityLayerElement: HTMLCanvasElement;

        private _floorLayerContext: CanvasRenderingContext2D;
        private _wallLayerContext: CanvasRenderingContext2D;
        private _ceilLayerContext: CanvasRenderingContext2D;
        private _lightLayerContext: CanvasRenderingContext2D;
        private _colLayerContext: CanvasRenderingContext2D;
        private _entityLayerContext: CanvasRenderingContext2D;

        public constructor() {

        }

        public Start(): void {
            console.log( "Editor started!" );

            this._floorLayerElement = document.getElementById( "floorLayer" ) as HTMLCanvasElement;
            this._wallLayerElement = document.getElementById( "wallLayer" ) as HTMLCanvasElement;
            this._ceilLayerElement = document.getElementById( "ceilingLayer" ) as HTMLCanvasElement;
            this._lightLayerElement = document.getElementById( "lightLayer" ) as HTMLCanvasElement;
            this._colLayerElement = document.getElementById( "collisionLayer" ) as HTMLCanvasElement;
            this._entityLayerElement = document.getElementById( "entityLayer" ) as HTMLCanvasElement;

            this._floorLayerContext = this._floorLayerElement.getContext( "2d" );
            this._wallLayerContext = this._wallLayerElement.getContext( "2d" );
            this._ceilLayerContext = this._ceilLayerElement.getContext( "2d" );
            this._lightLayerContext = this._lightLayerElement.getContext( "2d" );
            this._colLayerContext = this._colLayerElement.getContext( "2d" );
            this._entityLayerContext = this._entityLayerElement.getContext( "2d" );

            this.OnActiveLayerChanged();
        }

        public NewMapFile( event: any ): boolean {

            this.clearTextures();

            // Prompt for map name.
            let name = prompt( "Please enter the name of the map:", "MyMap" );
            while ( name.length === 0 ) {
                name = prompt( "Please enter the name of the map:", "MyMap" );
            }
            this._currentMapName = name;

            // Prompt for map width.
            let strWidth = prompt( "Please enter the map width (numeric 10-256):", "50" );
            while ( Number( strWidth ) < 10 || Number( strWidth ) > 256 ) {
                strWidth = prompt( "Please enter the map width (numeric 10-256):", "50" );
            }
            this._width = Number( strWidth );

            // Prompt for map length.
            let strLength = prompt( "Please enter the map length (numeric 10-256):", "50" );
            while ( Number( strLength ) < 10 || Number( strLength ) > 256 ) {
                strLength = prompt( "Please enter the map length (numeric 10-256):", "50" );
            }
            this._length = Number( strLength );

            // Prompt for tile map texture.
            this._texturePath = prompt( "Please enter the tile map to be used:", "assets/textures/" );
            while ( this._texturePath === "assets/textures/" ) {
                this._texturePath = prompt( "Please enter the tile map to be used:", "assets/textures/" );
            }

            // Prompt for tile map size.
            let strTileSize = prompt( "Please enter the tile map size (numeric [8-512]):", "16" );
            while ( Number( strTileSize ) < 8 || Number( strTileSize ) > 512 ) {
                strTileSize = prompt( "Please enter the tile map size (numeric [8-512]):", "16" );
            }
            this._tileHeight = Number( strTileSize );
            this._tileWidth = Number( strTileSize );

            this._openedMapContent = "";

            let control = document.getElementById( "mapSaveControl" ) as HTMLInputElement;
            control.style.display = "inline-block";

            this._rawMap = {};
            // Generate default data.
            this._rawMap.name = this._currentMapName;
            this._rawMap.width = this._width;
            this._rawMap.length = this._length;
            this._rawMap.spawnPosition = {};
            this._rawMap.spawnPosition.x = Math.floor( this._width / 2 );
            this._rawMap.spawnPosition.y = Math.floor( this._length / 2 );
            ( document.getElementById( "spawnXTextbox" ) as HTMLInputElement ).value = String( this._rawMap.spawnPosition.x );
            ( document.getElementById( "spawnYTextbox" ) as HTMLInputElement ).value = String( this._rawMap.spawnPosition.y );
            this._rawMap.textures = [];
            this._rawMap.sectorTypes = [];
            this._rawMap.wallTextureIDs = [];
            this._rawMap.floorTextureIDs = [];
            this._rawMap.ceilingTextureIDs = [];
            this._rawMap.lightColors = [];

            // Fill data arrays with default values.
            for ( let y = 0; y < this._length; ++y ) {
                this._rawMap.sectorTypes[y] = [];
                this._rawMap.wallTextureIDs[y] = [];
                this._rawMap.floorTextureIDs[y] = [];
                this._rawMap.ceilingTextureIDs[y] = [];
                this._rawMap.lightColors[y] = [];

                for ( let x = 0; x < this._width; ++x ) {
                    this._rawMap.sectorTypes[y][x] = 0;
                    this._rawMap.wallTextureIDs[y][x] = -1;
                    this._rawMap.floorTextureIDs[y][x] = -1;
                    this._rawMap.ceilingTextureIDs[y][x] = -1;
                    this._rawMap.lightColors[y][x] = "#000000";
                }
            }

            ( document.getElementById( "levelNameTextbox" ) as HTMLInputElement ).value = this._currentMapName;
            ( document.getElementById( "widthTextbox" ) as HTMLInputElement ).value = this._width.toString();
            ( document.getElementById( "lengthTextbox" ) as HTMLInputElement ).value = this._length.toString();

            this.generateGrid( this._width, this._length );

            // Load the tile map texture.
            let img = new Image();
            img.addEventListener( "load", this.onTextureLoaded.bind( this, img ) );
            img.src = this._texturePath;

            event.preventDefault();
            return false;
        }

        public OpenMapFile( event: any ): void {


            let file = event.target.files[0];
            if ( !file ) {
                console.warn( "File does not exist!" );
            }

            let reader = new FileReader();
            reader.addEventListener( "load", this.onMapFileLoaded.bind( this ) );
            reader.readAsText( file );
        }

        private onMapFileLoaded( ev: ProgressEvent<FileReader> ): void {
            let content = ev.target.result;
            console.debug( "content:", content );
            this._openedMapContent = String( content );

            let control = document.getElementById( "mapSaveControl" ) as HTMLInputElement;
            control.style.display = "inline-block";

            this.clearTextures();

            this._rawMap = JSON.parse( this._openedMapContent );
            console.log( this._rawMap );

            this._width = Number( this._rawMap.width );
            this._length = Number( this._rawMap.length );
            this._currentMapName = String( this._rawMap.name );
            this._texturePath = String( this._rawMap.tilemap );
            this._tileWidth = Number( this._rawMap.tileWidth );
            this._tileHeight = Number( this._rawMap.tileHeight );

            ( document.getElementById( "levelNameTextbox" ) as HTMLInputElement ).value = this._currentMapName;
            ( document.getElementById( "widthTextbox" ) as HTMLInputElement ).value = this._width.toString();
            ( document.getElementById( "lengthTextbox" ) as HTMLInputElement ).value = this._length.toString();
            ( document.getElementById( "spawnXTextbox" ) as HTMLInputElement ).value = String( this._rawMap.spawnPosition.x );
            ( document.getElementById( "spawnYTextbox" ) as HTMLInputElement ).value = String( this._rawMap.spawnPosition.y );

            this.generateGrid( this._width, this._length );

            // Load texture for editor use.
            if ( this._texturePath !== "" ) {
                // Load tilemap
                let img = new Image();
                img.addEventListener( "load", this.onTextureLoaded.bind( this, img ) );
                img.src = this._texturePath;
            } else {
                this.fillInLayers();
            }

            // NOTE: layers will populate once all textures have loaded.
        }

        private onTextureLoaded( element: HTMLImageElement ): void {
            this._tileMapTexture = element;

            // Load complete, signal
            this.fillInLayers();
        }

        private clearTextures(): void {
            this._texturePath = "";
            this._tileMapTexture = undefined;
        }

        private clearGrid(): void {
            let gridArea = document.getElementById( "gridArea" ) as HTMLDivElement;
            gridArea.innerHTML = "";
        }

        private generateGrid( width: number, length: number ): void {
            this.clearGrid();

            let gridArea = document.getElementById( "gridArea" ) as HTMLDivElement;
            gridArea.style.minHeight = ( length * EDITOR_GRID_SIZE ) + "px";

            this._floorLayerElement.width = width * EDITOR_GRID_SIZE;
            this._floorLayerElement.height = length * EDITOR_GRID_SIZE;
            this._floorLayerElement.style.width = this._floorLayerElement.width + "px";
            this._floorLayerElement.style.height = this._floorLayerElement.height + "px";

            this._wallLayerElement.width = width * EDITOR_GRID_SIZE;
            this._wallLayerElement.height = length * EDITOR_GRID_SIZE;
            this._wallLayerElement.style.width = this._wallLayerElement.width + "px";
            this._wallLayerElement.style.height = this._wallLayerElement.height + "px";

            this._ceilLayerElement.width = width * EDITOR_GRID_SIZE;
            this._ceilLayerElement.height = length * EDITOR_GRID_SIZE;
            this._ceilLayerElement.style.width = this._ceilLayerElement.width + "px";
            this._ceilLayerElement.style.height = this._ceilLayerElement.height + "px";

            this._lightLayerElement.width = width * EDITOR_GRID_SIZE;
            this._lightLayerElement.height = length * EDITOR_GRID_SIZE;
            this._lightLayerElement.style.width = this._lightLayerElement.width + "px";
            this._lightLayerElement.style.height = this._lightLayerElement.height + "px";

            this._colLayerElement.width = width * EDITOR_GRID_SIZE;
            this._colLayerElement.height = length * EDITOR_GRID_SIZE;
            this._colLayerElement.style.width = this._colLayerElement.width + "px";
            this._colLayerElement.style.height = this._colLayerElement.height + "px";

            this._entityLayerElement.width = width * EDITOR_GRID_SIZE;
            this._entityLayerElement.height = length * EDITOR_GRID_SIZE;
            this._entityLayerElement.style.width = this._entityLayerElement.width + "px";
            this._entityLayerElement.style.height = this._entityLayerElement.height + "px";

            // Create clickable grid objects.
            for ( let y = 0; y < length; ++y ) {
                for ( let x = 0; x < width; ++x ) {
                    let cell = document.createElement( "div" );
                    cell.className = "grid-cell";
                    cell.style.left = ( x * EDITOR_GRID_SIZE ) + "px";
                    cell.style.top = ( y * EDITOR_GRID_SIZE ) + "px";
                    ( cell as any ).x = x;
                    ( cell as any ).y = y;
                    cell.title = `[${x},${y}]`;

                    cell.addEventListener( "click", this.onGridCellClicked.bind( this, cell ) );

                    gridArea.appendChild( cell );
                }
            }
        }

        private onGridCellClicked( element: HTMLDivElement ): void {
            let x = Number( ( element as any ).x );
            let y = Number( ( element as any ).y );

            let activeLayerDropdown = document.getElementById( "activeLayer" ) as HTMLSelectElement;
            let selectedTool = ( document.querySelector( 'input[name="tool"]:checked' ) as HTMLInputElement ).value.toLowerCase();
            let isPaint = selectedTool === "paint";
            let selectedTextureIndex = Number( ( document.getElementById( "textureid" ) as HTMLInputElement ).value );
            switch ( activeLayerDropdown.value.toLowerCase() ) {
                case "floor":
                    this.paintTexture( this._floorLayerContext, this._rawMap.floorTextureIDs, x, y, selectedTextureIndex, isPaint, true );
                    break;
                case "wall":
                    this.paintTexture( this._wallLayerContext, this._rawMap.wallTextureIDs, x, y, selectedTextureIndex, isPaint, true );
                    break;
                case "ceil":
                    this.paintTexture( this._ceilLayerContext, this._rawMap.ceilingTextureIDs, x, y, selectedTextureIndex, isPaint, true );
                    break;
                case "light":
                    let selectedColor = ( document.getElementById( "lightColorBox" ) as HTMLInputElement ).value;
                    this.paintLight( this._lightLayerContext, this._rawMap.lightColors, x, y, selectedColor, isPaint );
                    break;
                case "entity":
                    // TODO: Add selected entity (new "paint" method)
                    break;
                case "col":
                    let mode = ( document.getElementById( "collisionSelector" ) as HTMLSelectElement ).selectedIndex;
                    this.paintCollision( this._colLayerContext, this._rawMap.sectorTypes, x, y, mode, isPaint );
                    break;
            }
        }

        private paintLight( layerContext: CanvasRenderingContext2D, rawMapObj: any, x: number, y: number, color: string, isPaint: boolean ): void {
            // Always erase visually first.
            layerContext.clearRect( x * EDITOR_GRID_SIZE, y * EDITOR_GRID_SIZE, EDITOR_GRID_SIZE, EDITOR_GRID_SIZE );
            if ( isPaint ) {
                if ( color[0] !== "#" ) {
                    color = "#" + color;
                }
                layerContext.fillStyle = color;
                layerContext.fillRect( x * EDITOR_GRID_SIZE, y * EDITOR_GRID_SIZE, EDITOR_GRID_SIZE, EDITOR_GRID_SIZE );

                // Update data.
                rawMapObj[y][x] = color;
            } else {

                // Update data to use white, which is the same as no light at all.
                rawMapObj[y][x] = "#FFFFFF";
            }
        }

        private paintCollision( layerContext: CanvasRenderingContext2D, rawMapObj: any, x: number, y: number, mode: number, isPaint: boolean ): void {
            // Always erase visually first.
            layerContext.clearRect( x * EDITOR_GRID_SIZE, y * EDITOR_GRID_SIZE, EDITOR_GRID_SIZE, EDITOR_GRID_SIZE );
            if ( isPaint ) {
                switch ( mode ) {
                    case 0:
                        // NONE, Do nothing visually
                        break;
                    case 1:

                        // OPEN
                        layerContext.fillStyle = "blue";
                        layerContext.fillRect( x * EDITOR_GRID_SIZE, y * EDITOR_GRID_SIZE, EDITOR_GRID_SIZE, EDITOR_GRID_SIZE );
                        break;
                    case 2:

                        // WALL
                        layerContext.fillStyle = "magenta";
                        layerContext.fillRect( x * EDITOR_GRID_SIZE, y * EDITOR_GRID_SIZE, EDITOR_GRID_SIZE, EDITOR_GRID_SIZE );
                        break;
                }

                // Update data.
                rawMapObj[y][x] = mode;
            } else {

                // Update data to use -1
                rawMapObj[y][x] = -1;
            }
        }

        private paintTexture( layerContext: CanvasRenderingContext2D, rawMapObj: any, x: number, y: number, textureId: number, isPaint: boolean, updateData: boolean ): void {
            // Always erase visually first.
            layerContext.clearRect( x * EDITOR_GRID_SIZE, y * EDITOR_GRID_SIZE, EDITOR_GRID_SIZE, EDITOR_GRID_SIZE );
            if ( isPaint ) {

                // Draw new, update data. 
                let tileId = textureId;
                let tilesWide = Math.floor( this._tileMapTexture.width / this._tileWidth );
                let tilesHigh = Math.floor( this._tileMapTexture.height / this._tileHeight );
                let col = tileId % tilesWide;
                let row = Math.floor( tileId / tilesWide );
                let sourceRect = new Rectangle2D( col * this._tileWidth, row * this._tileHeight, this._tileWidth, this._tileHeight );
                let destRect = new Rectangle2D( x * EDITOR_GRID_SIZE, y * EDITOR_GRID_SIZE, EDITOR_GRID_SIZE, EDITOR_GRID_SIZE );
                layerContext.drawImage( this._tileMapTexture,
                    sourceRect.X, sourceRect.Y, sourceRect.W, sourceRect.H,  // source
                    destRect.X, destRect.Y, destRect.W, destRect.H ); // dest

                if ( updateData ) {
                    rawMapObj[y][x] = textureId;
                }
            } else {

                // Update data to use -1
                if ( updateData ) {
                    rawMapObj[y][x] = -1;
                }
            }
        }

        private fillInLayers(): void {

            // Floor layer
            for ( let y = 0; y < this._length; ++y ) {
                for ( let x = 0; x < this._width; ++x ) {

                    // Floor
                    let floorId = this._rawMap.floorTextureIDs[y][x];

                    // Blit the image.
                    if ( floorId !== -1 ) {
                        this.paintTexture( this._floorLayerContext, undefined, x, y, floorId, true, false );
                    }

                    // Wall
                    let wallId = this._rawMap.wallTextureIDs[y][x];

                    // Blit the image.
                    if ( wallId !== -1 ) {
                        this.paintTexture( this._wallLayerContext, undefined, x, y, wallId, true, false );
                    }

                    // Ceiling
                    let ceilId = this._rawMap.ceilingTextureIDs[y][x];

                    // Blit the image.
                    if ( ceilId !== -1 ) {
                        this.paintTexture( this._ceilLayerContext, undefined, x, y, ceilId, true, false );
                    }

                    // Lights
                    let lightColor = this._rawMap.lightColors[y][x];
                    this._lightLayerContext.fillStyle = lightColor;
                    this._lightLayerContext.fillRect( x * EDITOR_GRID_SIZE, y * EDITOR_GRID_SIZE, EDITOR_GRID_SIZE, EDITOR_GRID_SIZE );

                    // Collision layer
                    let mode = this._rawMap.sectorTypes[y][x];
                    switch ( mode ) {
                        case 0:
                            // NONE, Do nothing visually
                            break;
                        case 1:

                            // OPEN
                            this._colLayerContext.fillStyle = "blue";
                            this._colLayerContext.fillRect( x * EDITOR_GRID_SIZE, y * EDITOR_GRID_SIZE, EDITOR_GRID_SIZE, EDITOR_GRID_SIZE );
                            break;
                        case 2:

                            // WALL
                            this._colLayerContext.fillStyle = "magenta";
                            this._colLayerContext.fillRect( x * EDITOR_GRID_SIZE, y * EDITOR_GRID_SIZE, EDITOR_GRID_SIZE, EDITOR_GRID_SIZE );
                            break;
                    }

                    // TODO: Entities objects.
                }
            }


        }

        public SpawnXChanged(): void {
            this._rawMap.spawnPosition.x = Number( ( document.getElementById( "spawnXTextbox" ) as HTMLInputElement ).value );
        }

        public SpawnYChanged(): void {
            this._rawMap.spawnPosition.y = Number( ( document.getElementById( "spawnYTextbox" ) as HTMLInputElement ).value );
        }

        public OnActiveLayerChanged(): void {
            let activeLayerDropdown = document.getElementById( "activeLayer" ) as HTMLSelectElement;
            switch ( activeLayerDropdown.value.toLowerCase() ) {
                case "floor":
                case "wall":
                case "ceil":
                    document.getElementById( "colorSelector" ).style.display = "none";
                    document.getElementById( "collisionSelector" ).style.display = "none";
                    document.getElementById( "textureSelectorWrapper" ).style.display = "block";
                    break;
                case "light":
                    document.getElementById( "colorSelector" ).style.display = "block";
                    document.getElementById( "collisionSelector" ).style.display = "none";
                    document.getElementById( "textureSelectorWrapper" ).style.display = "none";
                    break;
                case "entity":
                    document.getElementById( "colorSelector" ).style.display = "none";
                    document.getElementById( "collisionSelector" ).style.display = "none";
                    document.getElementById( "textureSelectorWrapper" ).style.display = "none";
                    break;
                case "col":
                    document.getElementById( "colorSelector" ).style.display = "none";
                    document.getElementById( "collisionSelector" ).style.display = "block";
                    document.getElementById( "textureSelectorWrapper" ).style.display = "none";
                    break;
            }
        }

        public SaveMapFile(): void {
            if ( Utilities.Exists( this._rawMap ) ) {
                let a = document.createElement( "a" );
                let file = new Blob( [JSON.stringify( this._rawMap )], { type: "application/json" } );
                a.href = URL.createObjectURL( file );
                a.download = `${this._currentMapName}.json`;
                a.click();
            }
        }

        private CollisionCheckChanged(): void {
            let element = document.getElementById( "layerCol" ) as HTMLInputElement;
            if ( element.checked ) {
                this._colLayerElement.style.display = "inline-block";
            } else {
                this._colLayerElement.style.display = "none";
            }
        }

        private EntityCheckChanged(): void {
            let element = document.getElementById( "layerEntity" ) as HTMLInputElement;
            if ( element.checked ) {
                this._entityLayerElement.style.display = "inline-block";
            } else {
                this._entityLayerElement.style.display = "none";
            }
        }

        private LightCheckChanged(): void {
            let element = document.getElementById( "layerLight" ) as HTMLInputElement;
            if ( element.checked ) {
                this._lightLayerElement.style.display = "inline-block";
            } else {
                this._lightLayerElement.style.display = "none";
            }
        }

        private CeilCheckChanged(): void {
            let element = document.getElementById( "layerCeil" ) as HTMLInputElement;
            if ( element.checked ) {
                this._ceilLayerElement.style.display = "inline-block";
            } else {
                this._ceilLayerElement.style.display = "none";
            }
        }

        private WallCheckChanged(): void {
            let element = document.getElementById( "layerWall" ) as HTMLInputElement;
            if ( element.checked ) {
                this._wallLayerElement.style.display = "inline-block";
            } else {
                this._wallLayerElement.style.display = "none";
            }
        }

        public FloorCheckChanged(): void {
            let element = document.getElementById( "layerFloor" ) as HTMLInputElement;
            if ( element.checked ) {
                this._floorLayerElement.style.display = "inline-block";
            } else {
                this._floorLayerElement.style.display = "none";
            }
        }
    }
}