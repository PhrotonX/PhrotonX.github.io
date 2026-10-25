const params = new URLSearchParams(window.location.search);
const id = params.get("id");

loadItem(id, "../../../json/projects.json");

async function loadItem(itemId, jsonPath){
    var json = await loadJSON(jsonPath);

    var descriptionList = document.getElementById("description");
    
    var item = json.item.filter(item => item.id.includes(itemId))[0];

    // Set app names
    document.getElementById("title").innerHTML = item.title + " - Charles Martin's Portfolio";
    document.getElementById("app-name").innerHTML = item.title;
    
    // Set description
    item.description.forEach(description => {
        var descriptionParagraph = document.createElement("li");
        descriptionParagraph.innerHTML = description;

        descriptionList.appendChild(descriptionParagraph);
    });

    // Set images
    var galleryCarousel = document.getElementById("gallery-carousel");
    var imagePaths = item.images;
    if(imagePaths != null){
        imagePaths.forEach(imagePath => {
            var galleryItem = document.createElement("img");
            galleryItem.src = imagePath.src;
            galleryItem.alt = imagePath.alt;

            galleryCarousel.appendChild(galleryItem);
        });
    }
}