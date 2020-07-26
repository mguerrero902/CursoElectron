import { ipcRenderer, remote } from "electron";
import settings from "electron-settings";
import path from "path";
import { saveImage } from "./filters";
import {
    addImagesEvents,
    selectFristImage,
    clearImages,
    loadImages,
} from "./images-ui";
import os from "os";

async function setIpc() {
    if (settings.has("directory")) {
        ipcRenderer.send("load-directory", await settings.get("directory"));
    }
    ipcRenderer.on("load-images", (event, dir, images) => {
        clearImages();
        loadImages(images);
        addImagesEvents();
        selectFristImage();
        settings.set("directory", dir);
    });
    ipcRenderer.on("save-image", (event, file) => {
        saveImage(file, (err) => {
            if (err) return showDialog("error", "PlatziPics", err.message);
            showDialog("info", "PlatziPics", "La imagen fue guardada");
        });
    });
}

function openPreferences() {
    const BrowserWindow = remote.BrowserWindow;
    const mainWindow = remote.getGlobal("win");
    const preferencesWindow = new BrowserWindow({
        width: 400,
        height: 300,
        title: "Preferencias",
        center: true,
        modal: true,
        frame: false,
        show: false,
        webPreferences: {
            nodeIntegration: true,
        },
    });
    if (os.platform() !== "win32") {
        preferencesWindow.setParentWindow(mainWindow);
    }
    preferencesWindow.once("ready-to-show", () => {
        preferencesWindow.show();
        preferencesWindow.focus();
    });
    preferencesWindow.loadURL(
        `file://${path.join(__dirname, "..")}/preferences.html`
    );
}

function openDirectory() {
    ipcRenderer.send("open-directory");
}

function showDialog(type, title, msg) {
    ipcRenderer.send("show-dialog", {
        type: type,
        title: title,
        message: msg,
    });
}

function saveFile() {
    const image = document.getElementById("image-displayed").dataset.original;
    const ext = path.extname(image);
    ipcRenderer.send("open-save-dialog", ext);
}

module.exports = {
    setIpc: setIpc,
    saveFile: saveFile,
    openDirectory: openDirectory,
    openPreferences: openPreferences,
};