export class TMath {

    /**
     * Returns the provided rotation in radians.
     * @param degrees The rotation in degrees.
     */
    public static DegToRad( degrees: number ): number {
        return degrees * Math.PI / 180.0;
    }

    /**
     * Returns the provided rotation in degrees.
     * @param radians The rotation in radians.
     */
    public static RadToDeg( radians: number ): number {
        return radians * 180.0 / Math.PI;
    }

    /**
     * Returns value within the range of min/max.
     * @param value The value to be clamped.
     * @param min The minimum value.
     * @param max The maximum value.
     */
    public static Clamp( value: number, min: number, max: number ): number {
        if ( value < min ) {
            return min;
        }
        if ( value > max ) {
            return max;
        }
        return value;
    }
}