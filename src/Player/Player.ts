namespace FPS {

    export class Player {

        private static _health: number = 75;
        private static _armor: number = 0;
        private static _maxHealth: number = 100;
        private static _maxHealthBoosted: number = 200;
        private static _maxArmor: number = 100;
        private static _maxArmorBoosted: number = 200;

        public static GetHealth(): number {
            return Player._health;
        }

        public static SetHealth( health: number ): void {
            Player._health = Math.min( health, Player._maxHealthBoosted );
            Message.Send( "HEALTH_CHANGED", this );
        }

        public static GetArmor(): number {
            return Player._armor;
        }

        public static SetArmor( armor: number ): void {
            Player._armor = Math.min( armor, Player._maxArmorBoosted );
            Message.Send( "ARMOR_CHANGED", this );
        }

        public static AddHealth( amount: number, isBoost: boolean ): void {
            let newHealth = Player._health + amount;
            Player._health = Math.min( newHealth, isBoost ? Player._maxHealthBoosted : Player._maxHealth );
            Message.Send( "HEALTH_CHANGED", this );
        }

        public static RemoveHealth( amount: number ): void {
            let armorChanged = Player._armor > 0;
            let healthChanged = false;
            // Subtract from armor first.
            let newArmor = Player._armor - amount;
            // If all armor was removed, zero it out and subtract remainder from health.
            if ( newArmor < 0 ) {
                Player._armor = 0;
                Player._health = Math.max( 0, Player._health - Math.abs( newArmor ) );
                healthChanged = true;
            } else {
                Player._armor = newArmor;
            }

            if ( armorChanged ) {
                Message.Send( "ARMOR_CHANGED", this );
            }
            if ( healthChanged ) {
                Message.Send( "HEALTH_CHANGED", this );
            }

            if ( Player._health <= 0 ) {
                Player.onDeath();
            }
        }

        public static AddArmor( amount: number, isBoost: boolean ): void {
            let newArmor = Player._armor + amount;
            Player._armor = Math.min( newArmor, isBoost ? Player._maxArmorBoosted : Player._maxArmor );
            Message.Send( "ARMOR_CHANGED", this );
        }

        public static IsHealthFull( boost: boolean ): boolean {
            return Player._health === ( boost ? Player._maxHealthBoosted : Player._maxHealth );
        }

        public static IsArmorFull( boost: boolean ): boolean {
            return Player._armor === ( boost ? Player._maxArmorBoosted : Player._maxArmor );
        }

        private static onDeath(): void {

        }
    }
}