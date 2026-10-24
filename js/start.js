const manifestEntries = [
    "apps/profile/manifest.json",
    "apps/about/manifest.json",
    "apps/projects/manifest.json",
    "apps/old/manifest.json"
];

const tileTimers = new Map();

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[character]));
}

function appAsset(appName, asset) {
    return `../html/apps/${encodeURIComponent(appName)}/${asset}`;
}

function appIcon(manifest) {
    const icon = manifest.icon || "icon.svg";
    return icon.startsWith("http") ? icon : appAsset(manifest.app_name, icon);
}

function appUrl(appName) {
    return `apps/${appName}/`;
}

async function loadManifest(path) {
    try {
        const response = await fetch(`../html/${path}`, { cache: "no-cache" });
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.warn(`Unable to load app manifest: ${path}`, error);
        return null;
    }
}

function enableTileNavigation() {
    document.querySelectorAll(".tile").forEach((tile) => {
        const link = tile.dataset.link;
        if (!link) return;

        tile.setAttribute("role", "link");
        tile.tabIndex = 0;
        const open = () => { window.location.href = link; };
        tile.addEventListener("click", open);
        tile.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                open();
            }
        });
    });
}

function slideSequence(tile, manifest) {
    const size = [...tile.classList].find((className) =>
        ["small", "medium", "wide", "large"].includes(className));
    const slides = [];

    if (manifest.display_original_tile !== false) {
        slides.push({ type: "original" });
    }

    const liveItems = (manifest.live_tile || []).map((liveTile) => {
        const image = liveTile.image
            ? (liveTile.image.startsWith("http") ? liveTile.image : appAsset(manifest.app_name, liveTile.image))
            : null;

        return {
            ...liveTile,
            image
        };
    });

    if (size === "large" && liveItems.length) {
        slides.push({ type: "bullet-list", items: liveItems });
        return slides;
    }

    liveItems.forEach((liveTile) => {
        if ((size === "medium" || size === "wide") && liveTile.image) {
            slides.push({ type: "image", image: liveTile.image });
        }
        slides.push({
            type: "content",
            heading: liveTile.heading,
            content: liveTile.content,
            tileName: liveTile.tile_name,
            image: liveTile.image
        });
    });

    return slides;
}

function renderOriginalSlide(manifest) {
    const icon = appIcon(manifest);
    return `<div class="live-original">
        <img class="tile-app-icon" src="${icon}" alt="">
    </div>`;
}

function renderLiveSlide(slide) {
    if (slide.type === "image") {
        return `<img class="live-image" src="${escapeHtml(slide.image)}" alt="">`;
    }

    if (slide.type === "bullet-list") {
        return `<div class="live-bullet-list">
            ${slide.items.map((item) => `<div class="live-bullet">
                ${item.image
                    ? `<img src="${escapeHtml(item.image)}" alt="">`
                    : `<img src="${escapeHtml(item.icon)}" alt="">`}
                <div>
                    ${item.heading ? `<strong>${escapeHtml(item.heading)}</strong>` : ""}
                    <p>${escapeHtml(item.content || "")}</p>
                </div>
            </div>`).join("")}
        </div>`;
    }

    return `<div class="live-copy">
        ${slide.heading ? `<strong>${escapeHtml(slide.heading)}</strong>` : ""}
        ${slide.content ? `<p>${escapeHtml(slide.content)}</p>` : ""}
        ${slide.tileName ? `<small>${escapeHtml(slide.tileName)}</small>` : ""}
    </div>`;
}

