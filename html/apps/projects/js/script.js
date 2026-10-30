const projectGrid = document.getElementById("project-grid");
const sortButtons = document.querySelectorAll("[data-sort]");
let projects = [];
let slideshowTimers = [];

loadItems("date-desc", "../../../json/projects.json");

sortButtons.forEach(button => {
    button.addEventListener("click", () => {
        sortButtons.forEach(item => item.classList.toggle("is-selected", item === button));
        renderProjects(button.dataset.sort);
    });
});

async function loadItems(defaultSort, filename) {
    const json = await loadJSON(filename);
    projects = json.item.filter(item => !item.hidden);
    renderProjects(defaultSort);
}

function renderProjects(sortMode) {
    slideshowTimers.forEach(timer => window.clearInterval(timer));
    slideshowTimers = [];
    projectGrid.innerHTML = "";

    groupProjects(sortMode).forEach(group => {
        const categorySection = document.createElement("section");
        categorySection.className = "category";

        const categoryHeading = document.createElement("h2");
        categoryHeading.innerText = group.label;
        categorySection.appendChild(categoryHeading);

        const tileMatrix = document.createElement("div");
        tileMatrix.className = "tile-matrix";
        group.items.forEach(item => tileMatrix.appendChild(createProjectTile(item)));
        categorySection.appendChild(tileMatrix);
        projectGrid.appendChild(categorySection);
    });

    updateMatrixRows();
}

function updateMatrixRows() {
    document.querySelectorAll(".tile-matrix").forEach(matrix => {
        const unit = Math.min(48, Math.max(32, window.innerWidth * 0.05));
        const tileHeight = unit * 2 + 4;
        const gap = parseFloat(getComputedStyle(matrix).gap) || 0;
        const rows = Math.max(1, Math.floor((matrix.clientHeight + gap) / (tileHeight + gap)));
        matrix.style.setProperty("--project-tile-height", `${tileHeight}px`);
        matrix.style.setProperty("--project-row-count", rows);
        matrix.querySelectorAll(".project-tile").forEach((tile, index) => {
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

function groupProjects(sortMode) {
    if (sortMode === "category") {
        const categories = new Map();
        [...projects]
            .sort((a, b) => a.category.localeCompare(b.category) || projectDate(b) - projectDate(a))
            .forEach(item => {
                if (!categories.has(item.category)) {
                    categories.set(item.category, []);
                }
                categories.get(item.category).push(item);
            });
        return [...categories].map(([label, items]) => ({ label, items }));
    }

    const sorted = [...projects].sort((a, b) => {
        const difference = projectDate(b) - projectDate(a);
        return sortMode === "date-asc" ? -difference : difference;
    });
    const years = new Map();

    sorted.forEach(item => {
        const year = item.date[0].year;
        if (!years.has(year)) {
            years.set(year, []);
        }
        years.get(year).push(item);
    });

    return [...years].map(([label, items]) => ({ label, items }));
}

function projectDate(item) {
    const date = item.date[0];
    return Date.UTC(date.year, (date.month || 1) - 1, date.day || 1);
}

function createProjectTile(item) {
    const projectTile = document.createElement("div");
    projectTile.className = "tile item-tile project-tile wide";
    const unit = Math.min(48, Math.max(32, window.innerWidth * 0.05));
    const tileHeight = unit * 2 + 4;
    projectTile.style.height = `${tileHeight}px`;
    projectTile.style.width = `${unit * 4 + 12}px`;
    projectTile.style.alignSelf = "start";
    projectTile.setAttribute("role", "link");
    projectTile.setAttribute("tabindex", "0");
    projectTile.setAttribute("aria-label", `Open ${item.title}`);
    projectTile.style.backgroundColor = item.color || "#00a3ee";

    const openProject = () => {
        window.location.href = `project.html?id=${encodeURIComponent(item.id)}`;
    };
    projectTile.addEventListener("click", openProject);
    projectTile.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openProject();
        }
    });

    const images = item.images || [];
    const imageViewport = document.createElement("div");
    imageViewport.className = "tile-image-viewport";
    if (images.length) {
        projectTile.classList.add("has-thumbnail");
        imageViewport.appendChild(createImage(images[0]));
        projectTile.appendChild(imageViewport);
    }

    const tileInfo = document.createElement("div");
    tileInfo.className = "tile-info";

    const projectTitle = document.createElement("p");
    projectTitle.className = "title";
    projectTitle.innerText = item.title;
    tileInfo.appendChild(projectTitle);
    projectTile.appendChild(tileInfo);

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

    return projectTile;

    function createImage(imageData) {
        const image = document.createElement("img");
        image.className = "tile-thumbnail current";
        image.src = imageData.src;
        image.alt = imageData.alt || "";
        return image;
    }
}
