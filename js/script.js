const navClick = "navClick";
var json;

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

async function loadJSON(filename){
    const response = await fetch(filename);
    const json = await response.json();
    return json;
}

//https://gist.github.com/PhrotonX/98e9786c1f67de6de59bd4662f074e82#file-projects-json
/**
 * itemName must be singular. Plural form of it should be appendable with -s.
 * Class name should be "tiles".
 * Must call updateListBoxAndSort() or sortJSONItems() for the third argument.
 * @param {string} itemName 
 * @param {string} filename 
 * @param {*} values
 */
async function loadItems(itemName, filename, sortedValue){
    if(json == null){
        json = await loadJSON(filename);
    }

    const items = Object.keys(json.item).length;

    var itemGroup = document.getElementById(itemName + "s");
    itemGroup.innerHTML = "";
    
    var sortingMethod = getCookie("ProjectSorting");
    console.log(sortingMethod.toString());

    var hiddenItems = 0;
    var noOfItems = 0;

    for(let i = 0; i < items; i++){
        console.log(sortedValue[i]);
        noOfItems++;
            
        switch(sortingMethod.toString()){
            case "priority":
                load(i);
                break;
            case "date-asc":
            case "date-des":
                var displayedValue = [];

                for(let j = 0; j < items; j++){
                    let valueToCompare = json.item[j].date[0].year + '' + getMonthWithLeadingZeroStr(json.item[j].date[0].month);
                    if(json.item[j].date[0].day != null){
                        valueToCompare += json.item[j].date[0].day + "_" + json.item[j].date[0].item;
                    }else{
                        valueToCompare += "00_00";
                    }

                    console.log(j + ": items:" + items + "\tsortedValue: " + sortedValue[i] + "\tDate: " + valueToCompare);
                    
                    if(displayedValue.includes(j)){
                        continue;
                    }

                    if(sortedValue[i] === valueToCompare){
                        console.log("SUCCEED at item " + sortedValue[i] + "\tIndex: " + i + " against j: " + j);
                        displayedValue.push(j);
                        load(j);
                        break;
                    }
                    
                }
                break;
            default:
                break;
        }
    }

    if(hiddenItems != 0){
        let hiddenItemsNotice = document.getElementById("hidden-items-notice-" + itemName);
        let plural = "are";
        if(hiddenItems == 1){
            plural = "is";
        }
        hiddenItemsNotice.innerHTML = hiddenItems + " out of " + noOfItems + " items "+ plural +" hidden.";
    }
    /*for(let i = 0; i < items; i++){

        
    }*/
    function load(i){if(json.item[i].hidden === true){
            hiddenItems++;
            return;
        }
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
        
        var monthName = getMonthName(json.item[i].date[0].month);

        if((json.item[i].date[0].progress != null) || (json.item[i].date[0].progress != "")){
            itemContent.innerHTML += "<p class='date'>"+ monthName + " " + json.item[i].date[0].year + "-" + json.item[i].date[0].progress + "</p>";
        }else{
            itemContent.innerHTML += "<p class='date'>"+ monthName + " " + json.item[i].date[0].year + "</p>";
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
}

async function loadTiles(itemname, filename){
    json = await loadJSON(filename);
    const items = Object.keys(json.tile).length;

    var itemGroup = document.getElementById(itemname + "s");

    //const sortedItems = sortItems(listBox);
    for(let i = 0; i < items; i++){


        var tile = document.createElement("div");

        tile.setAttribute("class", "tile-" + json.tile[i].size + " " + itemname + " acrylic child");
        tile.setAttribute("id", itemname + "-" + i);

        var table = document.createElement("table");
        table.setAttribute("class", "tile-table");

        var tileTitle = document.createElement("tr");
        tileTitle.setAttribute("class", "tile-title");
        // tileTitle.setAttribute("class", "tile-title acrylic child");
        tileTitle.innerHTML = "<p><b>" + json.tile[i].title + "</b></p>";
        table.appendChild(tileTitle);

        var tileContent = document.createElement("tr");
        tileContent.setAttribute("class", "tile-content");
        tileContent.innerHTML = "<p>" + json.tile[i].content + "</p>";
        table.appendChild(tileContent);

        var tileDescription = document.createElement("tr");
        tileDescription.setAttribute("class", "tile-description"); 
        tileDescription.innerHTML = "<p>" + json.tile[i].description + "</p>";
        table.appendChild(tileDescription);

        tile.appendChild(table);

        itemGroup.appendChild(tile);
    }
}

function updateListBoxAndSort(listBox, filename){
    const sortListBox = document.getElementById(listBox);
    
    createCookie("ProjectSorting", sortListBox.value, 630);

    return sortJSONItems(sortListBox.value, filename);

    // const sortListBox = document.getElementById(listBox);

    // var sortingMethod = getCookie("ProjectSorting");

    // sortListBox.value = sortingMethod.toString();

    // return sortJSONItems(sortingMethod.toString());
}

//Move this function into a class called Items in an OOP paradigm.
/**
 * Requires JSON with items.
 * @param {*} sortingMethod 
 * @returns 
 */
async function sortJSONItems(sortingMethod, filename){
    if(json == null){
        json = await loadJSON(filename);
    }

    var items = [];
    //var sortedItems = [];

    if(json != null){
        const size = Object.keys(json.item).length;

        for(let i = 0; i < size; i++){
            switch(sortingMethod){
                case "date-asc":
                case "date-des":
                    let dayAndItem = "";
                    if(json.item[i].date[0].day != null){
                        dayAndItem += json.item[i].date[0].day;
                        
                        if(json.item[i].date[0].item != null){
                            dayAndItem += "_" + json.item[i].date[0].item;
                        }
                    }else{
                        dayAndItem += "00_00";
                    }
                    items[i] = json.item[i].date[0].year + getMonthWithLeadingZeroStr(json.item[i].date[0].month) + dayAndItem;
                    //console.log(items[i]);
                    break;
                case "priority":
                    items[i] = i;
                    break;
                default:
                    break;

            }
        }
        
        for(let i = 0; i < size; i++){
            switch(sortingMethod){
                case "date-asc":
                    for(let j = i; j < size; j++){
                        let temp = items[j];
                        if(items[i] > items[j]){
                            items[j] = items[i];
                            items[i] = temp;
                            //sortedItems[i] = j;
                        }
                    }
                    break;
                case "date-des":
                    for(let j = i; j < size; j++){
                        let temp = items[j];
                        if(items[i] < items[j]){
                            items[j] = items[i];
                            items[i] = temp;
                            //sortedItems[i] = j;
                        }
                    }
                    break;
                default:
                    break;
            }
            
        }

        for(let i = 0; i < size; i++){
            //console.log("Item: " + sortedItems[i] + "\tElement: " + items[i]);
            //console.log("Element: " + items[i]);
        }
    }

    //return sortedItems;
    return items;
}

function closeMenu(){
    var backButton = document.getElementById("nav-back");
    var menuButton = document.getElementById("nav-menu");
    var dropdown = document.getElementById("nav-dropdown-content");
    
    backButton.style.display = "none";
    menuButton.style.display = "block";
    dropdown.style.display = "none";
}

function showMenu(){
    var backButton = document.getElementById("nav-back");
    var menuButton = document.getElementById("nav-menu");
    var dropdown = document.getElementById("nav-dropdown-content");

    backButton.style.display = "block";
    menuButton.style.display = "none";
    dropdown.style.display = "block";
}