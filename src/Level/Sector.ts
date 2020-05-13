import { SectorType } from "./SectorType";

export class Sector {
    public Type: SectorType = SectorType.NONE;
    public LightColour: string = "#FFFFFF";

    public readonly X: number;
    public readonly Y: number;

    public constructor( type: SectorType, lightColor: string, x: number, y: number ) {
        this.Type = type;
        this.LightColour = lightColor;
        this.X = x;
        this.Y = y;
    }
}