namespace FPS {

    export enum UIScreenName {
        MAIN_MENU = "mainMenu",
        PLAY = "play"
    }

    export class UIManager {

        private _screens: { [name: string]: UIScreen } = {};
        private _activeScreen: UIScreen;

        public constructor( width: number, height: number ) {

            // temp config. TODO: Load this from an actual JSON file.
            let rawData = {
                "screens": {
                    "play": {
                        "pistolSpriteData": {
                            "name": "pistolSprite",
                            "spriteTexturePath": "assets/textures/pistol_anim.png",
                            "scale": {
                                "x": 4,
                                "y": 4
                            },
                            "frameSizeX": 128,
                            "frameSizeY": 128,
                            "defaultAnimation": "idle",
                            "animations": {
                                "idle": {
                                    "frames": [0],
                                    "framesPerSecond": 1
                                },
                                "fire": {
                                    "frames": [1, 2],
                                    "framesPerSecond": 8,
                                    "loop": false
                                },
                                "reload": {
                                    "frames": [0],
                                    "framesPerSecond": 1,
                                    "loop": false
                                },
                            }
                        },
                        "shotgunSpriteData": {
                            "name": "shotgunSprite",
                            "spriteTexturePath": "assets/textures/shotgun_anim.png",
                            "scale": {
                                "x": 4,
                                "y": 4
                            },
                            "frameSizeX": 128,
                            "frameSizeY": 128,
                            "defaultAnimation": "idle",
                            "animations": {
                                "idle": {
                                    "frames": [0],
                                    "framesPerSecond": 1
                                },
                                "fire": {
                                    "frames": [1],
                                    "framesPerSecond": 1
                                },
                                "reload": {
                                    "frames": [2, 3, 2],
                                    "framesPerSecond": 4,
                                    "loop": false
                                },
                            }
                        },
                        "timeText": {
                            "name": "timeText",
                            "fontName": "consoleSmall",
                            "position": {
                                "x": -630,
                                "y": -328
                            }
                        },
                        "reticle": {
                            "name": "reticle",
                            "spriteTexturePath": "assets/textures/reticle.png",
                            "scale": {
                                "x": 4,
                                "y": 4
                            }
                        },
                        "ammoText": {
                            "name": "ammoText",
                            "fontName": "consoleSmall",
                            "text": "AMMO: 0",
                            "position": {
                                "x": -630,
                                "y": -296
                            }
                        },
                        "statsText": {
                            "name": "statsText",
                            "fontName": "consoleSmall",
                            "text": "Health: 60\nArmor:   0",
                            "position": {
                                "x": -630,
                                "y": -228
                            }
                        },
                        "messageText": {
                            "name": "statsText",
                            "fontName": "consoleSmall",
                            "text": "",
                            "position": {
                                "x": -630,
                                "y": 228
                            }
                        }
                    }
                }
            };

            // Create all needed screens.
            if ( Utilities.Exists( rawData.screens ) ) {
                if ( Utilities.Exists( rawData.screens.play ) ) {
                    this._screens[UIScreenName.PLAY] = new PlayScreen( rawData.screens.play, width, height );
                } else {
                    throw new Error( "Unable to start UIManager. Missing required data object 'screens.play'" );
                }
            } else {
                throw new Error( "Unable to start UIManager. Missing required data object 'screens'" );
            }

            // Default the active screen.
            this._activeScreen = this._screens[UIScreenName.PLAY];
        }

        public IsLoaded(): boolean {
            for ( let s of Object.keys( this._screens ) ) {
                if ( !this._screens[s].IsLoaded ) {
                    return false;
                }
            }

            return true;
        }

        public OnResize( width: number, height: number ): void {

        }

        public Update( dt: number ): void {
            this._activeScreen.Update( dt );
        }

        public Render( renderer: THREE.WebGLRenderer, dt: number ): void {
            this._activeScreen.Render( renderer, dt );
        }
    }
}