/// <reference path="../BaseEntity.ts" />

namespace FPS {

    export enum EnemyType {
        MASKED_SAMURAI = "EnemyType.MaskedSamurai"
    }

    export class MaskedSamuraiSpawner extends BaseEntity implements ITriggerable {

        private _spawnPosition: THREE.Vector2;

        public constructor( spawnPosition?: THREE.Vector2 ) {
            super();
            this._spawnPosition = spawnPosition;
        }

        public Trigger( trigger: Trigger ): boolean {

            let pawn = new MaskedSamuraiPawn( trigger.Level );
            let pos = Utilities.Exists( this._spawnPosition ) ? this._spawnPosition : trigger.Position;
            trigger.Level.AddAndSpawnPawn( pawn, pos.x, pos.y );
            return true;
        }

        public Destroy(): void {
            this._spawnPosition = undefined;
        }
    }
}