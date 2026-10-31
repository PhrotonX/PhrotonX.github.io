const tileTimers = new Map();
const defaultAppManifests = [
    "apps/profile/manifest.json",
    "apps/about/manifest.json",
    "apps/projects/manifest.json",
    "apps/old/manifest.json"
];

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
    return `app.html?app=${encodeURIComponent(appName)}`;
}

async function loadStartConfig() {
    const response = await fetch("../json/start.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.json();
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

function manifestPath(appName) {
    return `apps/${encodeURIComponent(appName)}/manifest.json`;
}

function manifestPaths(config) {
    const configuredApps = Array.isArray(config.apps)
        ? config.apps.map((app) => typeof app === "string" ? app : manifestPath(app.app || app.app_name))
        : [];
    const pinnedApps = (config.groups || [])
        .flatMap((group) => group.tiles || [])
        .map((tile) => manifestPath(tile.app));

    return [...new Set([
        ...defaultAppManifests,
        ...configuredApps,
        ...pinnedApps
    ].filter(Boolean))];
}

function renderStartLayout(config, manifests) {
    const grid = document.querySelector("#start-section > .grid");
    if (!grid) return;

    const byName = new Map(manifests.map((manifest) => [manifest.app_name, manifest]));
    grid.replaceChildren();

    (config.groups || []).forEach((group) => {
        const category = document.createElement("section");
        category.className = "category";
        category.style.setProperty("--cols", group.cols || 8);

        const heading = document.createElement("h2");
        heading.textContent = group.title || "";
        category.appendChild(heading);

        (group.tiles || []).forEach((tileConfig) => {
            const manifest = byName.get(tileConfig.app);
            if (!manifest) return;

            const tile = document.createElement("div");
            tile.className = `tile ${tileConfig.size || "medium"}`;
            tile.dataset.link = appUrl(manifest.app_name);
            tile.style.setProperty("--tile-bg", tileConfig.color || manifest.color || "#0d0b6b");

            const title = document.createElement("p");
            title.className = "title";
            title.textContent = manifest.display_name || manifest.app_name;
            tile.append(title, document.createElement("div"));
            tile.lastElementChild.className = "livetile";
            category.appendChild(tile);
        });

        grid.appendChild(category);
    });
}

function enableTileNavigation() {
    document.querySelectorAll(".tile").forEach((tile) => {
        const link = tile.dataset.link;
        if (!link) return;

        tile.setAttribute("role", "link");
        tile.tabIndex = 0;
        const open = () => {
            window.location.href = link;
        };
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
    const interval = 5000;
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
    let config;
    try {
        config = await loadStartConfig();
    } catch (error) {
        console.error("Unable to load start.json", error);
        const grid = document.querySelector("#start-section > .grid");
        if (grid) grid.innerHTML = "<p>Unable to load the start screen configuration.</p>";
        return;
    }

    const manifests = (await Promise.all(manifestPaths(config).map(loadManifest))).filter(Boolean);

    renderStartLayout(config, manifests);
    const byName = new Map(manifests.map((manifest) => [manifest.app_name, manifest]));

    enableTileNavigation();
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

    let startTouchX = 0;
    let startTouchY = 0;
    const startSection = document.getElementById("start-section");
    const appsSection = document.getElementById("apps-section");
    startSection?.addEventListener("touchstart", (event) => {
        startTouchX = event.changedTouches[0].clientX;
        startTouchY = event.changedTouches[0].clientY;
    }, { passive: true });
    startSection?.addEventListener("touchend", (event) => {
        const touch = event.changedTouches[0];
        if (startTouchX - touch.clientX > 60 &&
            Math.abs(startTouchX - touch.clientX) > Math.abs(startTouchY - touch.clientY)) {
            page?.classList.add("apps-open");
        }
    }, { passive: true });
    appsSection?.addEventListener("touchstart", (event) => {
        startTouchX = event.changedTouches[0].clientX;
        startTouchY = event.changedTouches[0].clientY;
    }, { passive: true });
    appsSection?.addEventListener("touchend", (event) => {
        const touch = event.changedTouches[0];
        if (touch.clientX - startTouchX > 60 &&
            Math.abs(touch.clientX - startTouchX) > Math.abs(touch.clientY - startTouchY)) {
            page?.classList.remove("apps-open");
        }
    }, { passive: true });

    document.querySelector(".mobile-back")?.addEventListener("click", (event) => {
        event.preventDefault();
        window.history.back();
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