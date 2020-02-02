import { Engine } from "./Core/Engine"

window.onload = () => {
    let engine = new Engine(
        document.getElementById( "viewport" ) as HTMLCanvasElement,
        document.getElementById( "gameArea" ) as HTMLDivElement );
    engine.Start( 1280, 720 );
}