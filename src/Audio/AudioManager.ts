namespace FPS {

    class SoundEffect {

        private _audio: HTMLAudioElement;

        public readonly Name: string;
        public readonly Sources: string[];
        public readonly AutoPlay: boolean;
        public constructor( name: string, sources: string[], autoPlay: boolean ) {
            this.Name = name;
            this.Sources = sources;
            this.AutoPlay = autoPlay;

            this._audio = new Audio();
            let sourceFound: boolean = false;
            for ( let src of this.Sources ) {
                let extension = src.split( '.' ).pop().toLowerCase();
                let selectedSrc: string;
                let selectedType: string;
                if ( extension === "ogg" && this._audio.canPlayType( "audio/ogg" ) ) {
                    selectedSrc = src;
                    selectedType = "audio/ogg";
                } else if ( extension === "mp3" && this._audio.canPlayType( "audio/mpeg" ) ) {
                    selectedSrc = src;
                    selectedType = "audio/mpeg";
                } else if ( extension === "wav" && this._audio.canPlayType( "audio/wav" ) ) {
                    selectedSrc = src;
                    selectedType = "audio/wav";
                } else {
                    throw new Error( "Unsupported audio extension: " + extension );
                }

                if ( Utilities.Exists( selectedSrc ) ) {
                    sourceFound = true;
                    let source = document.createElement( "source" );
                    source.type = selectedType;
                    source.src = selectedSrc;
                    this._audio.appendChild( source );
                    break;
                }
            }

            if ( !sourceFound ) {
                throw new Error( "No compatible sources found for audio: " + name );
            }
        }

        public Play(): void {
            this.Stop();
            this._audio.play();
        }

        public Pause(): void {
            this._audio.pause();
        }

        public Resume(): void {
            this._audio.play();
        }

        public Stop(): void {
            this._audio.pause();
            this._audio.currentTime = 0;
        }
    }

    export class AudioManager {

        private static _context: AudioContext;
        private static _isLoaded: boolean = false;
        private static _manifestXHR: XMLHttpRequest;
        private static _sfx: { [name: string]: SoundEffect } = {};
        private static _music: { [name: string]: SoundEffect } = {};

        /**
         * Initializes the sound system.
         */
        public static Initialize(): void {
            AudioManager._context = new AudioContext();
            AudioManager._manifestXHR = new XMLHttpRequest();
            AudioManager._manifestXHR.addEventListener( "load", AudioManager.onManifestLoaded );
            AudioManager._manifestXHR.open( "GET", "assets/audio/audioManifest.json" );
            AudioManager._manifestXHR.send();
        }

        /**
         * Indicates if the sound manifest has loaded.
         */
        public static IsLoaded(): boolean {
            return AudioManager._isLoaded;
        }

        /**
         * Plays a sound effect with the given name. If sound is currently playing it is
         * stopped, reset and played.
         * @param name The name of the sound effect.
         */
        public static PlaySoundEffect( name: string ): void {
            if ( Utilities.Exists( AudioManager._sfx[name] ) ) {
                AudioManager._sfx[name].Play();
            } else {
                console.warn( `A sound effect named ${name} does not exist.` );
            }
        }

        /**
         * Pauses a sound effect with the given name. Does not reset to the beginning of the sound.
         * @param name The name of the sound effect.
         */
        public static PauseSoundEffect( name: string ): void {
            if ( Utilities.Exists( AudioManager._sfx[name] ) ) {
                AudioManager._sfx[name].Pause();
            } else {
                console.warn( `A sound effect named ${name} does not exist.` );
            }
        }

        /**
         * Resumes a sound effect with the given name.
         * @param name The name of the sound effect.
         */
        public static ResumeSoundEffect( name: string ): void {
            if ( Utilities.Exists( AudioManager._sfx[name] ) ) {
                AudioManager._sfx[name].Resume();
            } else {
                console.warn( `A sound effect named ${name} does not exist.` );
            }
        }

        /**
         * Stops a sound effect with the given name. Also resets to the beginning of the sound.
         * @param name The name of the sound effect.
         */
        public static StopSoundEffect( name: string ): void {
            if ( Utilities.Exists( AudioManager._sfx[name] ) ) {
                AudioManager._sfx[name].Stop();
            } else {
                console.warn( `A sound effect named ${name} does not exist.` );
            }
        }

        private static onManifestLoaded(): void {
            if ( AudioManager._manifestXHR.status >= 200 && AudioManager._manifestXHR.status < 300 ) {
                let obj = JSON.parse( AudioManager._manifestXHR.responseText );

                // Sound effects.
                if ( Utilities.Exists( obj.sfx ) ) {
                    for ( let s of obj.sfx ) {
                        let name: string;
                        if ( Utilities.Exists( s.name ) ) {
                            name = String( s.name );
                        } else {
                            throw new Error( "Sound effect is missing required parameter 'name'!" );
                        }
                        let sources: string[];
                        if ( Utilities.Exists( s.sources ) ) {
                            sources = s.sources;
                        } else {
                            throw new Error( "Sound effect is missing required parameter 'sources'!" );
                        }

                        let autoPlay: boolean;
                        if ( Utilities.Exists( s.autoPlay ) ) {
                            autoPlay = Boolean( s.autoPlay );
                        } else {
                            throw new Error( "Sound effect is missing required parameter 'autoPlay'!" );
                        }

                        AudioManager._sfx[name] = new SoundEffect( name, sources, autoPlay );
                    }
                } else {
                    throw new Error( "AudioManager cannot initialze - manifest section 'sfx' is missing" );
                }

                if ( Utilities.Exists( obj.music ) ) {
                    for ( let s of obj.music ) {
                        let name: string;
                        if ( Utilities.Exists( s.name ) ) {
                            name = String( s.name );
                        } else {
                            throw new Error( "Music effect is missing required parameter 'name'!" );
                        }

                        let sources: string[];
                        if ( Utilities.Exists( s.sources ) ) {
                            sources = s.sources;
                        } else {
                            throw new Error( "Music effect is missing required parameter 'sources'!" );
                        }

                        let autoPlay: boolean;
                        if ( Utilities.Exists( s.autoPlay ) ) {
                            autoPlay = Boolean( s.autoPlay );
                        } else {
                            throw new Error( "Music effect is missing required parameter 'autoPlay'!" );
                        }

                        // TODO: May need a separate type for music.
                        AudioManager._music[name] = new SoundEffect( name, sources, autoPlay );
                    }
                } else {
                    throw new Error( "AudioManager cannot initialze - manifest section 'sfx' is missing" );
                }
            }

            AudioManager._isLoaded = true;
        }
    }
}