const params = new URLSearchParams(window.location.search);
const id = params.get("id");

loadItem(id, "../../../json/projects.json");

async function loadItem(itemId, jsonPath){
    var json = await loadJSON(jsonPath);

    var descriptionList = document.getElementById("description");
    
    var item = json.item.find(project => project.id === itemId) ||
        json.item.find(project => project.id.includes(itemId));

    if (!item) {
        document.getElementById("app-name").innerText = "Project not found";
        document.body.dataset.ready = "true";
        return;
    }

    // Set app names
    document.getElementById("title").innerHTML = item.title + " - Charles Martin's Portfolio";
    document.getElementById("app-name").innerHTML = item.title;
    document.getElementById("project-category").innerText = item.category;
    document.getElementById("project-date").innerText = `${item.date[0].year} · ${item.date[0].progress}`;
    document.getElementById("project-counter").innerText = `${item.date[0].year} / ${item.category}`;
    
    // Set description
    item.description.forEach(description => {
        var descriptionParagraph = document.createElement("li");
        descriptionParagraph.innerHTML = description;

        descriptionList.appendChild(descriptionParagraph);
    });

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