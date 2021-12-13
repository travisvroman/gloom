namespace FPS {

    export enum PickupType {
        ITEM = "PickupType.Item",
        WEAPON = "PickupType.Weapon",
        HEALTH = "PickupType.Health",
        ARMOR = "PickupType.Armor"
    }

    export class Pickup extends Trigger {

        private _spriteTexturePath: string;
        private _texture: THREE.Texture;
        private _material: THREE.SpriteMaterial;
        protected _sprite: THREE.Sprite;

        public Item: InventoryItem;
        public Count: number;
        public PickupMessage: string;

        public constructor( gridPosition: THREE.Vector2, spriteTexturePath: string, message: string, item: InventoryItem, count: number, level: Level ) {
            super( gridPosition, new THREE.Vector2( 0.5, 0.5 ), TriggerType.PLAYER_PAWN_ENTER, level, 1 );
            this.Item = item;
            this.Count = count;
            this.PickupMessage = message;
            this._spriteTexturePath = spriteTexturePath;
            this._level = level;

            let loader = new THREE.TextureLoader();
            this._texture = loader.load( this._spriteTexturePath, this.onTextureLoaded.bind( this ) );
            this._texture.magFilter = this._texture.minFilter = THREE.NearestFilter;
            this._material = new THREE.SpriteMaterial( { transparent: true, map: this._texture } );
            this._sprite = new THREE.Sprite( this._material );
            this._sprite.layers.disableAll();
            this._sprite.layers.enable( ObjectMask.SPRITE );
            this._sprite.userData[OBJECT_TYPE] = ObjectType.SPRITE;

            this._level.InternalScene.add( this._sprite );
            this._sprite.position.copy( new THREE.Vector3( this.Position.x, 0, this.Position.y ) );
            this._sprite.scale.set( 0.125, 0.125, 0.125 );
            this._sprite.position.y = -0.4;
        }

        public Trigger(): boolean {
            let incrementTriggerCount = true;
            if ( this._maxTriggerCount === 0 || this._triggerCount < this._maxTriggerCount ) {
                if ( Inventory.AddItem( this.Item, this.Count ) ) {
                    this._sprite.visible = false;
                    AudioManager.PlaySoundEffect( "pickup" );
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

        public Destroy(): void {
            this._sprite = undefined;
            if ( Utilities.Exists( this._material ) ) {
                this._material.dispose();
            }
            if ( Utilities.Exists( this._texture ) ) {
                this._texture.dispose();
            }
            super.Destroy();
        }

        private onTextureLoaded( texture: THREE.Texture ): void {
            let width: number = texture.image.width;
            let height: number = texture.image.height;

            this._sprite.scale.set(
                width / 128,
                height / 128,
                1
            );
        }
    }
}
