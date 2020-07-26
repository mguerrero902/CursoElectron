"use strict";

// Instanciando los objetos app y BrowserWindow
import { app, BrowserWindow } from "electron";
import devtools from "./devtools";
import setMainIpc from "./ipcMainEvents";
import handleErrors from "./handle-errors";

global.win;

if (process.env.NODE_ENV === "development") {
    devtools();
}

// Imprimiendo un mensaje en la consola antes de salir
app.on("before-quit", () => {
    console.log("Saliendo...");
});

// Ejecutando ordenes cuando la aplicación este lista
app.on("ready", () => {
    //Creando una ventana
    global.win = new BrowserWindow({
        width: 800,
        height: 600,
        title: "Hola Mundo",
        center: true,
        maximizable: false,
        show: false,
        webPreferences: {
            nodeIntegration: true,
        },
    });
    setMainIpc(global.win);
    handleErrors(global.win);

    global.win.once("ready-to-show", () => {
        global.win.show();
    });

    global.win.on("move", () => {
        const position = global.win.getPosition();
        console.log(`la posición es ${position}`);
    });

    //Detectando el cierre de la ventana para cerrar el aplicativo
    global.win.on("closed", () => {
        global.win = null;
        app.quit();
    });

    global.win.loadURL(`file://${__dirname}/renderer/index.html`);
});