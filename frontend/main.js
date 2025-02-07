import html2canvas from "html2canvas";

// find elements -------------------------------------------------------------
const app = document.getElementById("app");
const dropdown = document.getElementById("dropdown-button");
const dropdownMenu = document.querySelector(".dropdown-content");
const generateButton = document.getElementById("generate-button");
const radioButtons = document.querySelectorAll('input[type="radio"]');
const articleTitle = document.getElementById("article-title");
const articleImg = document.getElementById("article-img");
const articleDate = document.getElementById("article-date");
const articleContent = document.getElementById("article-content");
const articleElement = document.querySelector(".article");
const downloadDiv = document.querySelector(".download");
const weblink = document.getElementById("weblink");
const downloadButton = document.getElementById("download-button");
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const articleEndpoint = `${backendUrl}/article?category=`;
const generatedEndpoint = `${backendUrl}/generated?seed=`;

// functions -------------------------------------------------------------

// get the current category selected
const getCurrentCategory = () => {
    const checkedRadio = Array.from(radioButtons).find((radio) => radio.checked);
    return checkedRadio.value;
};

// capture the screen based on DOM elements and dwonload as image
const captureScreen = async () => {
    const articleScreen = await html2canvas(articleElement, {
        logging: true,
        ignoreElements: (element) => element.id === "download-button",
        backgroundColor:
            window.matchMedia &&
                window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "#242424"
                : "#ffffff",
    });

    const link = document.createElement("a");
    link.href = articleScreen.toDataURL();
    link.download = "article-screenshot.png";
    link.click();
};

// handle download button click
const downloadArticle = async () => {
    try {
        downloadButton.disabled = true;
        await captureScreen();
        downloadButton.disabled = false;
    } catch (error) {
        console.error(error);
        downloadButton.disabled = false;
    }
};

// fetch article from API given the category
const generateArticle = async () => {
    try {
        generateButton.disabled = true;
        articleElement.classList.remove("is-active");

        const category = getCurrentCategory();

        console.log(`${articleEndpoint}${category}`);

        const response = await fetch(`${articleEndpoint}${category}`);
        const data = await response.json();

        console.log(data.response);

        populateArticle(data);

        generateButton.disabled = false;
        dropdownMenu.classList.remove("is-active");
    } catch (error) {
        console.error(error);
        generateButton.disabled = false;
    }
};

// check for seed in URL and fetch previous article - does nothing if no seed
const checkForSeed = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const seed = urlParams.get("seed");

    if (seed) {
        try {
            generateButton.disabled = true;
            articleElement.classList.remove("is-active");

            console.log(`${generatedEndpoint}${seed}`);

            const response = await fetch(`${generatedEndpoint}${seed}`);
            if (response.status !== 200) {
                throw new Error("Seed not found");
            }
            const data = await response.json();

            console.log(data.response);

            populateArticle(data);

            generateButton.disabled = false;
            dropdownMenu.classList.remove("is-active");
        } catch (error) {
            console.error(error);
            generateButton.disabled = false;
        }
    }
};

// populate the article with given json data
const populateArticle = (data) => {
    articleElement.classList.add("is-active");
    articleTitle.textContent = data.response.title;
    articleImg.src = `data:image/jpeg;base64,${data.response.urlToImage}`;
    articleDate.textContent = data.response.publishedAt;
    articleContent.textContent = data.response.content;
    const generatedLink =
        window.location.origin +
        window.location.pathname +
        `?seed=${data.response.seed}`;
    weblink.textContent = generatedLink;
    window.history.replaceState({}, "", generatedLink);
};

// event listeners -------------------------------------------------------------
dropdown.addEventListener("click", () => {
    dropdownMenu.classList.toggle("is-active");
});

generateButton.addEventListener("click", generateArticle);
downloadButton.addEventListener("click", downloadArticle);

// main -------------------------------------------------------------------------
checkForSeed();
