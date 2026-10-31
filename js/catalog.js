const catalogRoot = document.querySelector("[data-catalog]");
const catalogGrid = document.getElementById("catalog-grid");
const sortButtons = document.querySelectorAll("[data-sort]");
let items = [];
let slideshowTimers = [];

sortButtons.forEach(button => {
    button.addEventListener("click", () => {
        sortButtons.forEach(item => item.classList.toggle("is-selected", item === button));
        renderCatalog(button.dataset.sort);
    });

});

export async function loadItems(defaultSort, filename) {
    const json = await loadJSON(filename);
    items = (json.item || json.items || []).filter(item => !item.hidden);
    renderCatalog(defaultSort);
}

function renderCatalog(sortMode) {
    slideshowTimers.forEach(timer => window.clearInterval(timer));
    slideshowTimers = [];
    catalogGrid.innerHTML = "";

    groupItems(sortMode).forEach(group => {
        const categorySection = document.createElement("section");
        categorySection.className = "category";

        const categoryHeading = document.createElement("h2");
        categoryHeading.innerText = group.label;
        categorySection.appendChild(categoryHeading);

        const tileMatrix = document.createElement("div");
        tileMatrix.className = "tile-matrix";
        group.items.forEach(item => tileMatrix.appendChild(createCatalogTile(item)));
        categorySection.appendChild(tileMatrix);
        catalogGrid.appendChild(categorySection);
    });

    updateMatrixRows();
}

function updateMatrixRows() {
    if (window.matchMedia("(max-width: 700px)").matches) {
        return;
    }

    document.querySelectorAll(".tile-matrix").forEach(matrix => {
        const unit = Math.min(48, Math.max(32, window.innerWidth * 0.05));
        const tileHeight = unit * 2 + 4;
        const gap = parseFloat(getComputedStyle(matrix).gap) || 0;
        const rows = Math.max(1, Math.floor((matrix.clientHeight + gap) / (tileHeight + gap)));
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

const matrixResizeObserver = new ResizeObserver(updateMatrixRows);
matrixResizeObserver.observe(document.querySelector("main"));
window.addEventListener("resize", updateMatrixRows);

function groupItems(sortMode) {
    if (sortMode === "category") {
        const categories = new Map();
        [...items]
            .sort((a, b) => itemCategory(a).localeCompare(itemCategory(b)) || itemDate(b) - itemDate(a))
            .forEach(item => {
                const category = itemCategory(item);
                if (!categories.has(category)) {
                    categories.set(category, []);
                }
                categories.get(category).push(item);
            });
        return [...categories].map(([label, items]) => ({ label, items }));
    }

    const sorted = [...items].sort((a, b) => {
        const difference = itemDate(b) - itemDate(a);
        return sortMode === "date-asc" ? -difference : difference;
    });
    const years = new Map();

    sorted.forEach(item => {
        const year = item.date?.[0]?.year || "Other";
        if (!years.has(year)) {
            years.set(year, []);
        }
        years.get(year).push(item);
    });

    return [...years].map(([label, items]) => ({ label, items }));
}

function itemDate(item) {
    const date = item.date?.[0] || {};
    return Date.UTC(date.year, (date.month || 1) - 1, date.day || 1);
}

function itemCategory(item) {
    return item.category || "Other";
}

function createCatalogTile(item) {
    const catalogTile = document.createElement("div");
    catalogTile.className = "tile item-tile catalog-tile wide";
    const unit = Math.min(48, Math.max(32, window.innerWidth * 0.05));
    const tileHeight = unit * 2 + 4;
    catalogTile.style.height = `${tileHeight}px`;
    catalogTile.style.width = `${unit * 4 + 12}px`;
    catalogTile.style.alignSelf = "start";
    catalogTile.setAttribute("role", "link");
    catalogTile.setAttribute("tabindex", "0");
    catalogTile.setAttribute("aria-label", `Open ${item.title}`);
    catalogTile.style.backgroundColor = item.color || "#00a3ee";

    const openProject = () => {
        window.location.href = catalogRoot.dataset.catalogLink
            .replace("{id}", encodeURIComponent(item.id));
    };
    catalogTile.addEventListener("click", openProject);
    catalogTile.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openProject();
        }
    });

    const images = item.images || [];
    const imageViewport = document.createElement("div");
    imageViewport.className = "tile-image-viewport";
    if (images.length) {
        catalogTile.classList.add("has-thumbnail");
        imageViewport.appendChild(createImage(images[0]));
        catalogTile.appendChild(imageViewport);
    }

    const tileInfo = document.createElement("div");
    tileInfo.className = "tile-info";

    const itemTitle = document.createElement("p");
    itemTitle.className = "title";
    itemTitle.innerText = item.title;
    tileInfo.appendChild(itemTitle);
    catalogTile.appendChild(tileInfo);

    if (images.length > 1) {
        const slideshowTimer = window.setInterval(() => {
            const currentImage = imageViewport.querySelector(".tile-thumbnail.current");
            const nextIndex = (Number(imageViewport.dataset.index || 0) + 1) % images.length;
            const nextImage = createImage(images[nextIndex]);
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
        slideshowTimers.push(slideshowTimer);
    }

    return catalogTile;

    function createImage(imageData) {
        const image = document.createElement("img");
        image.className = "tile-thumbnail current";
        image.src = imageData.src;
        image.alt = imageData.alt || "";
        return image;
    }
}
