var fsExtra = require("fs-extra");
var cp = require("child_process");

console.log("\x1b[35m***BUILD***\x1b[0m");

console.log("Cleaning...");
fsExtra.emptyDirSync("dist");

console.log("Building...");
try {
    cp.execSync("node ./node_modules/webpack-cli/bin/cli.js", {
        stdio: "inherit"
    });
    console.log("\x1b[35m***BUILD COMPLETE***\x1b[0m");
} catch (ex) {
    console.log(ex.stdout);
    console.log("\x1b[35m***BUILD FAILED***\x1b[0m");
}

console.log("Copying www...");
fsExtra.copySync("www/", "dist");

console.log("Copying assets...");
fsExtra.copySync("assets/", "dist/assets");

console.log("\x1b[35m***BUILD COMPLETE***\x1b[0m");