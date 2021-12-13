namespace FPS {

    export enum DataName {
        
        /**
         * The current light color based on the player position.
         */
        PLAYER_POSITION_LIGHT_COLOR = "playerPositionColor",
        PLAYER_IS_MOVING = "playerIsMoving",
        SELECTED_WEAPON = "selectedWeapon"
    }

    /**
     * Manages data in a globally-accessible way.
     */
    export class DataManager {

        private static _data: { [name: string]: any } = {};

        // Marked private to enforce singleton pattern.
        private constructor() {
        }

        /**
         * Gets a value with the given name.
         * @param name The name of the data value to get.
         */
        public static GetValue<T>( name: string ): T {
            return DataManager._data[name] as T;
        }

        /**
         * Sets a value with the given name.
         * @param name The name of the data value to set.
         * @param value The value to be set.
         */
        public static SetValue<T>( name: string, value: T ): void {
            DataManager._data[name] = value;
        }
    }
}