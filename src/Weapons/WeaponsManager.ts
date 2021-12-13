namespace FPS {

    export class WeaponsManager {

        private _pistol: PistolWeapon;
        private _shotgun: ShotgunWeapon;

        private _activeWeapon: BaseWeapon;

        public constructor( game: Game ) {
            this._pistol = new PistolWeapon( game );
            this._shotgun = new ShotgunWeapon( game );
        }

        public get ActiveWeapon(): BaseWeapon {
            return this._activeWeapon;
        }

        public DefaultLoadout(): void {
            Inventory.ResetWeapons();

            Inventory.AddItem( InventoryItem.PISTOL );
            Inventory.AddItem( InventoryItem.PISTOL_AMMO, 50 );

            // Inventory.AddItem( InventoryItem.SHOTGUN );
            // Inventory.AddItem( InventoryItem.SHOTGUN_AMMO, 20 );

            this._activeWeapon = this._pistol;
        }

        public Update( dt: number ): void {
            this._activeWeapon.Update( dt );
        }

        public SelectBestWeapon(): void {
            // Select best available
            if ( Inventory.HasItem( InventoryItem.BFG ) && Inventory.HasItem( InventoryItem.BFG_AMMO ) ) {

            } else if ( Inventory.HasItem( InventoryItem.ROCKETLAUNCHER ) && Inventory.HasItem( InventoryItem.ROCKETLAUNCHER_AMMO ) ) {

            } else if ( Inventory.HasItem( InventoryItem.RIFLE ) && Inventory.HasItem( InventoryItem.RIFLE_AMMO ) ) {

            } else if ( Inventory.HasItem( InventoryItem.SHOTGUN ) && Inventory.HasItem( InventoryItem.SHOTGUN_AMMO ) ) {
                this.SelectWeapon( 2 );
            } else {
                // pistol
                this.SelectWeapon( 1 );
            }
        }

        public SelectIfBetter( weapon: InventoryItem ): void {
            let index = this.weaponItemToIndex( weapon );
            let selected = this.activeWeaponIndex();
            if ( index > selected ) {
                this.SelectWeapon( index );
            }
        }

        private weaponItemToIndex( weapon: InventoryItem ): number {
            switch ( weapon ) {
                default:
                case InventoryItem.PISTOL:
                    return 1;
                case InventoryItem.SHOTGUN:
                    return 2;
                case InventoryItem.RIFLE:
                    return 3;
                case InventoryItem.ROCKETLAUNCHER:
                    return 4;
                case InventoryItem.BFG:
                    return 5;
            }
        }

        private activeWeaponIndex(): number {
            switch ( this._activeWeapon ) {
                default:
                case this._pistol:
                    return 1;
                case this._shotgun:
                    return 2;
            }
        }

        /**
         * 
         * @param index The weapon index. 1=pistol, 2=shotgun, 3=energy gun, 4=rocket launcher, 5=BFG
         */
        public SelectWeapon( index: number ): void {

            let changed = false;
            switch ( index ) {
                default:
                case 1:
                    if ( Inventory.HasItem( InventoryItem.PISTOL ) ) {
                        this._activeWeapon = this._pistol;
                        changed = true;
                    }
                    break;
                case 2:
                    if ( Inventory.HasItem( InventoryItem.SHOTGUN ) ) {
                        this._activeWeapon = this._shotgun;
                        changed = true;
                    }
                    break;
                case 3:
                    if ( Inventory.HasItem( InventoryItem.RIFLE ) ) {
                        //this._activeWeapon = this._shotgun;
                        changed = true;
                    }
                    break;
                case 4:
                    if ( Inventory.HasItem( InventoryItem.ROCKETLAUNCHER ) ) {
                        //this._activeWeapon = this._shotgun;
                        changed = true;
                    }
                    break;
                case 5:
                    if ( Inventory.HasItem( InventoryItem.BFG ) ) {
                        //this._activeWeapon = this._shotgun;
                        changed = true;
                    }
                    break;
            }

            if ( changed ) {
                if ( Utilities.Exists( this._activeWeapon ) ) {
                    this._activeWeapon.OnDeselected();
                }
                this._activeWeapon.OnSelected();
            }
        }
    }
}
