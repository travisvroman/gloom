namespace FPS {

    export enum WeaponState {
        IDLE = 0,
        FIRING = 1,
        IDLE_AFTER_FIRE = 2,
        RELOADING = 3
    }

    /**
     * Sent when a weapon changes state.
     */
    export class WeaponStateChangeContext {
        public readonly Type: WeaponType;
        public readonly FromState: WeaponState;
        public readonly ToState: WeaponState;

        public constructor( type: WeaponType, from: WeaponState, to: WeaponState ) {
            this.Type = type;
            this.FromState = from;
            this.ToState = to;
        }
    }

    export abstract class BaseWeapon {
        private _weaponType: WeaponType;
        private _state: WeaponState = WeaponState.IDLE;
        private _stateTime: number = 0;

        protected _game: Game;
        protected _stateTimes: { [key: number]: number } = {};
        protected _damage: number = 1;
        protected _ammoItem: InventoryItem;

        public constructor( game: Game, type: WeaponType, ammoItem: InventoryItem ) {
            this._game = game;
            this._weaponType = type;
            this._ammoItem = ammoItem;
        }

        public get Type(): WeaponType {
            return this._weaponType;
        }

        public get State(): WeaponState {
            return this._state;
        }

        public Update( dt: number ): void {
            this._stateTime += dt;
            switch ( this._state ) {
                case WeaponState.IDLE:
                    break;
                case WeaponState.FIRING:
                    if ( this._stateTime > this._stateTimes[WeaponState.FIRING] ) {
                        this.changeState( WeaponState.IDLE_AFTER_FIRE );
                        //this._shotgun.SetAnimation( "idle" );
                    }
                    break;
                case WeaponState.IDLE_AFTER_FIRE:
                    if ( this._stateTime > this._stateTimes[WeaponState.IDLE_AFTER_FIRE] ) {
                        this.changeState( WeaponState.RELOADING );
                        this.onReload();
                        //this._shotgun.SetAnimation( "reload" );
                    }
                case WeaponState.RELOADING:
                    if ( this._stateTime > this._stateTimes[WeaponState.RELOADING] ) {
                        this.changeState( WeaponState.IDLE );
                        //this._shotgun.SetAnimation( "idle" );
                    }
            }
        }

        public IsAmmoFull(): boolean {
            return Inventory.IsItemFull( this._ammoItem );
        }

        public GetAmmoCount(): number {
            return Inventory.ItemCount( this._ammoItem );
        }

        public SetAmmo( amount: number ): void {
            Inventory.SetItem( this._ammoItem, amount );
        }

        public AddAmmo( amount: number ): void {
            Inventory.AddItem( this._ammoItem, amount );
        }

        public RemoveAmmo( amount: number ): void {
            Inventory.RemoveItem( this._ammoItem, amount );
        }

        public Fire(): void {
            if ( this._state === WeaponState.IDLE ) {
                if ( Inventory.HasItem( this._ammoItem ) ) {
                    console.debug( "fired:", this );
                    this.RemoveAmmo( 1 );
                    this.changeState( WeaponState.FIRING );
                    this.onFire();
                } else {
                    AudioManager.PlaySoundEffect( "dryfire" );
                }
            }
        }

        public OnDeselected(): void {
            this.changeState( WeaponState.IDLE );
            Message.Send( "WEAPON_DESELECTED", this, this );
        }

        public OnSelected(): void {
            Message.Send( "WEAPON_SELECTED", this, this );
            this.changeState( WeaponState.RELOADING );
            this.onReload();
        }

        protected abstract onFire(): void;

        protected onReload(): void {
            
        }

        protected fireRay( spread: number ): void {

            let rayCaster = new THREE.Raycaster();
            rayCaster.setFromCamera( new THREE.Vector2( 0, 0 ), this._game.ActiveCamera );
            rayCaster.ray.direction.add(
                new THREE.Vector3(
                    ( Math.random() * spread ) * ( Math.random() * 2 === 1 ? 1 : -1 ),
                    ( Math.random() * spread ) * ( Math.random() * 2 === 1 ? 1 : -1 ),
                    ( Math.random() * spread ) * ( Math.random() * 2 === 1 ? 1 : -1 )
                ) );

            let layerMask = new THREE.Layers();
            layerMask.disableAll();
            layerMask.enable( ObjectMask.LEVEL_GEOMETRY );
            layerMask.enable( ObjectMask.RAY_COLLISION );
            let intersectsList = rayCaster.intersectObjects( this._game.ActiveLevel.GetChildren( layerMask ) );
            for ( let intersection of intersectsList ) {
                let object = intersection.object;

                let shouldStop = false;
                if ( Utilities.Exists( object.userData[PawnUserData.ENTITY_TYPE] ) ) {
                    switch ( object.userData[PawnUserData.ENTITY_TYPE] as string ) {
                        case EntityType.PAWN:
                            let owner = object.userData[PawnUserData.OWNER] as Pawn;
                            if ( owner instanceof EnemyPawn ) {
                                if ( owner.GetHealth() !== 0 ) {
                                    owner.ApplyDamage( this._damage );

                                    // Bullets should only pass through "dead" pawns.
                                    shouldStop = true;
                                }
                            }
                            break;
                    }
                }

                if ( shouldStop ) {
                    break;
                }
            }
        }

        private changeState( state: WeaponState ): void {
            let fromState = this._state;
            this._stateTime = 0;
            this._state = state;

            Message.Send( "WEAPON_STATE_CHANGE", this, new WeaponStateChangeContext( this._weaponType, fromState, this._state ) );
        }
    }
}