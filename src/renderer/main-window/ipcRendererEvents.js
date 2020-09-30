import { ipcRenderer, clipboard, remote, shell } from "electron";
import settings from "electron-settings";
import path from "path";
import { saveImage } from "./filters";
import {
    addImagesEvents,
    selectFristImage,
    clearImages,
    loadImages,
} from "./images-ui";
import Cloudup from "cloudup-client";
import CryptoJS from "crypto-js";
import os from "os";

function setIpc() {
    if (settings.has("directory")) {
        ipcRenderer.send("load-directory", settings.getSync("directory"));
    }
    ipcRenderer.on("load-images", (event, dir, images) => {
        clearImages();
        loadImages(images);
        addImagesEvents();
        selectFristImage();
        settings.set("directory", dir);
        console.log(settings.file());
        document.getElementById("directory").innerHTML = dir;
    });
    ipcRenderer.on("save-image", (event, file) => {
        saveImage(file, (err) => {
            if (err) return showDialog("error", "PlatziPics", err.message);
            document.getElementById("image-displayed").dataset.filtered = file;
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

function upLoadImage() {
    let imageNode = document.getElementById("image-displayed").src;
    let image;
    if (imageNode.dataset.filtered) {
        image = imageNode.dataset.filtered;
    } else {
        image = imageNode.src;
    }

    image = image.replace("plp://", "");
    let fileName = path.basename(image);
    if (settings.has("cloudup.user") && settings.has("cloudup.passwd")) {
        document.getElementById("overlay").classList.toggle("hidden");

        const decipher = CryptoJS.AES.decrypt(
            settings.getSync("cloudup.passwd"),
            "Platzipics"
        );
        let decrypted = decipher.toString(CryptoJS.enc.Utf8);

        const client = Cloudup({
            user: settings.getSync("cloudup.user"),
            pass: decrypted,
        });

        const stream = client.stream({ title: `Platzipics - ${fileName}` });
        stream.file(image).save((err) => {
            if (err) {
                showDialog(
                    "error",
                    "Platzipics",
                    "Verifique su conexión y/o sus credenciales de Cloudup"
                );
            } else {
                clipboard.writeTex(strean.url);
                const notify = new Notification("Platzipics", {
                    body: `Imagen cargada con éxito - ${stream.url}, el enlace se copio al portapapeles. De click para abrir la URL`,
                    silent: false,
                });

                notify.onclick = () => {
                    shell.openExternal("stream.url");
                };

                showDialog(
                    "info",
                    "Platzipics",
                    `Imagen cargada con éxito - ${stream.url}, el enlace se copio al portapapeles`
                );
            }
        });
    } else {
        showDialog(
            "error",
            "Platzipics",
            "Por favor complete las preferencias de Cloudup"
        );
    }
}

function pasteImage() {
    const image = clipboard.readImage();
    const data = image.toDataURL();
    if (data.indexOf("data:image/png;base64") !== -1 && !image.isEmpty()) {
        console.log("Ingreso al if del pegado");
        let mainImage = document.getElementById("image-displayed");
        mainImage.src = data;
        mainImage.dataset.original = data;
    } else {
        showDialog(
            "error",
            "Platzipics",
            "No hay una imagen valida en el portapapeles"
        );
    }
}

module.exports = {
    setIpc: setIpc,
    saveFile: saveFile,
    openDirectory: openDirectory,
    openPreferences: openPreferences,
    upLoadImage: upLoadImage,
    pasteImage: pasteImage,
};