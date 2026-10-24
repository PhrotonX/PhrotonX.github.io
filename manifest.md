# Manifest file
The manifest file is used to describe the application and use it to display an app list dynamically and also set the properties of a tile or live tiles on the home page.

## Manifest documentation
**app_name** - The name of the folders for the app. Shall not be displayed on the front end. It is used on html/apps/[app_name]/. I tis also used for navigating to the app once a live tile has been clicked.
**display_name** The name of the 
**display_original_tile** - If ``true``, the original tile will be displayed after displaying all slides of live tile before displaying the live tiles again. The app name including the app icon is the original tile. Must be set to ``false`` if the tile must only display live tiles. Useful for tiles meant for slideshows or important information.
**external_live_tile** - If ``true``, the local ``live_tile_json`` or ``live_tile_html`` is ignored.
**external_live_tile_url** - The link to an external JSON file for dynamic 
live tiles.
**live_tile** - An array of JSON live tiles.
    - **heading** - The optional larger text heading of the live tile.
    - **content** - The paragraph of the live tile.
    - **tile_name** - The temporary replacement text of the live tile display name.
    - **image** - The image for the live tile.
**live_tile_type**
    - If set to ``json``, the ``live_tile`` object within the manifest file will be used as a content for live tile.
    - If set to ``html``, the html/apps/[app_name]/livetiles/ files are used. The 

## Folder structure for apps/[app_name]/livetiles/
- The folder may consist of livetile/ folders. Each folder represent one slide of a live tile.

## Live tiles
- Each tile may consist of zero ro more live tiles. A tile is not necessarily a live tile.
- If a tile is set to medium or wide with live tiles and a photos on it, it displays a full image of the live tile first before displaying the content or paragraph, making it a two total slide for each live tile.
- If a tile is set to large and has one or more live tiles, it shall display a bulleted form of content with the image as the bullet and the paragraph as the content.
- The ``tile_name`` replaces the name of the tile before going back to the original display name on original tile.