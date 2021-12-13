namespace FPS {

    export class WeaponPickup extends Pickup {

        public constructor( gridPosition: THREE.Vector2, item: InventoryItem, level: Level ) {
            let spritePath: string;
            let message: string;
            switch ( item ) {
                case InventoryItem.SHOTGUN:
                    spritePath = "assets/textures/shotgun_pickup.png";
                    message = "You got the shotgun!";
                    break;
                default:
                    throw new Error( "Unsupported item in weapon pickup: " + item );
            }
            super( gridPosition, spritePath, message, item, 1, level );
        }

        public Trigger(): boolean {

            let incrementTriggerCount = true;
            if ( this._maxTriggerCount === 0 || this._triggerCount < this._maxTriggerCount ) {
                if ( Inventory.AddItem( this.Item, this.Count ) ) {
                    this._sprite.visible = false;
                    Message.Send( "WEAPON_PICKUP", this, this.Item );
                    Message.Send( "SHOW_MESSAGE", this, this.PickupMessage );
                } else {
                    incrementTriggerCount = false;
                    Message.Send( "SHOW_MESSAGE", this, "You cannot carry any more of those." );
                }
            }

            if ( incrementTriggerCount ) {
                this._triggerCount++;
            }

            return incrementTriggerCount;
        }
    }
}