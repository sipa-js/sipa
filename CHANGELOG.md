# 0.9.44
## Added support for BigInt in attributes
Attributes were restricted to numbers with 16 digits (long), but now support BigIntegers as well.

Before, Big ints were cut or mangled.

```html
<body>
  <div class="some-container">
    <example-component number="123456789012345" big-int="12345678901234567890">BigInts are working from now!</example-component>
  </div>
</body>
```

# 0.9.40
## New method
A new method `SipaComponent.byId(id)` has been added to the `SipaComponent` class for easier referencing an element from the HTML DOM. It returns the component with the given id attribute.

For example:

```html
<body>
  <div class="some-container">
    <example-component attr-id="my-custom-id">Some content</example-component>
  </div>
</body>
```

```javascript
 ExampleComponent.byId("my-custom-id"); // get instance of ExampleComponent with given attribute id
```

# 0.9.39
## Migration steps from 0.9.38 to 0.9.39
### New option in your app/config/config.js
```js
    /*
        Preserve <link> and <script> children tags of body on layout loading
        Useful when you inject scripts or stylesheets on the body dynamically
    */
    preserve_script_link_tags: false,
```
### New class for your tests
When writing tests, use the `beforeAll()` method in your spec tests and run
```
SipaTest.enableTestingMode()
```
to ensure optimized testing capabilities. For example performance optimizations with lazy rendering are disabled, to ensure you get the rendered results immediately and do not need to delay the test run.

# 0.9.38
* Make jQuery cache for loading pages/layouts configurable.

## Migration steps from 0.9.26+ to 0.9.38
### add component section in index.html
In your `app/index.html`, add the following lines after `<!---------------===== /LAYOUTS =====--------------->`.

```html
    <!---------------===== COMPONENTS =====--------------->
    <!-- section for your layouts -->
    <!-- COMPONENT-JS -->
    <script type="text/javascript" src="assets/components/example/example.js"></script>
    <!-- /COMPONENT-JS -->
    <!-- COMPONENT-CSS -->
    <link rel="stylesheet" href="assets/components/example/example.css">
    <!-- /COMPONENT-CSS -->
    <!---------------===== /COMPONENTS =====--------------->
```
### Add files
* Copy the folder of the latest version from repo at `lib/templates/project/default/app/assets/lib/fire-once` into your project to `app/assets/lib/fire-once`. After run `sipa i` and confirm with ´+´ to add the lib to the project.
* Copy the folder of the latest version from repo at `lib/templates/project/default/app/assets/components/example` into your project to `app/assets/components/example`. After run `sipa i` and confirm with ´+´ to add the lib to the project.
### New option in your app/config/config.js
```js
/* use jQuery cache: true/false.

   when disabled, jQuery will add a underscore parameter ?_=<number> on
   page and layout requests, to avoid browser caching
 */
cache_page_layout_requests: false,
```
### Add sipa component styles to path
In `sipa.json` add `"assets/components",` to the attribute `"sass_watch_paths"`


# 0.9.26
* Added basic sipa compontents
## Migration steps from 0.9.x to 0.9.26+
* Replace `app/assets/lib` with the latest version from repo at `lib/templates/project/desktop/app/assets/lib`.
  * Check if you had already included one of these libs in `lib/<lib-folder>` in another folder and if, then remove them
* Copy folder `lib/templates/project/desktop/app/assets/components` from repo to `app/assets`.
* Add in your `app/index.html` after `<!---------------===== /LAYOUTS =====--------------->` the following lines:
```html

    <!---------------===== COMPONENTS =====--------------->
    <!-- section for your layouts -->
    <!-- COMPONENT-JS -->
    <script type="text/javascript" src="assets/components/example/example.js"></script>
    <!-- /COMPONENT-JS -->
    <!-- COMPONENT-CSS -->
    <link rel="stylesheet" href="assets/components/example/example.css">
    <!-- /COMPONENT-CSS -->
    <!---------------===== /COMPONENTS =====--------------->

```
* Add the following line in the block of `SipaHooks.beforeInitPage() {}` in `app/config/hooks.js`:
```javascript
  SipaHooks.beforeInitPage('on', () => {
    // add this line to your beforeInitPage hook
    SipaComponent.init();
  });
```
* Add `"assets/components"` to `"sass_watch_paths"` in your `sipa.json`
```yaml
# sipa.json
  {
    "development_server": {
      ...
      "sass_watch_paths": [
        "assets/style",
        # add the following line:
        "assets/components",
        "views"
      ]
    }
  ...
  }
```
* Add `"type": "desktop",` at the first line after the opening brackets `{}` in your `sipa.json`.
* Run `sipa i` in your project root to add the new assets




