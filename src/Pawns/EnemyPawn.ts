/// <reference path="Pawn.ts" />
namespace FPS {

    export enum EnemyPawnState {
        IDLE,
        WALKING,
        ATTACKING,
        DEAD
    }

    export class EnemyPawnData {
        public Speed: number;
        public AggroedSpeed: number;
        public Health: number;
        public Armor: number;
        public AggroRadius: number;
        public AttackRange: number;
        public IdleStateTime: number;
        public WalkStateTime: number;
        public AttackStateTime: number;
        public SpriteTexture: string;
    }

    export abstract class EnemyPawn extends Pawn {

        protected _isAggroed: boolean = false;
        protected _state: EnemyPawnState = EnemyPawnState.IDLE;
        protected _currentStateTime: number = 0;

        protected _data: EnemyPawnData;

        protected _health: number;
        protected _armor: number;

        public constructor( data: EnemyPawnData, level: Level ) {
            super( data.Speed, PawnType.ENEMY, data.SpriteTexture, level );
            this._health = data.Health;
            this._armor = data.Armor;
            this._data = data;
        }

        public Update( dt: number ): void {
            super.Update( dt );

            // Don't bother with checks if dead.
            if ( this.GetHealth() < 1 ) {
                return;
            }

            this._currentStateTime += dt;

            this.think( dt );
        }

        public Spawn( x: number, y: number ): void {
            this._isAggroed = false;
            super.Spawn( x, y );
        }

        public GetHealth(): number {
            return this._health;
        }

        public ApplyDamage( amount: number ): void {
            // Damaging the enemy will make them mad at you... as well it should do.
            this.aggro();
            this._health = Math.max( 0, this._health - amount );
            console.debug( `Applying ${amount} damage. Health remaining: ${this._health}`, this );
            if ( this._health === 0 ) {
                this.onDeath();
            }
        }

        protected aggro(): void {
            this._isAggroed = true;
            this._movementSpeed = this._data.AggroedSpeed;
        }

        protected dropAggro(): void {
            this._isAggroed = false;
            this._movementSpeed = this._data.Speed;
        }

        protected think( dt: number ): void {

            /* "AI" Steps:
                0. If Aggroed, proceed to 1. Otherwise, pick random direction and walk for 1 second before checking again.
                1. Check if clear LOS. If so, proceed to 2. If not, pick random direction and walk for 1 second before trying again.
                2. Check distance. If within attack range, attack (4). If not, proceed to 3.
                3. Walk toward player, adding slight random to direction vector every second or 2. Check range, attack if can (4).
                4. Attack. 
            */
            if ( this._isAggroed ) {
                switch ( this._state ) {
                    case EnemyPawnState.IDLE:
                        if ( this._currentStateTime >= this._data.IdleStateTime ) {
                            if ( this.hasPlayerLOS() ) {
                                let direction = new THREE.Vector3().copy( this.GetPosition() ).sub( this._level.PlayerPawn.GetPosition() ).normalize();
                                this.SetAngle( Math.atan2( direction.x, direction.z ) );
                                if ( this.GetPosition().distanceTo( this._level.PlayerPawn.GetPosition() ) <= this._data.AttackRange ) {
                                    this.changeState( EnemyPawnState.ATTACKING );
                                } else {
                                    this.changeState( EnemyPawnState.WALKING );
                                }
                            } else {
                                // Pick a random direction and walk in it.
                                let angle = THREE.Math.degToRad( Math.random() * 360 );
                                console.debug( "no los, walking at angle:", angle );
                                this.SetAngle( angle );
                                this.changeState( EnemyPawnState.WALKING );
                            }
                        }
                        break;
                    case EnemyPawnState.WALKING:
                        // Only allow walking for a second at a time.
                        if ( this._currentStateTime >= this._data.WalkStateTime ) {
                            this.changeState( EnemyPawnState.IDLE );
                        } else {
                            this.doWalk( dt );
                        }
                        break;
                    case EnemyPawnState.ATTACKING:
                        if ( this._currentStateTime >= this._data.AttackStateTime ) {
                            this.changeState( EnemyPawnState.IDLE );
                        } else {
                            this.doAttack( dt );
                        }
                        break;
                }
            } else {

                // Check if should be aggroed. For now this is a simple distance check. Once aggroed, always aggroed.
                if ( this._level.PlayerPawn.GetPosition().distanceTo( this.GetPosition() ) < this._data.AggroRadius ) {
                    this._isAggroed = true;
                } else {
                    switch ( this._state ) {
                        case EnemyPawnState.IDLE:
                            // Idle twice as long when not aggroed.
                            if ( this._currentStateTime >= this._data.IdleStateTime * 2 ) {
                                // Pick a random direction and walk in it.
                                let angle = THREE.Math.degToRad( Math.random() * 360 );
                                this.SetAngle( angle );
                                this.changeState( EnemyPawnState.WALKING );
                            }
                            break;
                        case EnemyPawnState.WALKING:
                            // Only allow walking for a second at a time.
                            if ( this._currentStateTime >= this._data.WalkStateTime ) {
                                this.changeState( EnemyPawnState.IDLE );
                            } else {
                                this.doWalk( dt );
                            }
                            break;
                    }
                }
            }
        }

