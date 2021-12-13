namespace FPS {

    export class PistolWeapon extends BaseWeapon {

        public constructor( game: Game ) {
            super( game, WeaponType.PISTOL, InventoryItem.PISTOL_AMMO );

            this._stateTimes[WeaponState.IDLE] = -1;
            this._stateTimes[WeaponState.FIRING] = 0.2;
            this._stateTimes[WeaponState.IDLE_AFTER_FIRE] = 0.1;
            this._stateTimes[WeaponState.RELOADING] = 0.0;

            this._damage = 8;
        }

        protected onFire(): void {
            AudioManager.PlaySoundEffect( "pistolFire" );

            let spread = 0.01;
            this.fireRay( spread );
        }
    }
}