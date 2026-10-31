const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const storyboardRoot = document.querySelector("[data-storyboard]");
loadStoryboardItem(id, storyboardRoot.dataset.storyboardData);

async function loadStoryboardItem(itemId, jsonPath){
    const json = await loadJSON(jsonPath);

    var descriptionList = document.getElementById("description");
    
    const records = json.item || json.items || [];
    const item = records.find(record => record.id === itemId) ||
        records.find(record => record.id.includes(itemId));

    if (!item) {
        document.getElementById("app-name").innerText = "Project not found";
        document.body.dataset.ready = "true";
        return;
    }

    // Set app names
    document.getElementById("title").innerHTML = item.title + " - Charles Martin's Portfolio";
    document.getElementById("app-name").innerHTML = item.title;
    const date = item.date?.[0] || {};
    const category = item.category || "Uncategorized";
    document.getElementById("project-category").innerText = category;
    document.getElementById("project-date").innerText = `${date.year || ""} · ${date.progress || ""}`.trim();
    
    // Set description
    (item.description || []).forEach(description => {
        var descriptionParagraph = document.createElement("li");
        descriptionParagraph.innerHTML = description;

        descriptionList.appendChild(descriptionParagraph);
    });

    renderStoryboardActions(item);
    initializeStoryboardNavigation();

    // Set images
    var galleryCarousel = document.getElementById("gallery-carousel");
    var imagePaths = item.images || [];
    document.getElementById("gallery-count").innerText = `${imagePaths.length} IMAGE${imagePaths.length === 1 ? "" : "S"}`;
    if(imagePaths.length){
        imagePaths.forEach((imagePath, index) => {
            var galleryItem = document.createElement("img");
            galleryItem.src = imagePath.src;
            galleryItem.alt = imagePath.alt || `${item.title} image ${index + 1}`;
            galleryItem.dataset.index = String(index);

            galleryCarousel.appendChild(galleryItem);

            var indicator = document.createElement("button");
            indicator.type = "button";
            indicator.className = "gallery-indicator";
            indicator.ariaLabel = `Show image ${index + 1}`;
            indicator.addEventListener("click", () => {
                galleryItem.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
            });
            document.getElementById("gallery-indicators").appendChild(indicator);
        });
    }

    function initializeStoryboardNavigation() {
        document.querySelectorAll(".storyboard-command a").forEach(link => {
            link.addEventListener("click", event => {
                const target = document.querySelector(link.getAttribute("href"));
                if (!target) return;

                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
            });
        });
    }

    const images = [...galleryCarousel.querySelectorAll("img")];
    const updateGalleryState = () => {
        const index = Math.round(galleryCarousel.scrollLeft / galleryCarousel.clientWidth);
        document.querySelectorAll(".gallery-indicator").forEach((indicator, indicatorIndex) => {
            indicator.classList.toggle("is-selected", indicatorIndex === index);
        });
        document.getElementById("gallery-previous").disabled = index <= 0;
        document.getElementById("gallery-next").disabled = index >= images.length - 1;
    };

    document.getElementById("gallery-previous").addEventListener("click", () => {
        galleryCarousel.scrollBy({ left: -galleryCarousel.clientWidth, behavior: "smooth" });
    });
    document.getElementById("gallery-next").addEventListener("click", () => {
        galleryCarousel.scrollBy({ left: galleryCarousel.clientWidth, behavior: "smooth" });
    });
    galleryCarousel.addEventListener("scroll", updateGalleryState, { passive: true });
    updateGalleryState();

    document.body.dataset.ready = "true";
}

function renderStoryboardActions(item) {
    const actions = document.getElementById("storyboard-actions");
    const buttons = item.buttons || item.button || [];
    actions.replaceChildren();

    buttons.forEach((button, index) => {
        const action = parseStoryboardAction(button.action);
        if (!action.href) {
            return;
        }

        const link = document.createElement("a");
        link.className = "storyboard-action-tile";
        link.href = action.href;
        link.target = button.target === "_blank" ? "_blank" : "_self";
        link.rel = link.target === "_blank" ? "noopener noreferrer" : "";
        link.style.setProperty("--storyboard-action-color", button.color || actionColors[index % actionColors.length]);
        link.setAttribute("aria-label", button.content || "Open project action");

        const label = document.createElement("span");
        label.textContent = button.content || "Open";
        link.appendChild(label);
        actions.appendChild(link);
    });

    const actionCount = actions.childElementCount;
    actions.style.setProperty("--storyboard-action-columns", String(Math.min(actionCount, 2)));
    actions.style.setProperty(
        "--storyboard-action-size",
        actionCount === 1 ? "clamp(160px, 18vw, 220px)" : "clamp(112px, 10vw, 140px)"
    );
    actions.hidden = actions.childElementCount === 0;
    document.querySelector('.storyboard-command a[href="#storyboard-actions"]')
        ?.toggleAttribute("hidden", actions.hidden);
}

const actionColors = ["#087db3", "#245b73", "#3b7d5a", "#7d5a24"];

function parseStoryboardAction(action) {
    if (typeof action !== "string") {
        return {};
    }

    const separator = action.indexOf("=");
    if (separator === -1) {
        return {};
    }

    return {
        [action.slice(0, separator)]: action.slice(separator + 1)
    };
}