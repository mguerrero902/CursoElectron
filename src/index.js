"use strict";

// Instanciando los objetos app y BrowserWindow
import { app, BrowserWindow, Tray, globalShortcut, protocol } from "electron";
import devtools from "./devtools";
import setMainIpc from "./ipcMainEvents";
import handleErrors from "./handle-errors";
import os from "os";
import path from "path";
import { request } from "http";

global.win;
global.tray;

if (process.env.NODE_ENV === "development") {
    devtools();
}

// Imprimiendo un mensaje en la consola antes de salir
app.on("before-quit", () => {
    globalShortcut.unregisterAll();
});

// Ejecutando ordenes cuando la aplicación este lista
app.on("ready", () => {
    protocol.registerFileProtocol(
        "plp",
        (request, callback) => {
            const url = request.url.substring(6);
            callback({ path: path.normalize(url) });
        },
        (err) => {
            if (err) throw err;
        }
    );

    //Creando una ventana
    global.win = new BrowserWindow({
        width: 800,
        height: 600,
        title: "Platzipics",
        center: true,
        maximizable: false,
        show: false,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    globalShortcut.register("CommandOrControl+Alt+P", () => {
        global.win.show();
        global.win.focus();
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

    let icon;
    if (os.platform() === "win32") {
        icon = path.join(__dirname, "assets", "icons", "tray-icon.ico");
    } else {
        icon = path.join(__dirname, "assets", "icons", "tray-icon.png");
    }
    global.tray = new Tray(icon);
    global.tray.setToolTip("Platzipics");
    global.tray.on("click", () => {
        global.win.isVisible() ? global.win.hide() : global.win.show();
    });

    global.win.loadURL(`file://${__dirname}/renderer/index.html`);
    global.win.toggleDevTools();
});