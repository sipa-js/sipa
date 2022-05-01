# Production build
Sipa provides tools to create a production build.

## Why a production build?
For production we can concat all the JavaScript (.js) and stylesheet (.css) files each into one file. Then we can compress these files by removing comments, new lines and even minify some code.

That results in smaller files to deliver on the one hand, on the other hand it prevents others to copy our original clean code.

## Common build process

By default Sipa only considers your view `.html` files, you stylesheets `.css` and javascript files `.js` of your assets directory, including font files that are used inside the stylesheets. Then it generates a minified `index.html` based on your development file.
Additional custom static files for the distribution build must be specified in the `sipa.json`. See the options below in this document for more information.

## Create a production build
To create a production build, just run
```
sipa b
```
inside your project root directory.

Sipa will then create a production build inside
```
/dist/default
```
which is intended to be versioned and committed in your project.

### Options
There are some options available for your production build that you can set in your `sipa.json` inside the `build: {}`node.

In the following is an example how the node could look like in real project. After the attributes are described.
```json
// sipa.json
...
"build": {
    "auto_fix_font_paths_in_css": true,
    "minify": {
        "css": {
            "remove_comments": true,
            "compress": true
        },
        "js": {
            "remove_comments": false,
            "compress": true
        }
    },
    "static_files_to_copy": {
        "files": "files",
        "assets/img": "assets/img",
        "favicon.ico": "favicon.ico",
        "manifest.json": "manifest.json"
    }
}
...
```
| <br>Options for `build` task <br><br>                                                                                                                                                                                                                   |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `build`.`auto_fix_font_paths_in_css` : Boolean                                                                                                                                                                                                          |
| Sipas build job automatically puts existing font files of your project into the folder `assets/fonts` and fixes the paths to these font files inside the concatenated css. <br/><br/>                                                                   |
| `build`.`minify`.`css`.`remove_comments` : Boolean                                                                                                                                                                                                      |
| Remove comments inside the concatenated css file automatically.                                                                                                             <br/><br/>                                                                  |
| `build`.`minify`.`css`.`compress` : Boolean                                                                                                                                                                                                             |
| Compress the css file to a single line file to save disk space.                                                                                                                  <br/><br/>                                                             |
| `build`.`minify`.`js`.`remove_comments` : Boolean                                                                                                                                                                                                       |
| Remove single line and multi line comments inside the concatenated js file automatically.                                                                                                             <br/><br/>                                        |
| `build`.`minify`.`js`.`compress` : Boolean                                                                                                                                                                                                              |
| Compress the js file to a single line file and optimize code to save disk space.                                                                                                                  <br/><br/>                                            |
| `build`.`static_files_to_copy` : Array<String,String>                                                                                                                                                                                                   |
| A key <-> value list of source and destination paths for additional static files to copy into your final distribution build.                                                                                                                 <br/><br/> |