        protected changeState( newState: EnemyPawnState ): void {
            this._currentStateTime = 0;
            this._state = newState;

            switch ( this._state ) {
                case EnemyPawnState.ATTACKING:
                    this.SetAnimation( "fire" );
                    break;
                case EnemyPawnState.DEAD:
                    this.SetAnimation( "dead" );
                    break;
                case EnemyPawnState.IDLE:
                    this.SetAnimation( "idle" );
                    break;
                case EnemyPawnState.WALKING:
                    this.SetAnimation( "walk" );
                    break;
            }
        }

        protected doWalk( dt: number ): void {
            this.MoveForward();
        }

        protected doAttack( dt: number ): void {
            // TODO: shoot at player.
        }

        protected hasPlayerLOS(): boolean {
            let rayCaster = new THREE.Raycaster();

            // Get direction between this and the player.
            let direction = new THREE.Vector3();
            direction.copy( this._level.PlayerPawn.GetPosition() );
            direction.sub( this.GetPosition() );
            direction.normalize();

            rayCaster.set( this.GetPosition(), direction );

            let layerMask = new THREE.Layers();
            layerMask.disableAll();
            layerMask.enable( ObjectMask.LEVEL_GEOMETRY );
            layerMask.enable( ObjectMask.RAY_COLLISION );
            let intersections = rayCaster.intersectObjects( this._level.GetChildren( layerMask ) );
            let playerFound: boolean = false;
            let isBlocked: boolean = false;
            for ( let intersection of intersections ) {
                let object = intersection.object;

                // Ignore own objects.
                if ( object === this._collisionMesh ) {
                    continue;
                }
                if ( Utilities.Exists( object.userData[OBJECT_TYPE] ) ) {
                    if ( Utilities.Exists( object.userData[PawnUserData.ENTITY_TYPE] ) ) {
                        switch ( object.userData[PawnUserData.ENTITY_TYPE] as string ) {
                            case EntityType.PAWN:
                                if ( object.userData[PawnUserData.PAWN_TYPE] === PawnType.PLAYER ) {
                                    playerFound = true;
                                }
                                break;
                            case EntityType.PICKUP:
                                // Okay to skip this and proceed.
                                break;
                            case EntityType.DOOR:
                                // TODO: Check if door is open. If so, proceed. If not, block here.
                                break;
                            default:
                                // Any other type of object should block.
                                isBlocked = true;
                                break;
                        }
                    } else {
                        // Non-marked collisions should block.
                        isBlocked = true;
                    }
                }

                if ( isBlocked || playerFound ) {
                    break;
                }
            }

            return !isBlocked;
        }
    }
}