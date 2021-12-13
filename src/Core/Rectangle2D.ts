namespace FPS {

    export class Rectangle2D {

        public X: number = 0;
        public Y: number = 0;
        public W: number = 0;
        public H: number = 0;
    
        public constructor( x: number = 0, y: number = 0, w: number = 0, h: number = 0 ) {
            if ( x !== undefined ) {
                this.X = x;
            }
    
            if ( y !== undefined ) {
                this.Y = y;
            }
    
            if ( w !== undefined ) {
                this.W = w;
            }
    
            if ( h !== undefined ) {
                this.H = h;
            }
        }
    }
}