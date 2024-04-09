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
            var itemGroup = document.getElementById(itemName + "s");
            for(let i = 0; i < json.size; i++){
                var itemElement = document.createElement("div");
                itemElement.setAttribute("class", itemName + " item");
                itemElement.setAttribute("id", itemName + "-" + i);
                
                if((json.items[i].image != "") || (json.items[i].image != null)){
                    var itemImage = document.createElement("img");
                    itemImage.setAttribute("class", "item-image");
                    itemImage.setAttribute("id", "item-image-" + i);
                    itemImage.setAttribute("src", json.items[i].image);
                    itemElement.appendChild(itemImage);
                    //document.getElementById("item-image-" + "1").setAttribute("src", json.items[i].image);
                }

                var itemContent = document.createElement("section");
                itemContent.setAttribute("class", "item-content acrylic parent shadow");
                itemElement.appendChild(itemContent);

                itemContent.innerHTML = "<h3 class='title'>"+ json.items[i].title +"</h3>";
                if((json.items[i].date[0].progress != null) || (json.items[i].date[0].progress != "")){
                    itemContent.innerHTML += "<p class='date'>"+ json.items[i].date[0].month + " " + json.items[i].date[0].year + "-" + json.items[i].date[0].progress + "</p>";
                }else{
                    itemContent.innerHTML += "<p class='date'>"+ json.items[i].date[0].month + " " + json.items[i].date[0].year + "</p>";
                }

                itemGroup.appendChild(itemElement);             

                /*document.getElementById(itemName + "-" + "1").innerHTML = "<p>"+ json.items[i].title +"</p>";
                */
            }
            

            
        });
}