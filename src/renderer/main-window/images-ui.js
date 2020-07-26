import url from "url";
import path from "path";
import { applyFilter } from "./filters";

function addImagesEvents() {
    const thumbs = document.querySelectorAll("li.list-group-item");

    for (let i = 0; i < thumbs.length; i++) {
        thumbs[i].addEventListener("click", function() {
            changeImage(this);
        });
    }
}

function changeImage(node) {
    if (node) {
        const selected = document.querySelector("li.selected");
        if (selected) {
            selected.classList.remove("selected");
        }
        node.classList.add("selected");
        const image = document.getElementById("image-displayed");
        image.src = node.querySelector("img").src;
        image.dataset.original = image.src;
        document.getElementById("filters").selectedIndex = 0;
    } else {
        document.getElementById("image-displayed").src = "";
    }
}

function selectFristImage() {
    const image = document.querySelector("li.list-group-item:not(.hidden)");
    changeImage(image);
}

function searchImagesEvent() {
    const searchBox = document.getElementById("search-box");
    searchBox.addEventListener("keyup", function() {
        const regex = new RegExp(this.value.toLowerCase(), "gi");
        if (this.value.length > 0) {
            const thumbs = document.querySelectorAll("li.list-group-item img");
            for (let i = 0; i < thumbs.length; i++) {
                const fileUrl = url.parse(thumbs[i].src);
                const fileName = path.basename(fileUrl.pathname);
                if (fileName.match(regex)) {
                    thumbs[i].parentNode.classList.remove("hidden");
                } else {
                    thumbs[i].parentNode.classList.add("hidden");
                }
            }
            selectFristImage();
        } else {
            const hidden = document.querySelectorAll("li.hidden");
            for (let i = 0; i < hidden.length; i++) {
                hidden[i].classList.remove("hidden");
            }
        }
    });
}

function selectEvent() {
    const select = document.getElementById("filters");
    select.addEventListener("change", function() {
        applyFilter(this.value, document.getElementById("image-displayed"));
    });
}

function clearImages() {
    const oldImages = document.querySelectorAll("li.list-group-item");
    for (let i = 0; i < oldImages.length; i++) {
        oldImages[i].parentNode.removeChild(oldImages[i]);
    }
}

function loadImages(images) {
    const imagesList = document.querySelectorAll("ul.list-group");
    for (let i = 0; i < images.length; i++) {
        images[i];
        const node = `<li class="list-group-item">
                            <img class="media-object pull-left" src="${images[i].src}" height="32">
                            <div class="media-body">
                                <strong>${images[i].filename}</strong>
                                <p>${images[i].size}</p>
                            </div>
                        </li>`;
        imagesList[0].insertAdjacentHTML("beforeend", node);
    }
}

module.exports = {
    addImagesEvents: addImagesEvents,
    changeImage: changeImage,
    selectFristImage: selectFristImage,
    selectEvent: selectEvent,
    searchImagesEvent: searchImagesEvent,
    loadImages: loadImages,
    clearImages: clearImages,
};