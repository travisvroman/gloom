namespace FPS {

    export class LevelContactListener extends Box2D.Dynamics.b2ContactListener implements IDestroyable {

        public constructor() {
            super();
        }

        public Destroy(): void {
        }

        public BeginContact( contact: Box2D.Dynamics.Contacts.b2Contact ): void {
            let fixtureA = contact.GetFixtureA();
            let fixtureB = contact.GetFixtureB();

            let sensorA = fixtureA.IsSensor();
            let sensorB = fixtureB.IsSensor();

            // If they are both sensors, or neither are sensors, boot out.
            if ( ( sensorA && sensorB ) || ( !sensorA && !sensorB ) ) {
                return;
            }

            let owner: any;
            let trigger: Trigger;
            if ( sensorA ) {
                trigger = fixtureA.GetUserData() as Trigger;
                owner = fixtureB.GetBody().GetUserData();
            } else {
                trigger = fixtureB.GetUserData() as Trigger;
                owner = fixtureA.GetBody().GetUserData();
            }

            // If it's a pawn, trigger any linked effects.
            if ( owner instanceof Pawn ) {
                if ( Utilities.Exists( trigger ) ) {
                    trigger.OnPawnEnter( owner );
                } else {
                    console.warn( "BeginContact: Sensor fixture without trigger:", sensorA ? fixtureA : fixtureB );
                }
            }
        }

        public EndContact( contact: Box2D.Dynamics.Contacts.b2Contact ): void {
            let fixtureA = contact.GetFixtureA();
            let fixtureB = contact.GetFixtureB();

            let sensorA = fixtureA.IsSensor();
            let sensorB = fixtureB.IsSensor();

            // If they are both sensors, or neither are sensors, boot out.
            if ( ( sensorA && sensorB ) || ( !sensorA && !sensorB ) ) {
                return;
            }

            let owner: any;
            let trigger: Trigger;
            if ( sensorA ) {
                trigger = fixtureA.GetUserData() as Trigger;
                owner = fixtureB.GetBody().GetUserData();
            } else {
                trigger = fixtureB.GetUserData() as Trigger;
                owner = fixtureA.GetBody().GetUserData();
            }

            // If it's a pawn, trigger any linked effects.
            if ( owner instanceof Pawn ) {
                if ( Utilities.Exists( trigger ) ) {
                    trigger.OnPawnLeave( owner );
                } else {
                    console.warn( "EndContact: Sensor fixture without trigger:", sensorA ? fixtureA : fixtureB );
                }
            }
        }
    }
}