function showLiveSlide(tile, manifest, slides, index, animate = true) {
    const liveTile = tile.querySelector(".livetile");
    if (!liveTile) return;

    const slide = slides[index];
    const content = slide.type === "original"
        ? renderOriginalSlide(manifest)
        : renderLiveSlide(slide);
    const current = liveTile.querySelector(".live-slide.is-current");
    const next = document.createElement("div");
    next.className = `live-slide${animate ? " live-slide-in" : ""} is-${slide.type}`;
    next.innerHTML = `${content}${
        slide.type === "original"
            ? ""
            : `<img class="live-mini-icon" src="${escapeHtml(appIcon(manifest))}" alt="">`
    }`;
    next.classList.add("is-current");
    liveTile.appendChild(next);

    if (current) {
        current.classList.remove("is-current");
        current.classList.add("live-slide-out");
        window.setTimeout(() => current.remove(), 700);
    }

    next.classList.add("is-current");
}

function enableLiveTile(tile, manifest, tileIndex) {
    const size = [...tile.classList];
    if (size.includes("small")) return;

    const slides = slideSequence(tile, manifest);
    if (!slides.length || !tile.querySelector(".livetile")) return;

    let index = 0;
    const interval = 4200;
    const showNext = () => {
        showLiveSlide(tile, manifest, slides, index);
        index = (index + 1) % slides.length;
    };

    tile.classList.add("has-live-slides");
    slides.forEach((slide) => {
        if (!slide.icon) slide.icon = appIcon(manifest);
    });
    showLiveSlide(tile, manifest, slides, 0, false);
    index = slides.length > 1 ? 1 : 0;
    const startDelay = tileIndex * 850;
    window.setTimeout(() => {
        if (slides.length < 2) return;

        tileTimers.set(tile, window.setInterval(showNext, interval));
    }, startDelay);
}

function renderAppList(manifests) {
    const appList = document.getElementById("app-list");
    if (!appList) return;

    appList.innerHTML = manifests.map((manifest) => `
        <a class="app-entry" href="${appUrl(manifest.app_name)}">
            <span class="app-entry-icon" style="background-color:${escapeHtml(manifest.color || "#0d0b6b")}">
                <img src="${appIcon(manifest)}" alt="">
            </span>
            <span>${escapeHtml(manifest.display_name || manifest.app_name)}</span>
        </a>`).join("");
}

function renderTileIcons(manifests) {
    const byName = new Map(manifests.map((manifest) => [manifest.app_name, manifest]));
    document.querySelectorAll(".tile[data-link]").forEach((tile) => {
        const appName = new URLSearchParams(tile.dataset.link.split("?")[1]).get("app");
        const manifest = byName.get(appName);
        if (manifest) return;
        if (tile.querySelector(".tile-icon")) return;

        const icon = document.createElement("span");
        icon.className = "tile-icon tile-icon-fallback";
        icon.textContent = tile.querySelector(".title")?.textContent.trim().slice(0, 1) || "?";
        icon.setAttribute("aria-hidden", "true");
        tile.prepend(icon);
    });
}

async function initializeStartScreen() {
    enableTileNavigation();
    const manifests = (await Promise.all(manifestEntries.map(loadManifest))).filter(Boolean);
    const byName = new Map(manifests.map((manifest) => [manifest.app_name, manifest]));

    renderTileIcons(manifests);
    document.querySelectorAll(".tile[data-link]").forEach((tile, tileIndex) => {
        const appName = new URLSearchParams(tile.dataset.link.split("?")[1]).get("app");
        const manifest = byName.get(appName);
        if (tile.classList.contains("small")) {
            tile.title = manifest?.display_name || tile.querySelector(".title")?.textContent.trim() || "";
        }
        if (manifest) enableLiveTile(tile, manifest, tileIndex);
    });
    renderAppList(manifests);

    const page = document.querySelector("main");
    document.getElementById("all-apps-button")?.addEventListener("click", () => {
        page?.classList.add("apps-open");
    });
    document.getElementById("back-to-start")?.addEventListener("click", () => {
        page?.classList.remove("apps-open");
    });

    document.querySelectorAll(".grid, #app-list").forEach((scrollArea) => {
        scrollArea.addEventListener("wheel", (event) => {
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
            event.preventDefault();
            scrollArea.scrollLeft += event.deltaY;
        }, { passive: false });
    });
}

initializeStartScreen();
