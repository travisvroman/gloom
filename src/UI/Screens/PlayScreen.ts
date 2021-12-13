namespace FPS {

    /**
     * The screen used during active gameplay.
     */
    export class PlayScreen extends UIScreen implements IMessageHandler {

        private _timeTextData: any;
        private _ammoTextData: any;
        private _statsTextData: any;
        private _messageTextData: any;

        private _shotgunSpriteData: any;
        private _pistolSpriteData: any;
        private _reticleSpriteData: any;

        private _shotgunSprite: UIAnimatedSprite;
        private _pistolSprite: UIAnimatedSprite;
        private _reticleSprite: UISprite;

        private _activeWeapon: BaseWeapon;
        private _activeWeaponSprite: UIAnimatedSprite;

        private _gunOffsetY: number = 0;
        private _gunOffsetX: number = 0;
        private _gunMoveTime: number = 0;
        private _weaponFireStateColor: THREE.Color = new THREE.Color( 0xFFFFFF );

        private _timeText: UIBitmapText;
        private _ammoText: UIBitmapText;
        private _statsText: UIBitmapText;
        private _messageText: UIBitmapText;

        private _timeSkipCount = 0;
        private _totalTime: number = 0;
        private _messageTime: number = 0;
        private _maxMessageTime: number = 5;
        private _isShowingMessage: boolean = false;

        public constructor( rawData: any, width: number, height: number ) {
            super( UIScreenName.PLAY, rawData, width, height );

            this._pistolSprite = new UIAnimatedSprite( this._pistolSpriteData );
            this._shotgunSprite = new UIAnimatedSprite( this._shotgunSpriteData );
            this._reticleSprite = new UISprite( this._reticleSpriteData );

            // Text objects.
            this._timeText = new UIBitmapText( this._timeTextData );
            this._ammoText = new UIBitmapText( this._ammoTextData );
            this._statsText = new UIBitmapText( this._statsTextData );
            this._messageText = new UIBitmapText( this._messageTextData );

            // Weapon objects.
            this.AddObject( this._pistolSprite );
            this.AddObject( this._shotgunSprite );

            // Text objects.
            this.AddObject( this._timeText );
            this.AddObject( this._ammoText );
            this.AddObject( this._statsText );
            this.AddObject( this._messageText );

            this.AddObject( this._reticleSprite );

            // Listen for messages.
            Message.Subscribe( "WEAPON_STATE_CHANGE", this );
            Message.Subscribe( "WEAPON_SELECTED", this );
            Message.Subscribe( "HEALTH_CHANGED", this );
            Message.Subscribe( "ARMOR_CHANGED", this );
            Message.Subscribe( "SHOW_MESSAGE", this );
        }

        public Update( dt: number ): void {
            super.Update( dt );

            if ( !this._isLoaded ) {
                return;
            }

            if ( this._isShowingMessage ) {
                this._messageTime += dt;
                if ( this._messageTime >= this._maxMessageTime ) {
                    this._messageTime = 0;
                    this._isShowingMessage = false;
                    this._messageText.SetText( "" );
                }
            }

            this._totalTime += dt;
            if ( this._timeSkipCount === 0 ) {
                let timeSeconds = Number( this._totalTime.toFixed( 0 ) );
                let minutes = ( "0" + Math.floor( timeSeconds / 60 ) );
                let mstr = minutes.substr( minutes.length - 2, 2 );
                let seconds = ( "0" + ( timeSeconds % 60 ) );
                let sstr = seconds.substr( seconds.length - 2, 2 );
                this._timeText.SetText( `Time: ${mstr}:${sstr}` );
            }
            this._timeSkipCount++;
            if ( this._timeSkipCount >= 3 ) {
                this._timeSkipCount = 0;
            }

            if ( Utilities.Exists( this._activeWeaponSprite ) ) {

                let playerIsMoving = DataManager.GetValue<boolean>( DataName.PLAYER_IS_MOVING );
                if ( playerIsMoving ) {

                    // Animate the current weapon.
                    this._gunMoveTime += dt;
                    this._gunOffsetY = Math.sin( this._gunMoveTime * 20 ) * 10;
                    this._gunOffsetX = Math.sin( this._gunMoveTime * 10 ) * 10;

                    this.updateActiveWeaponSprite();
                }
            }
        }

        public OnMessage( message: Message ): void {
            switch ( message.Code ) {
                case "WEAPON_STATE_CHANGE":
                    this.handleWeaponStateChange( message.Context as WeaponStateChangeContext );
                    break;
                case "WEAPON_SELECTED":
                    console.debug( "weapon switch", message.Context )
                    this.handleWeaponSelection( message.Context as BaseWeapon );
                    break;
                case "HEALTH_CHANGED":
                case "ARMOR_CHANGED":
                    this._statsText.SetText( `Health: ${Player.GetHealth()}\nArmor:  ${Player.GetArmor()}` );
                    break;
                case "SHOW_MESSAGE":
                    this.showMessage( String( message.Context ) );
                    break;
            }
        }

        protected showMessage( message: string ): void {
            this._isShowingMessage = true;
            this._messageTime = 0;
            this._messageText.SetText( message );
        }

        protected onLoaded(): void {

            this._pistolSprite.IsVisible = false;
            this._shotgunSprite.IsVisible = false;

            this._statsText.SetText( `Health: ${Player.GetHealth()}\nArmor:  ${Player.GetArmor()}` )
        }

        protected populateData( rawData: any ): void {
            super.populateData( rawData );

            if ( Utilities.Exists( rawData.pistolSpriteData ) ) {
                this._pistolSpriteData = rawData.pistolSpriteData;
            } else {
                throw new Error( "Unable to create PlayScreen as required parameter 'pistolSpriteData' is missing!" );
            }


            if ( Utilities.Exists( rawData.shotgunSpriteData ) ) {
                this._shotgunSpriteData = rawData.shotgunSpriteData;
            } else {
                throw new Error( "Unable to create PlayScreen as required parameter 'shotgunSpriteData' is missing!" );
            }

            if ( Utilities.Exists( rawData.timeText ) ) {
                this._timeTextData = rawData.timeText;
            } else {
                throw new Error( "Unable to create PlayScreen as required parameter 'timeText' is missing!" );
            }

            if ( Utilities.Exists( rawData.ammoText ) ) {
                this._ammoTextData = rawData.ammoText;
            } else {
                throw new Error( "Unable to create PlayScreen as required parameter 'ammoText' is missing!" );
            }

            if ( Utilities.Exists( rawData.statsText ) ) {
                this._statsTextData = rawData.statsText;
            } else {
                throw new Error( "Unable to create PlayScreen as required parameter 'statsText' is missing!" );
            }

            if ( Utilities.Exists( rawData.messageText ) ) {
                this._messageTextData = rawData.messageText;
            } else {
                throw new Error( "Unable to create PlayScreen as required parameter 'messageText' is missing!" );
            }

            if ( Utilities.Exists( rawData.reticle ) ) {
                this._reticleSpriteData = rawData.reticle;
            } else {
                throw new Error( "Unable to create PlayScreen as required parameter 'reticle' is missing!" );
            }
        }

        private handleWeaponStateChange( context: WeaponStateChangeContext ): void {
            switch ( context.ToState ) {
                default:
                case WeaponState.IDLE:
                case WeaponState.IDLE_AFTER_FIRE:
                    if ( Utilities.Exists( this._activeWeaponSprite ) ) {
                        this._activeWeaponSprite.SetAnimation( "idle" );
                    }
                    break;
                case WeaponState.FIRING:
                    if ( Utilities.Exists( this._activeWeaponSprite ) ) {
                        this._activeWeaponSprite.SetAnimation( "fire" );
                    }
                    this._ammoText.SetText( "AMMO: " + this._activeWeapon.GetAmmoCount() );
                    break;
                case WeaponState.RELOADING:
                    if ( Utilities.Exists( this._activeWeaponSprite ) ) {
                        this._activeWeaponSprite.SetAnimation( "reload" );
                    }
                    break;
            }
        }

        private handleWeaponSelection( weapon: BaseWeapon ): void {
            this._activeWeapon = weapon;
            if ( Utilities.Exists( this._activeWeaponSprite ) ) {
                this._activeWeaponSprite.IsVisible = false;
            }
            switch ( weapon.Type ) {
                default:
                case WeaponType.PISTOL:
                    this._activeWeaponSprite = this._pistolSprite;
                    break;
                case WeaponType.SHOTGUN:
                    this._activeWeaponSprite = this._shotgunSprite;
                    break;
            }

            this._activeWeaponSprite.IsVisible = true;
            this._activeWeaponSprite.SetAnimation( "idle" );
            this.updateActiveWeaponSprite();

            this._ammoText.SetText( "AMMO: " + this._activeWeapon.GetAmmoCount() );

            // TODO: get ammo counts, etc.
        }

        private updateActiveWeaponSprite(): void {
            if ( !Utilities.Exists( this._activeWeapon ) ) {
                return;
            }
            let gunPos = this.calculateGunPosition( this._activeWeaponSprite.Width, this._activeWeaponSprite.Height, this._activeWeaponSprite.Scale, true );
            this._activeWeaponSprite.Position.set( gunPos.x, gunPos.y, 1 );
            if ( this._activeWeapon.State === WeaponState.FIRING ) {
                this._activeWeaponSprite.Tint = this._weaponFireStateColor;
            } else {
                this._activeWeaponSprite.Tint = DataManager.GetValue<THREE.Color>( DataName.PLAYER_POSITION_LIGHT_COLOR );
            }
        }

        private calculateGunPosition( sizeX: number, sizeY: number, scale: THREE.Vector3, useOffset: boolean ): THREE.Vector2 {
            let x = ( sizeX * scale.x * 0.5 ) + ( useOffset ? this._gunOffsetX : 0 )
            let y = -( this._height / 2 ) + ( sizeY * scale.y * 0.5 ) - 10 + ( useOffset ? this._gunOffsetY : 0 );
            return new THREE.Vector2( x, y );
        }
    }
}