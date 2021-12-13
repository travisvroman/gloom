namespace FPS {

    export class BitmapFontManager {

        private static _fonts: { [name: string]: BitmapFont } = {};

        private constructor() { }

        public static Initialize(): void {
            BitmapFontManager._fonts["consoleSmall"] = new ConsoleSmallBitmapFont();
        }

        public static IsLoaded(): boolean {
            for ( let f of Object.keys( BitmapFontManager._fonts ) ) {
                if ( !BitmapFontManager._fonts[f].IsLoaded ) {
                    return false;
                }
            }
            return true;
        }

        public static GetFont( name: string ): BitmapFont {
            if ( Utilities.Exists( BitmapFontManager._fonts[name] ) ) {
                return BitmapFontManager._fonts[name];
            } else {
                let firstFont = Object.keys( BitmapFontManager._fonts )[0];
                console.warn( `No loaded bitmap font called '${name}'. Returning '${firstFont}' instead. ` );
                return BitmapFontManager._fonts[firstFont];
            }
        }
    }
}