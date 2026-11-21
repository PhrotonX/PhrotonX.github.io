const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const storyboardRoot = document.querySelector("[data-storyboard]");
const storyboardCatalogTimers = [];
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
    document.getElementById("project-date").innerText = `${getMonthName(date.month) || ""}${" "+date.day || ""}, ${date.year || ""} · ${date.progress || ""}`.trim();
    
    // Set description
    (item.description || []).forEach(description => {
        var descriptionParagraph = document.createElement("li");
        descriptionParagraph.innerHTML = description;

        descriptionList.appendChild(descriptionParagraph);
    });

    renderStoryboardActions(item);
    await renderStoryboardCatalogSections(item);
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

async function renderStoryboardCatalogSections(item) {
    const container = document.getElementById("storyboard-catalog-sections");
    if (!container) return;

    container.replaceChildren();
    storyboardCatalogTimers.forEach(timer => window.clearInterval(timer));
    storyboardCatalogTimers.length = 0;
    const sections = [];
    const skills = Array.isArray(item.skills) ? item.skills : [];
    if (skills.length) {
        const source = container.dataset.catalogSource;
        let skillData = {};
        try {
            skillData = source ? await loadJSON(source) : {};
        } catch (error) {
            console.warn(`Unable to load storyboard catalog source: ${source}`, error);
        }
        const skillItems = skillData.item || skillData.items || [];
        const skillsById = new Map(skillItems.map(skill => [skill.id, skill]));
        const resolvedSkills = skills
            .map(skill => typeof skill === "string" ? skill : skill.id)
            .map(skillId => skillsById.get(skillId))
            .filter(skill => skill && !skill.hidden);

        if (resolvedSkills.length) {
            sections.push(
                {
                    title: "Relevant Skills",
                    items: resolvedSkills
                }
            );
        }
    }

    (item.catalog_sections || []).forEach(section => {
        const sectionItems = Array.isArray(section.items)
            ? section.items.filter(entry => entry && !entry.hidden)
            : [];
        if (section.title && sectionItems.length) {
            sections.push({ title: section.title, items: sectionItems });
        }
    });

    sections.forEach(section => {
        const sectionElement = document.createElement("section");
        sectionElement.className = "category storyboard-catalog-section";

        const heading = document.createElement("h2");
        heading.textContent = section.title;
        sectionElement.appendChild(heading);

        const matrix = document.createElement("div");
        matrix.className = "tile-matrix storyboard-catalog-matrix";
        section.items.forEach(entry => matrix.appendChild(createStoryboardCatalogTile(entry)));
        sectionElement.appendChild(matrix);
        container.appendChild(sectionElement);
    });

    updateStoryboardCatalogMatrices();
    const hasSections = sections.length > 0;
    container.hidden = !hasSections;
    document.querySelector('.storyboard-command a[href="#storyboard-catalog-sections"]')
        ?.toggleAttribute("hidden", !hasSections);
}

function createStoryboardCatalogTile(item) {
    const tile = document.createElement("a");
    tile.className = "tile item-tile catalog-tile storyboard-catalog-tile wide";
    tile.href = item.href || (item.id
        ? `../skills/skill.html?id=${encodeURIComponent(item.id)}`
        : "#");
    tile.style.backgroundColor = item.color || "#00a3ee";
    tile.setAttribute("aria-label", `Open ${item.title || "catalog item"}`);

    const images = item.images || [];
    if (images.length) {
        const imageViewport = document.createElement("div");
        imageViewport.className = "tile-image-viewport";
        imageViewport.appendChild(createStoryboardCatalogImage(images[0]));
        tile.classList.add("has-thumbnail");
        tile.appendChild(imageViewport);
    }

    const tileInfo = document.createElement("div");
    tileInfo.className = "tile-info";
    const title = document.createElement("p");
    title.className = "title";
    title.textContent = item.title || "Untitled";
    tileInfo.appendChild(title);
    tile.appendChild(tileInfo);

    if (images.length > 1) {
        const imageViewport = tile.querySelector(".tile-image-viewport");
        const timer = window.setInterval(() => {
            const currentImage = imageViewport.querySelector(".tile-thumbnail.current");
            const nextIndex = (Number(imageViewport.dataset.index || 0) + 1) % images.length;
            const nextImage = createStoryboardCatalogImage(images[nextIndex]);
            nextImage.classList.add("next");
            imageViewport.appendChild(nextImage);
            imageViewport.dataset.index = String(nextIndex);
            window.requestAnimationFrame(() => nextImage.classList.add("is-covering"));
            window.setTimeout(() => {
                currentImage?.remove();
                nextImage.classList.remove("next", "is-covering");
                nextImage.classList.add("current");
            }, 760);
        }, 4200);
        storyboardCatalogTimers.push(timer);
    }

    return tile;

    function createStoryboardCatalogImage(imageData) {
        const image = document.createElement("img");
        image.className = "tile-thumbnail current";
        image.src = new URL(imageData.src, new URL(
            document.getElementById("storyboard-catalog-sections").dataset.catalogSource,
            document.baseURI
        )).href;
        image.alt = imageData.alt || "";
        return image;
    }
}

