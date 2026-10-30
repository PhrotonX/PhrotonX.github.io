async function loadJSON(filename){
    const response = await fetch(filename);
    const json = await response.json();
    return json;
}