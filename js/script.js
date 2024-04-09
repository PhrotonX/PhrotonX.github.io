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
function loadItems(itemName, filename){
    fetch(filename)
        .then((response) => response.json())
        .then((json) => {
            // alert(json.item);
            //console.log(json);

            // const data = JSON.parse(json);

            // const id = json[0].title;
            document.getElementById(itemName + "-1").innerHTML = "<p>"+ json.items[0].title +"</p>";
        });
}