function updateStoryboardCatalogMatrices() {
    const isMobile = window.matchMedia("(max-width: 700px)").matches;
    const matrices = document.querySelectorAll(".storyboard-catalog-matrix");
    if (isMobile) {
        matrices.forEach(matrix => {
            matrix.style.removeProperty("height");
            matrix.style.removeProperty("--catalog-tile-height");
            matrix.style.removeProperty("--catalog-row-count");
            matrix.querySelectorAll(".catalog-tile").forEach(tile => {
                tile.style.removeProperty("height");
                tile.style.removeProperty("width");
                tile.style.removeProperty("grid-row");
                tile.style.removeProperty("grid-column");
            });
        });
        return;
    }

    const container = document.getElementById("storyboard-catalog-sections");
    if (!container || container.hidden) return;
    const article = container.closest("article");

    matrices.forEach(matrix => {
        const unit = Math.min(48, Math.max(32, window.innerWidth * 0.05));
        const tileHeight = unit * 2 + 4;
        const gap = parseFloat(getComputedStyle(matrix).gap) || 0;
        const availableHeight = Math.max(120,
            (article?.getBoundingClientRect().bottom || window.innerHeight) -
            matrix.getBoundingClientRect().top
        );
        const rows = Math.max(1, Math.floor((availableHeight + gap) / (tileHeight + gap)));

        matrix.style.height = `${availableHeight}px`;
        matrix.style.setProperty("--catalog-tile-height", `${tileHeight}px`);
        matrix.style.setProperty("--catalog-row-count", rows);
        matrix.querySelectorAll(".catalog-tile").forEach((tile, index) => {
            tile.style.height = `${tileHeight}px`;
            tile.style.width = `${unit * 4 + 12}px`;
            tile.style.gridRow = `${(index % rows) + 1}`;
            tile.style.gridColumn = `${Math.floor(index / rows) + 1}`;
        });
    });
}

window.addEventListener("resize", updateStoryboardCatalogMatrices);

function renderStoryboardActions(item) {
    const actions = document.getElementById("storyboard-actions");
    if (!actions) {
        return;
    }

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
    actions.dataset.actionCount = String(actionCount);
    updateStoryboardActionGrid(actions);
    actions.hidden = actions.childElementCount === 0;
    document.querySelector('.storyboard-command a[href="#storyboard-actions"]')
        ?.toggleAttribute("hidden", actions.hidden);
}

const actionColors = ["#087db3", "#245b73", "#3b7d5a", "#7d5a24"];
const actionGridObserver = new ResizeObserver(entries => {
    entries.forEach(({ target }) => updateStoryboardActionGrid(target));
});

function updateStoryboardActionGrid(actions) {
    if (!actions.childElementCount) {
        return;
    }

    const isMobile = window.matchMedia("(max-width: 700px)").matches;
    const actionSize = isMobile ? 112 : 140;
    actions.style.setProperty("--storyboard-action-tile-size", `${actionSize}px`);
}

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