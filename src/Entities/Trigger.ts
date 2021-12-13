namespace FPS {

    /**
     * Determines when a trigger is... well, triggered.
     */
    export enum TriggerType {

        /**
         * When the level is loaded.
         */
        LEVEL_LOADED = "TriggerType.LevelLoaded",

        /**
         * Any pawn entering.
         */
        PAWN_ENTER = "TriggerType.PawnEnter",

        /**
         * A player pawn entering.
         */
        PLAYER_PAWN_ENTER = "TriggerType.PlayerPawnEnter",

        /**
         * An enemy pawn entering.
         */
        ENEMY_PAWN_ENTER = "TriggerType.EnemyPawnEnter",

        /**
         * A pickup trigger. Assumes PLAYER_PAWN_ENTER.
         */
        PICKUP = "TriggerType.Pickup"
    }

    export class Trigger implements IDestroyable {

        protected _level: Level;
        protected _position: THREE.Vector2;
        protected _pawnsInTrigger: Pawn[] = [];
        private _triggerables: ITriggerable[] = [];
        private _triggerType: TriggerType;
        private _physicsBody: Box2D.Dynamics.b2Body;
        private _fixture: Box2D.Dynamics.b2Fixture;
        protected _maxTriggerCount: number;
        protected _triggerCount: number = 0;

        /**
         * Creates a new trigger.
         * @param gridPosition The position of this trigger.
         * @param size The size of this trigger.
         * @param triggerType The type of this trigger.
         * @param level The level this trigger is located in.
         * @param maxTriggerCount The max number of times this trigger can be activated.
         */
        public constructor( gridPosition: THREE.Vector2, size: THREE.Vector2, triggerType: TriggerType, level: Level, maxTriggerCount: number = 0 ) {
            this._triggerType = triggerType;
            this._level = level;
            this._position = gridPosition;
            this._maxTriggerCount = maxTriggerCount;

            if ( this._triggerType !== TriggerType.LEVEL_LOADED ) {
                // Setup physics object for this
                let bodyDef = new Box2D.Dynamics.b2BodyDef();
                bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
                bodyDef.position.Set( gridPosition.x, gridPosition.y );
                this._physicsBody = level.InternalPhysicsWorld.CreateBody( bodyDef );
                let colShape = new Box2D.Collision.Shapes.b2PolygonShape();
                colShape.SetAsBox( size.x / 2, size.y / 2 );
                var bodyFixtureDef = new Box2D.Dynamics.b2FixtureDef();
                bodyFixtureDef.shape = colShape;
                bodyFixtureDef.isSensor = true;
                bodyFixtureDef.userData = this;

                this._fixture = this._physicsBody.CreateFixture( bodyFixtureDef );
                level.RegisterTrigger( this );
            } else {
                level.RegisterLoadTrigger( this );
            }
        }

        public Destroy(): void {
            if ( Utilities.Exists( this._physicsBody ) ) {
                this._physicsBody.DestroyFixture( this._fixture );
                this._fixture = undefined;
            }
            if ( Utilities.Exists( this._physicsBody ) ) {
                this._level.InternalPhysicsWorld.DestroyBody( this._physicsBody );
                this._physicsBody = undefined;
            }

            for ( let t of this._triggerables ) {
                t.Destroy();
            }
            this._triggerables.length = 0;
            this._triggerables = undefined;
        }

        public get Level(): Level {
            return this._level;
        }

        public get Position(): THREE.Vector2 {
            return this._position;
        }

        public Update( dt: number ): void {

        }

        public OnLevelLoaded(): void {
            console.debug( "Trigger.OnLevelLoaded:", this );
            if ( this._triggerType === TriggerType.LEVEL_LOADED ) {
                this.Trigger();
            }
        }

        public AddTriggerable( triggerable: ITriggerable ): void {
            this._triggerables.push( triggerable );
        }

        public OnPawnEnter( pawn: Pawn ): void {
            if ( this._triggerType !== TriggerType.LEVEL_LOADED ) {
                this._pawnsInTrigger.push( pawn );
                console.debug( "Trigger.OnPawnEnter:", this, pawn );
                this.Trigger();
            }
        }

        public OnPawnLeave( pawn: Pawn ): void {
            if ( this._triggerType !== TriggerType.LEVEL_LOADED ) {
                let index = this._pawnsInTrigger.indexOf( pawn );
                if ( index !== -1 ) {
                    console.debug( "Trigger.OnPawnLeave:", this, pawn );
                    this._pawnsInTrigger.splice( index, 1 );
                }
            }
        }

        public Trigger(): boolean {
            let incrementTriggerCount = true;
            if ( this._maxTriggerCount === 0 || this._triggerCount < this._maxTriggerCount ) {
                for ( let t of this._triggerables ) {
                    if ( !t.Trigger( this ) ) {
                        incrementTriggerCount = false;
                    }
                }
            } else {
                console.debug( "Trigger cannot be activated more than " + this._maxTriggerCount + " times." );
            }

            if ( incrementTriggerCount ) {
                this._triggerCount++;
            }

            return true;
        }
    }
}