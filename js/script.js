const navClick = "navClick";

function loadPagePart(filename, containerId){
    fetch(filename)
        .then(response => response.text())
        .then(html => {
            document.getElementById(containerId).innerHTML = html;
        })
        .catch(error => {
            console.log("Error fetching HTML: ", error);
        })
}

function navigate(url, target){
    window.open(url, target);
}

function navOnNewtab(url){
    window.open(url, '_blank');
}

//https://gist.github.com/PhrotonX/98e9786c1f67de6de59bd4662f074e82#file-projects-json
/**
 * itemName must be singular.
 * @param {string} itemName 
 * @param {string} filename 
 */
function loadItems(itemName, filename){
    fetch(filename)
        .then((response) => response.json())
        .then((json) => {
            const items = Object.keys(json.item).length;

            var itemGroup = document.getElementById(itemName + "s");

            for(let i = 0; i < items; i++){
                var itemElement = document.createElement("div");
                itemElement.setAttribute("class", itemName + " item");
                itemElement.setAttribute("id", itemName + "-" + i);
                
                if((json.item[i].image != "") || (json.item[i].image != null)){
                    var itemImage = document.createElement("img");
                    itemImage.setAttribute("class", "item-image");
                    itemImage.setAttribute("id", "item-image-" + i);
                    itemImage.setAttribute("src", json.item[i].image);
                    itemElement.appendChild(itemImage);
                    //document.getElementById("item-image-" + "1").setAttribute("src", json.item[i].image);
                }

                var itemContent = document.createElement("section");
                itemContent.setAttribute("class", "item-content acrylic parent shadow");
                
                itemContent.innerHTML = "<h3 class='title'>"+ json.item[i].title +'</h3><p class="category">'+json.item[i].category+"</p>";

                if((json.item[i].date[0].progress != null) || (json.item[i].date[0].progress != "")){
                    itemContent.innerHTML += "<p class='date'>"+ json.item[i].date[0].month + " " + json.item[i].date[0].year + "-" + json.item[i].date[0].progress + "</p>";
                }else{
                    itemContent.innerHTML += "<p class='date'>"+ json.item[i].date[0].month + " " + json.item[i].date[0].year + "</p>";
                }
 
                var itemDescription = document.createElement("ul");
                itemDescription.setAttribute("class", "item-description");
                itemDescription.setAttribute("id", "item-description-" + i);
                
                const itemDescriptionCount = Object.keys(json.item[i].description).length;
                for(let j = 0; j < itemDescriptionCount; j++){
                    var itemDescriptionListItem = document.createElement("li");
                    itemDescriptionListItem.innerHTML += "<p>"+ json.item[i].description[j] +"</p>";
                    
                    itemDescription.appendChild(itemDescriptionListItem);
                }

                itemContent.appendChild(itemDescription);

                if(json.item[i].note != null){
                    const itemNotesCount = Object.keys(json.item[i].note).length;
                    for(let j = 0; j < itemNotesCount; j++){
                        var itemNote = document.createElement("p");
                        itemNote.innerHTML += json.item[i].note[j];

                        itemContent.appendChild(itemNote);
                    }
                }
                
                if(json.item[i].button != null){
                    const itemButtonCount = Object.keys(json.item[i].button).length;
                    for(let j = 0; j < itemButtonCount; j++){
                        var itemButton = document.createElement("button");
                        if((json.item[i].button[j].action != null) && (json.item[i].button[j].target != null)){
                            var link = json.item[i].button[j].action;
                            itemButton.setAttribute("onclick", "navigate('" +
                                link.slice(5) + "', '" + json.item[i].button[j].target + "')");
                        }
                        itemButton.setAttribute("type", "button");
                        if(json.item[i].button[j].content != null){
                            itemButton.innerHTML += json.item[i].button[j].content;
                        }

                        itemContent.appendChild(itemButton);
                    }
                }

                /*document.getElementById(itemName + "-" + "1").innerHTML = "<p>"+ json.item[i].title +"</p>";
                */
               
                itemElement.appendChild(itemContent);
                itemGroup.appendChild(itemElement);
            }
            

            
        });
}