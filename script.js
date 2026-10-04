const youtubeUrl = document.getElementById("youtubeUrl");

const getBtn = document.getElementById("getBtn");

const clearBtn = document.getElementById("clearBtn");

const result = document.getElementById("result");

const thumbnail = document.getElementById("thumbnail");

const imageLoader = document.getElementById("imageLoader");

const errorMessage = document.getElementById("errorMessage");

const videoIdText = document.getElementById("videoId");

const downloadBtn = document.getElementById("downloadBtn");

const copyBtn = document.getElementById("copyBtn");

const resolutionText = document.getElementById("resolutionText");

const toast = document.getElementById("toast");

const toastText = document.getElementById("toastText");

const qualityButtons =
    document.querySelectorAll(".quality-btn");


let currentVideoId = null;

let currentQuality = "maxresdefault";

let currentImageUrl = null;


/* ================= GET VIDEO ID ================= */

function getYouTubeID(url) {

    const patterns = [

        /(?:youtube\.com\/watch\?v=)([^&]+)/,

        /(?:youtu\.be\/)([^?&]+)/,

        /(?:youtube\.com\/shorts\/)([^?&]+)/,

        /(?:youtube\.com\/embed\/)([^?&]+)/,

        /(?:youtube\.com\/live\/)([^?&]+)/

    ];


    for (const pattern of patterns) {

        const match = url.match(pattern);

        if (match) {
            return match[1];
        }

    }

    return null;
}


/* ================= GET THUMBNAIL ================= */

function getThumbnail() {

    const url = youtubeUrl.value.trim();

    errorMessage.style.display = "none";

    if (!url) {

        showError("Please paste a YouTube video link.");

        return;
    }


    const id = getYouTubeID(url);


    if (!id) {

        showError("Invalid YouTube link. Please check the URL.");

        return;
    }


    currentVideoId = id;

    getBtn.classList.add("loading");

    result.classList.remove("show");


    setTimeout(() => {

        loadThumbnail(id, currentQuality);

    }, 700);

}


/* ================= LOAD IMAGE ================= */

function loadThumbnail(id, quality) {

    const imageUrl =
        `https://img.youtube.com/vi/${id}/${quality}.jpg`;

    currentImageUrl = imageUrl;


    imageLoader.style.display = "flex";

    thumbnail.style.display = "none";


    thumbnail.onload = () => {

        imageLoader.style.display = "none";

        thumbnail.style.display = "block";

        result.classList.add("show");

        getBtn.classList.remove("loading");

    };


    thumbnail.onerror = () => {

        getBtn.classList.remove("loading");

        imageLoader.style.display = "none";

        showError(
            "This thumbnail quality is not available."
        );

    };


    thumbnail.src = imageUrl;


    videoIdText.textContent =
        `ID: ${id.substring(0, 10)}...`;
}


/* ================= QUALITY ================= */

qualityButtons.forEach(button => {

    button.addEventListener("click", () => {

        qualityButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");


        currentQuality =
            button.dataset.quality;


        const qualityName =
            button.dataset.name;


        resolutionText.textContent =
            qualityName;


        if (currentVideoId) {

            loadThumbnail(
                currentVideoId,
                currentQuality
            );

        }

    });

});


/* ================= DOWNLOAD ================= */

downloadBtn.addEventListener("click", async () => {

    if (!currentImageUrl) {
        return;
    }


    try {

        const response =
            await fetch(currentImageUrl);

        const blob =
            await response.blob();


        const blobUrl =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");

        link.href = blobUrl;

        link.download =
            `youtube-thumbnail-${currentVideoId}.jpg`;


        document.body.appendChild(link);

        link.click();

        link.remove();


        URL.revokeObjectURL(blobUrl);


        showToast("Thumbnail downloaded!");

    } catch (error) {

        /*
           If browser blocks direct fetching,
           open the image instead.
        */

        window.open(
            currentImageUrl,
            "_blank"
        );

        showToast(
            "Thumbnail opened. Save it from there."
        );

    }

});


/* ================= COPY URL ================= */

copyBtn.addEventListener("click", async () => {

    if (!currentImageUrl) {
        return;
    }


    try {

        await navigator.clipboard.writeText(
            currentImageUrl
        );

        showToast("Image URL copied!");

    } catch {

        showToast(
            "Could not copy the URL."
        );

    }

});


/* ================= CLEAR ================= */

youtubeUrl.addEventListener("input", () => {

    clearBtn.style.display =
        youtubeUrl.value
            ? "block"
            : "none";

});


clearBtn.addEventListener("click", () => {

    youtubeUrl.value = "";

    clearBtn.style.display = "none";

    result.classList.remove("show");

    youtubeUrl.focus();

});


/* ================= ENTER KEY ================= */

youtubeUrl.addEventListener("keydown", event => {

    if (event.key === "Enter") {

        getThumbnail();

    }

});


getBtn.addEventListener(
    "click",
    getThumbnail
);


/* ================= ERROR ================= */

function showError(message) {

    errorMessage.textContent = message;

    errorMessage.style.display = "block";

    result.classList.remove("show");

    getBtn.classList.remove("loading");

}


/* ================= TOAST ================= */

function showToast(message) {

    toastText.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}