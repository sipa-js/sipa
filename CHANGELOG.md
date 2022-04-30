# 0.4.x
## migration steps from 0.3.x to 0.4.x
### refactored lib paths
The path `app/lib` has been moved to `app/assets/lib`.

So there can now be stored `.js` files as well as `.css` files of included libraries.

The old path is no longer valid and will lead to errors, so move your libraries to the new path and rerun `sipa i`.

### refactored structure of `sipa.json`

Ignored indexer files are not backward compatible and may need to be ignored once again when running `sipa i`

New default config file looks like this now - copy the parts that are missing in your configuration:
```json
{
  "development_server": {
    "host": "0.0.0.0",
    "port": "7000",
    "sass_watch_paths": [
      "app/assets/style",
      "app/views"
    ]
  },
  "build": {
    "auto_fix_font_paths_in_css": true,
    "static_files_to_copy": {
      "files": "files",
      "assets/img": "assets/img"
    }
  },
  "indexer": {
    "ignored_files": [
    ]
  }
}
```

### new folder `files`

... inside the app folder. There you can store any special files, downloads for example.

Create folder `app/files/` if you need it, otherwise remove the line 
```json
"files": "files",
``` 
in your `sipa.json`.

### Replace comments in index.html

Rename the two occurences of `META-TITLE-ICON` into `HEADER`.

### Replace old sipa runtime

Copy `lib/templates/project/default/app/assets/lib/sipa/sipa.js` from the Github repository and replace your `app/assets/lib/sipa/sipa.js` in your actual Sipa project.