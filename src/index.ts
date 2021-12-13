

// Entry point
window.addEventListener( "load", () => {
    if ( window.location.pathname.split( "/" ).pop() === "editor.html" ) {

        // Start the editor.
        let editor = new FPS.Editor();
        ( window as any ).editor = editor;
        editor.Start();
    } else {

        // Start the game.
        let engine = new FPS.Engine();
        ( window as any ).engine = engine;
        engine.Start( "gameArea", "viewport", 1280, 720 );
    }
} )