loadItems("project-grid", "../../../json/projects.json");

/**
 * itemName must be singular. Plural form of it should be appendable with -s.
 * Class name should be "tiles".
 * Must call updateListBoxAndSort() or sortJSONItems() for the third argument.
 * @param {string} itemName 
 * @param {string} filename 
 */
async function loadItems(itemName, filename){
    var json = await loadJSON(filename);

    const count = Object.keys(json.item).length;

    var itemGroup = document.getElementById(itemName);
    itemGroup.innerHTML = "";
    
    var hiddenItems = 0;
    var noOfItems = 0;

    // @TODO: Sort items by date and month

    // Group items by year
    var groupedItems = new Array();

    for(let i = 0; i < count; i++){
        const year = json.item[i].date[0].year;
        
        var group = groupedItems[year];

        if(group == null){
            group = new Array();
        }

        group.push(json.item[i]);

        groupedItems[year] = group;
    }

    console.log(groupedItems);

    groupedItems.forEach((groupedItem, year) => {
        var categorySection = document.createElement("section");
        categorySection.className = "category";
        
        var categoryHeading = document.createElement("h2");

        groupedItem.forEach(item => {
            var projectTile = createProjectTile(item);

            categorySection.appendChild(projectTile);
        });

        categoryHeading.innerText = year;

        categorySection.appendChild(categoryHeading);

        itemGroup.appendChild(categorySection);
    });

    function createProjectTile(item){
        var projectTile = document.createElement("div");
        projectTile.className = "tile item-tile project-tile wide";
        projectTile.addEventListener("click", () => {
            window.location.href = `project?id=${item.id}`;
        })

        var projectTitle = document.createElement("p");
        projectTitle.className = "title";
        projectTitle.innerText = item.title;
        
        projectTile.appendChild(projectTitle);

        return projectTile;
    }
}