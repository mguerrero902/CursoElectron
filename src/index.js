"use strict";

// Instanciando los objetos app y BrowserWindow
import { app, BrowserWindow } from "electron";
import devtools from "./devtools";

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
    let win = new BrowserWindow({
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

    win.once("ready-to-show", () => {
        win.show();
    });

    win.on("move", () => {
        const position = win.getPosition();
        console.log(`la posición es ${position}`);
    });

    //Detectando el cierre de la ventana para cerrar el aplicativo
    win.on("closed", () => {
        win = null;
        app.quit();
    });

    win.loadURL(`file://${__dirname}/renderer/index.html`);
    win.toggleDevTools();
});