namespace FPS {

    export enum InventoryItem {
        RED_KEY = "InventoryItem.RedKey",
        BLUE_KEY = "InventoryItem.BlueKey",
        YELLOW_KEY = "InventoryItem.YellowKey",
        SKELETON_KEY = "InventoryItem.SkeletonKey",
        BACKPACK = "InventoryItem.Backpack",

        PISTOL = "InventoryItem.Pistol",
        PISTOL_AMMO = "InventoryItem.PistolAmmo",
        SHOTGUN = "InventoryItem.Shotgun",
        SHOTGUN_AMMO = "InventoryItem.ShotgunAmmo",
        RIFLE = "InventoryItem.Rifle",
        RIFLE_AMMO = "InventoryItem.RifleAmmo",
        ROCKETLAUNCHER = "InventoryItem.RocketLauncher",
        ROCKETLAUNCHER_AMMO = "InventoryItem.RocketLauncherAmmo",
        BFG = "InventoryItem.Bfg",
        BFG_AMMO = "InventoryItem.BfgAmmo",

        HEALTH = "InventoryItem.Health",
        ARMOR = "InventoryItem.Armor"
    }

    class InventoryRecord {
        public Count: number;
        public Max: number;
        public constructor( max: number = 1, count: number = 0 ) {
            this.Max = max;
            this.Count = count;
        }
    }

    export class Inventory {

        // Super-simple inventory just keeps the name of an item and how many of that item
        // the player has along with a max.
        private static _items: { [name: string]: InventoryRecord } = {};

        private constructor() {
        }

        public static Initialize(): void {

            // Standard items.
            Inventory._items[InventoryItem.RED_KEY] = new InventoryRecord();
            Inventory._items[InventoryItem.BLUE_KEY] = new InventoryRecord();
            Inventory._items[InventoryItem.YELLOW_KEY] = new InventoryRecord();
            Inventory._items[InventoryItem.SKELETON_KEY] = new InventoryRecord();
            Inventory._items[InventoryItem.BACKPACK] = new InventoryRecord();

            // Weapons
            Inventory._items[InventoryItem.PISTOL] = new InventoryRecord();
            Inventory._items[InventoryItem.PISTOL_AMMO] = new InventoryRecord( 50 );

            Inventory._items[InventoryItem.SHOTGUN] = new InventoryRecord();
            Inventory._items[InventoryItem.SHOTGUN_AMMO] = new InventoryRecord( 40 );

            Inventory._items[InventoryItem.RIFLE] = new InventoryRecord();
            Inventory._items[InventoryItem.RIFLE_AMMO] = new InventoryRecord( 200 );

            Inventory._items[InventoryItem.ROCKETLAUNCHER] = new InventoryRecord();
            Inventory._items[InventoryItem.ROCKETLAUNCHER_AMMO] = new InventoryRecord( 8 );

            Inventory._items[InventoryItem.BFG] = new InventoryRecord();
            Inventory._items[InventoryItem.BFG_AMMO] = new InventoryRecord( 4 );
        }

        public static Reset(): void {
            // Standard items.
            Inventory._items[InventoryItem.RED_KEY].Count = 0;
            Inventory._items[InventoryItem.BLUE_KEY].Count = 0;
            Inventory._items[InventoryItem.YELLOW_KEY].Count = 0;
            Inventory._items[InventoryItem.SKELETON_KEY].Count = 0;
            Inventory._items[InventoryItem.BACKPACK].Count = 0;

            // Weapons
            Inventory.ResetWeapons();
        }

        public static ResetWeapons(): void {
            Inventory._items[InventoryItem.PISTOL].Count = 0;
            Inventory._items[InventoryItem.PISTOL_AMMO].Count = 0;

            Inventory._items[InventoryItem.SHOTGUN].Count = 0;
            Inventory._items[InventoryItem.SHOTGUN_AMMO].Count = 0;

            Inventory._items[InventoryItem.RIFLE].Count = 0;
            Inventory._items[InventoryItem.RIFLE_AMMO].Count = 0;

            Inventory._items[InventoryItem.ROCKETLAUNCHER].Count = 0;
            Inventory._items[InventoryItem.ROCKETLAUNCHER_AMMO].Count = 0;

            Inventory._items[InventoryItem.BFG].Count = 0;
            Inventory._items[InventoryItem.BFG_AMMO].Count = 0;
        }

        public static HasItem( item: InventoryItem ): boolean {
            return Inventory.ItemCount( item ) > 0;
        }

        public static IsItemFull( item: InventoryItem ): boolean {
            return Inventory._items[item].Count === Inventory._items[item].Max;
        }

        public static ItemCount( item: InventoryItem ): number {
            return Inventory._items[item].Count;
        }

        /**
         * Attempts to add an item to inventory. Not added if max is already held.
         * @param item The item to be added.
         * @param amount The amount to be added.
         * @returns true if any amount was added; otherwise false.
         */
        public static AddItem( item: InventoryItem, amount: number = 1 ): boolean {
            if ( Inventory.IsItemFull( item ) ) {
                return false;
            } else {
                Inventory._items[item].Count = Math.min( Inventory._items[item].Max, Inventory._items[item].Count + amount );
                if ( item === InventoryItem.SHOTGUN ) {
                    // TODO: Auto-select
                }
                return true;
            }
        }

        public static SetItem( item: InventoryItem, count: number ): void {
            Inventory._items[item].Count = Math.min( count, Inventory._items[item].Max );
        }

        public static RemoveItem( item: InventoryItem, count: number = 1 ): void {
            Inventory._items[item].Count = Math.max( 0, Inventory._items[item].Count - 1 );
        }
    }
}