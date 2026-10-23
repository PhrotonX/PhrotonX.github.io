// var grid = document.getElementsByClassName("grid");

// var tileClicked = grid[0].closest(".tile");

// alert(tileClicked.dataset.link);

var tiles = document.getElementsByClassName("tile");

// tiles.forEach(tile => {
//     
// });

for(let i = 0; i < tiles.length; i++){
    tiles[i].addEventListener("click", () => {
        var link = tiles[i].dataset.link;

        if(link != null){
            window.location.href = link;
        }
    })
}
