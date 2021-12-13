/// <reference path="Trigger.ts" />

namespace FPS {

    export class DamageTrigger extends Trigger {

        private _amount: number = 5;
        private _affectEnemyPawns: boolean = false;
        private _interval: number = 1;
        private _currentTime: number = 0;

        /**
         * Creates a new trigger.
         * @param gridPosition The position of this trigger.
         * @param size The size of this trigger.
         * @param triggerType The type of this trigger.
         * @param level The level this trigger is located in.
         * @param maxTriggerCount The max number of times this trigger can be activated.
         */
        public constructor( gridPosition: THREE.Vector2, size: THREE.Vector2, level: Level, interval: number = 1, amount: number = 5, affectsEnemyPawns: boolean = false ) {
            super( gridPosition, size, TriggerType.PLAYER_PAWN_ENTER, level );
            this._interval = interval;
            this._amount = amount;
            this._affectEnemyPawns = affectsEnemyPawns;
        }

        public Update( dt: number ): void {
            this._currentTime += dt;

            // Only apply damage per the interval.
            if ( this._currentTime >= this._interval ) {
                for ( let pawn of this._pawnsInTrigger ) {
                    if ( pawn instanceof EnemyPawn && this._affectEnemyPawns ) {
                        pawn.ApplyDamage( this._amount );
                    } else if ( pawn instanceof PlayerPawn ) {
                        Player.RemoveHealth( this._amount );
                    }
                }
                this._currentTime = 0;
            }
        }
    }
}