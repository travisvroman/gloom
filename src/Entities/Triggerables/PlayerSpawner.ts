/// <reference path="../BaseEntity.ts" />

namespace FPS {

    export class PlayerSpawner extends BaseEntity implements ITriggerable {

        public Trigger( trigger: Trigger ): boolean {

            let pawn = new PlayerPawn( trigger.Level );
            trigger.Level.AddAndSpawnPawn( pawn, trigger.Position.x, trigger.Position.y );
            return true;
        }

        public Destroy(): void {

        }
    }
}