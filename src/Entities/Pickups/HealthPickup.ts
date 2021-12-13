/// <reference path="Pickup.ts" />

namespace FPS {

    export class HealthPickup extends Pickup {

        public constructor( gridPosition: THREE.Vector2, level: Level ) {
            super( gridPosition, "assets/textures/health_pickup.png", "You picked some health.", InventoryItem.HEALTH, 25, level );
        }

        public Trigger(): boolean {
            let incrementTriggerCount = true;
            if ( this._maxTriggerCount === 0 || this._triggerCount < this._maxTriggerCount ) {
                if ( !Player.IsHealthFull( false ) ) {
                    this._sprite.visible = false;
                    AudioManager.PlaySoundEffect( "pickup" );
                    Message.Send( "SHOW_MESSAGE", this, this.PickupMessage );

                    // TODO: boost health.
                    Player.AddHealth( this.Count, false );
                } else {
                    incrementTriggerCount = false;
                    Message.Send( "SHOW_MESSAGE", this, "Your health is full." );
                }
            }

            if ( incrementTriggerCount ) {
                this._triggerCount++;
            }

            return incrementTriggerCount;
        }
    }
}