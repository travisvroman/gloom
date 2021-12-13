namespace FPS {

    export class ShotgunWeapon extends BaseWeapon {

        private _projectileCount: number;
        private _spread: number;

        public constructor( game: Game ) {
            super( game, WeaponType.SHOTGUN, InventoryItem.SHOTGUN_AMMO );

            this._stateTimes[WeaponState.IDLE] = -1;
            this._stateTimes[WeaponState.FIRING] = 0.2;
            this._stateTimes[WeaponState.IDLE_AFTER_FIRE] = 0.2;
            this._stateTimes[WeaponState.RELOADING] = 0.6;

            // damage per projectile
            this._damage = 10;
            this._projectileCount = 6;
            this._spread = 0.1;
        }

        protected onFire(): void {
            AudioManager.PlaySoundEffect( "shotgunFire" );

            for ( let i = 0; i < this._projectileCount; ++i ) {
                this.fireRay( this._spread );
            }
        }

        protected onReload(): void {
            AudioManager.PlaySoundEffect( "shotgunReload" );
        }
    }
}