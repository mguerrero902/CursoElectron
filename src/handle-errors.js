import { app, dialog } from "electron";

function relaunchApp(win) {
    dialog
        .showMessageBox(win, {
            type: "error",
            title: "PlatziPics",
            message: "Ocurrio un error inesperado, se reiniará el aplicativo",
        })
        .then((result) => {
            app.relaunch();
            app.exit(0);
        })
        .catch((err) => {
            console.log("error: ", err);
        });
}

function setupErrors(win) {
    win.webContents.on("crashed", () => {
        relaunchApp(win);
    });

    win.on("unresponsive", () => {
        dialog.showMessageBox(win, {
            type: "warning",
            title: "PlatziPics",
            message: "Un proceso está tardando demasiado, puede esperar o reiniciar el aplicativo manualmente",
        });
    });
    process.on("uncaughtException", () => {
        relaunchApp(win);
    });
}
module.exports = setupErrors;