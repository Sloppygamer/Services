// List of base domains to try (priority order)
const baseDomains = [
    "https://satoru.sakuhentai.net/animes",
    "https://www.sakuhentai.net/animes"
];

// Dataset for quick access names
const quickAccessData = {
    bleach: [
        "unohana-onsen-ragnarock",
        "unohana-bubbleteexl",
        "unohana-red-bikini-eternoai",
        "unohana-lingerie-eternoai",
        "unohana-banshou",
        "rangiku-ragnarock",
        "yoruichi-lingerie-aindroid",
        "yoruichi-shower-eternoai",
        "nemu-artkoikoi",
        "yoruichi-black-crop-top-temptart",
        "orihime-yukinoai",
        "nemu-lingerie-eternoai"
    ],
    "one-piece": [
        "hancock-kanuck",
        "nico-robin-wano-ragnarock",
        "nico-robin-bikini-meowlucy",
        "boa-hancock-lingerie-mumeiai",
        "boa-hancock-mumeiai",
        "boa-hancock-ragnarock",
        "one-piece/nico-robin-a4ye",
        "robin-ragnarock",
        "boa-hancock-muaverai",
        "nico-robin-egghead-artkoikoi",
        "nico-robin-hentai-fishman-island-eternoai"
    ],
    "kimetsu-no-yaiba": [
        "mitsuri-outdoor-asimpleningen",
        "mitsuri-kimono-asimpleningen",
        "mitsuri-asimpleningen",
        "mitsuri-subaruarm",
        "shinobu-sportswear-subaruarm",
        "shinobu-nix",

    ],
    "black-clover": [
        "mimosa-onsen-eternoai",
        "noelle-machina",
        "mimosa-kanuck"
    ]
};

// DOM elements
const slideToggleBtn = document.getElementById("slideToggleBtn");
const displayImage = document.getElementById("displayImage");
const rightPanel = document.getElementById("quickAccessPanel");
const menuToggleBtn = document.getElementById("menuToggleBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// State variables
let currentSection = "bleach";
let currentAnime = "unohana-onsen-ragnarock";
let imageList = [];
let currentIndex = 0;
let slideshowInterval = null;
let isSlideshowRunning = false;

// Format number to 2-digit string
function formatNumber(num) {
    return num < 10 ? "0" + num : num.toString();
}

// Build grouped image URLs
function buildImageUrls(section, animeName, startNumber = 1, maxImages = 20) {
    const urlGroups = [];
    for (let i = startNumber; i < startNumber + maxImages; i++) {
        const numStr = formatNumber(i);
        const group = baseDomains.map(domain =>
            `${domain}/${section}/${animeName}-${numStr}.webp`
        );
        urlGroups.push(group);
    }
    return urlGroups;
}

// Preload image
function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(url);
        img.src = url;
    });
}

// Load images with failure limit
async function loadImagesWithFailureLimit(urlGroups, maxFailuresAllowed = 3) {
    const loadedUrls = [];
    let consecutiveFailures = 0;

    for (const group of urlGroups) {
        try {
            const url = await Promise.any(group.map(preloadImage));
            loadedUrls.push(url);
            consecutiveFailures = 0;
        } catch {
            consecutiveFailures++;
            if (consecutiveFailures >= maxFailuresAllowed) break;
        }
    }
    return loadedUrls;
}

// Show image
function showImage(index) {
    if (imageList.length === 0) {
        displayImage.src = "";
        displayImage.alt = "No images loaded";
        return;
    }
    currentIndex = (index + imageList.length) % imageList.length;
    displayImage.src = imageList[currentIndex];
    displayImage.alt = `Image ${currentIndex + 1} of ${imageList.length}`;
}

// Slideshow controls
function startSlideshow() {
    if (isSlideshowRunning || imageList.length === 0) return;
    isSlideshowRunning = true;
    slideToggleBtn.innerHTML = `<i class="fas fa-pause"></i> Stop`;
    slideshowInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % imageList.length;
        showImage(currentIndex);
    }, 2000);
}

function stopSlideshow() {
    isSlideshowRunning = false;
    slideToggleBtn.innerHTML = `<i class="fas fa-play"></i> Start`;
    clearInterval(slideshowInterval);
    slideshowInterval = null;
}

function toggleSlideshow() {
    if (isSlideshowRunning) stopSlideshow();
    else startSlideshow();
}

// Load and show images
async function loadAndShowImages() {
    slideToggleBtn.disabled = true;
    stopSlideshow();
    displayImage.src = "";
    displayImage.alt = "Loading images...";
    const urlGroups = buildImageUrls(currentSection, currentAnime, 1, 20);
    imageList = await loadImagesWithFailureLimit(urlGroups, 3);
    if (imageList.length > 0) {
        showImage(0);
    } else {
        displayImage.alt = "No images found.";
    }
    slideToggleBtn.disabled = false;
}

// Quick access UI
function createQuickAccessUI() {
    rightPanel.innerHTML = "";
    for (const section in quickAccessData) {
        const sectionTitle = document.createElement("h2");
        sectionTitle.textContent = section.replace("-", " ").toUpperCase();
        rightPanel.appendChild(sectionTitle);

        const ul = document.createElement("ul");
        ul.classList.add("anime-list");

        quickAccessData[section].forEach((animeName) => {
            const li = document.createElement("li");
            const btn = document.createElement("button");
            btn.textContent = animeName.replace(/-/g, " ");
            btn.classList.add("anime-link");
            btn.type = "button";
            btn.setAttribute("aria-label", `Load images for ${animeName}`);

            btn.addEventListener("click", () => {
                currentSection = section;
                currentAnime = animeName;
                loadAndShowImages();
                if (window.innerWidth < 769) {
                    toggleQuickAccessPanel(false);
                }
            });

            li.appendChild(btn);
            ul.appendChild(li);
        });

        rightPanel.appendChild(ul);
    }
}

// Toggle quick access
function toggleQuickAccessPanel(show) {
    if (show) rightPanel.classList.remove("hidden");
    else rightPanel.classList.add("hidden");
}

// Events
menuToggleBtn.addEventListener("click", () => {
    toggleQuickAccessPanel(rightPanel.classList.contains("hidden"));
});

slideToggleBtn.addEventListener("click", toggleSlideshow);

prevBtn.addEventListener("click", () => {
    if (imageList.length === 0) return;
    stopSlideshow();
    showImage(currentIndex - 1);
});

nextBtn.addEventListener("click", () => {
    if (imageList.length === 0) return;
    stopSlideshow();
    showImage(currentIndex + 1);
});

window.addEventListener("resize", () => {
    if (window.innerWidth >= 769) rightPanel.classList.remove("hidden");
    else rightPanel.classList.add("hidden");
});

// Init
function init() {
    createQuickAccessUI();
    if (window.innerWidth >= 769) rightPanel.classList.remove("hidden");
    else rightPanel.classList.add("hidden");
    loadAndShowImages();
}
init();
