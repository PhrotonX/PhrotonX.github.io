const navClick = "navClick";

function loadPagePart(filename, containerId){
    fetch(filename)
        .then(response => response.text())
        .then(html => {
            document.getElementById(containerId).innerHTML =html;
        })
        .catch(error => {
            console.log("Error fetching HTML: ", error);
        })
}