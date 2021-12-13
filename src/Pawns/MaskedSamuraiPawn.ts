/// <reference path="EnemyPawn.ts" />

namespace FPS {

    export class MaskedSamuraiPawn extends EnemyPawn {

        public constructor( level: Level ) {
            let pawnData = new EnemyPawnData();
            pawnData.Speed = 1.0;
            pawnData.AggroedSpeed = 3.0;
            pawnData.Health = 30;
            pawnData.Armor = 0;
            pawnData.AggroRadius = 10;
            pawnData.AttackRange = 5;
            pawnData.IdleStateTime = 1.0;
            pawnData.WalkStateTime = 1.0;
            pawnData.AttackStateTime = 1.0;
            pawnData.SpriteTexture = "assets/textures/maskedCaster_spritesheet.png";
            super( pawnData, level );

            this._yOffset = -0.1;
            this._frameSizeX = 32;
            this._frameSizeY = 64;
            this._defaultAnimation = "idle";

            this._sprite.scale.set( 0.4, 0.8, 0.8 );
        }

        protected setupAnimations(): void {

            // Setup animations. TODO: move this to configurable data section.
            this._animations["idle"] = new AnimationData( [0], 1, true );
            this._animations["fire"] = new AnimationData( [1, 2, 3, 2, 1], 5, false );
            this._animations["die"] = new AnimationData( [0, 4, 5], 4, false );
            this._animations["walk"] = new AnimationData( [0, 6, 0, 7], 4, true );;
        }
    }
}