/// <reference path="Pawn.ts" />

namespace FPS {

    export class PlayerPawn extends Pawn {

        public constructor( level: Level ) {
            super( 5.0, PawnType.PLAYER, undefined, level );
        }

        protected setupAnimations(): void {

        }
    }
}