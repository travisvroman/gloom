namespace FPS {

    export class AnimationData {
        public Frames: number[];
        public FramesPerSecond: number;
        public Loop: boolean = true;

        public constructor( frames?: number[], framesPerSecond?: number, loop?: boolean ) {
            if ( Utilities.Exists( frames ) ) {
                this.Frames = frames;
            }

            if ( Utilities.Exists( framesPerSecond ) ) {
                this.FramesPerSecond = framesPerSecond;
            }

            if ( Utilities.Exists( loop ) ) {
                this.Loop = loop;
            }
        }
    }
}