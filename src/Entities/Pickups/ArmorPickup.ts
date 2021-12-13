/// <reference path="Pickup.ts" />

namespace FPS {

    export class ArmorPickup extends Pickup {

        public constructor( gridPosition: THREE.Vector2, level: Level ) {
            super( gridPosition, "assets/textures/armor_pickup.png", "You picked some armor.", InventoryItem.ARMOR, 50, level );
        }

        public Trigger(): boolean {

            let incrementTriggerCount = true;
            if ( this._maxTriggerCount === 0 || this._triggerCount < this._maxTriggerCount ) {
                if ( !Player.IsArmorFull( false ) ) {
                    this._sprite.visible = false;
                    AudioManager.PlaySoundEffect( "pickup" );
                    Message.Send( "SHOW_MESSAGE", this, this.PickupMessage );

                    // TODO: boost armor.
                    Player.AddArmor( this.Count, false );
                } else {
                    incrementTriggerCount = false;
                    Message.Send( "SHOW_MESSAGE", this, "Your armor is full." );
                }
            }

            if ( incrementTriggerCount ) {
                this._triggerCount++;
            }

            return incrementTriggerCount;
        }
    }
}