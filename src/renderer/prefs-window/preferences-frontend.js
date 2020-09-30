import { remote, ipcRenderer } from "electron";
import settings from "electron-settings";
import CryptoJS from "crypto-js";

window.addEventListener("load", () => {
    cancelButton();
    saveButton();
    if (settings.has("cloudup-user")) {
        document.getElementById("cloudup-user").value = settings.getSync(
            "cloudup.user"
        );
    }
    if (settings.has("cloudup-passwd")) {
        const decipher = CryptoJS.AES.decrypt(
            settings.getSync("cloudup.passwd"),
            "Platzipics"
        );
        let decrypted = decipher.toString(CryptoJS.enc.Utf8);
        document.getElementById("cloudup-passwd").value = decrypted;
    }
});

function cancelButton() {
    const cancelButton = document.getElementById("cancel-button");
    cancelButton.addEventListener("click", () => {
        const prefsWindow = remote.getCurrentWindow();
        prefsWindow.close();
    });
}

function saveButton() {
    const prefsWindow = remote.getCurrentWindow();
    const saveButton = document.getElementById("save-button");
    const prefsForm = document.getElementById("preferences-form");
    saveButton.addEventListener("click", () => {
        const encrypted = CryptoJS.AES.encrypt(
            document.getElementById("cloudup-passwd").value,
            "Platzipics"
        ).toString();
        if (prefsForm.reportValidity()) {
            settings.setSync(
                "cloudup.user",
                document.getElementById("cloudup-user").value
            );
            settings.setSync("cloudup.passwd", encrypted);
            prefsWindow.close();
        } else {
            ipcRenderer.send("show-dialog", {
                type: "error",
                title: "Platzipics",
                message: "Por favor complete los campos requeridos",
            });
        }
    });
}