# 0.9.1
## Migration steps from 0.9.0 to 0.9.1

Rename `app/assets/lib/simpartic/simpartic.js` to `app/assets/lib/sipa/sipa.js`




# 0.9.0
## And again we go back to Sipa from Simpartic
We had a lot of pain using the word simpartic compared to sipa. So we switch back once again. Hopefully the last time. ;-D



# 0.8.5

## New option "hooks" in sipa.json
```json
{
  "hooks": {
    "before_all": "",
    "after_all": "",
    "before_build": "npm version patch",
    "after_build": "",
    "before_generate": "",
    "after_generate": "",
    "before_indexer": "",
    "after_indexer": "",
    "before_server": "",
    "after_server": ""
  }
}
```

## New option "development_server.mount" in sipa.json
```json
{
  "development_server": {
    "mount": "/"
  }
}
```

# 0.8.1
* Fix reload issue that occurred coincidentally.
## Migration steps 0.7.x to 0.8.1
* Replace `app/assets/lib/sipa/sipa.js` with the latest version from repo at `lib/templates/project/default/app/assets/lib/sipa`. 

# 0.7.x
## Sipa goes back to the long name Simpartic
As `sipa` is not very uniq - about 50 million search results on Google - we go back to its original long version `sipa` while the shortcut `sipa` will remain for the CLI and class names.

Simpartic has only about 200 search results on Google today, where many of them are typos, except our real sipa itself of course!

## Migration steps from 0.6.x to 0.7.x
Rename `sipa.json` in the project root to `sipa.json`.

# 0.6.x
* Now all paths in `sipa.json` are based on the directory `/app`.
* New block in `index.html` for very custom assets.

## Migration steps from 0.5.x to 0.6.x
### New base dir for watch paths
In `sipa.json` the SASS watch paths are now relativ to `/app` and not to the project root `/` anymore, as paths outside `app` could not be accessed by `index.html` anyway. On the other hand, then all paths inside `sipa.json` have the base dir `/app/` consistently.

So adjust the paths and remove the prefixed `app` at the `sass_watch_paths`, for example:

```json
    // before
    "sass_watch_paths": [
      "app/assets/style",
      "app/views"
    ]
    // after
    "sass_watch_paths": [
      "assets/style",
      "views"
    ]
```
### New custom block in `index.html`
There is a new custom block in `index.html` to link very custom assets there.

In your `index.html` after the line 

```html
<!---------------===== /LIBS =====--------------->
``` 
add the following lines:

```html
    <!---------------===== CUSTOM =====--------------->
    <!-- Section for your very custom content, e.g. if you want to embed Sipa into another framework -->
    <!-- Here are only files included, that are defined in sipa.json at 'custom_assets_paths' -->
    <!-- CUSTOM-JS -->
    <!-- /CUSTOM-JS -->
    <!-- CUSTOM-CSS -->
    <!-- /CUSTOM-CSS -->
    <!---------------===== /CUSTOM =====--------------->
```



# 0.5.x
* Support to configure minification of JavaScript and Stylesheets (CSS).
## Migration steps from 0.4.x to 0.5.x
Add the following lines inside your `build: { }` attribute in `sipa.json`:

```json
    "minify": {
      "css": {
        "remove_comments": true,
        "compress": true
      },
      "js": {
        "remove_comments": true,
        "compress": true
      }
    }
```

# 0.4.x
## Migration steps from 0.3.x to 0.4.x
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
