<a name="SipaEnv"></a>

## SipaEnv
SipaEnv

Tool class with environment dependent methods

* [SipaEnv](#SipaEnv)
    * [.version()](#SipaEnv.version) &rarr; <code>string</code>
    * [.name()](#SipaEnv.name) &rarr; <code>string</code>
    * [.description()](#SipaEnv.description) &rarr; <code>string</code>
    * ~~[.isRunningLocalHost()](#SipaEnv.isRunningLocalHost) &rarr; <code>boolean</code>~~
    * [.isLocalhost(url)](#SipaEnv.isLocalhost) &rarr; <code>boolean</code>
    * [.isDebugMode()](#SipaEnv.isDebugMode) &rarr; <code>boolean</code>
    * [.debugLog(text)](#SipaEnv.debugLog)

<a name="SipaEnv.version"></a>

### SipaEnv.version() &rarr; <code>string</code>
Get the current version of your app.

The returned value within this method will automatically be
updated from your package.json at every release build cycle.

**Example**
```js
SipaEnv.version()
// => '1.0.0'
```
<a name="SipaEnv.name"></a>

### SipaEnv.name() &rarr; <code>string</code>
Get the current name of your app.

The returned value within this method will automatically be
updated from your package.json at every release build cycle.

**Example**
```js
SipaEnv.name()
// => 'My App'
```
<a name="SipaEnv.description"></a>

### SipaEnv.description() &rarr; <code>string</code>
Get the current description of your app.

The returned value within this method will automatically be
updated from your package.json at every release build cycle.

**Example**
```js
SipaEnv.description()
// => 'This is my app'
```
<a name="SipaEnv.isRunningLocalHost"></a>

### ~~SipaEnv.isRunningLocalHost() &rarr; <code>boolean</code>~~
***Deprecated***

Check if Sipa is running at localhost.

The address can be either 'localhost' or '127.0.0.1'.

**Returns**: <code>boolean</code> - true if localhost, otherwise false  

**Example**
```js
// running local at localhost
SipaEnv.isRunningLocalHost()
// => true

// running online at example.com
SipaEnv.isRunningLocalHost()
// => false
```
<a name="SipaEnv.isLocalhost"></a>

### SipaEnv.isLocalhost(url) &rarr; <code>boolean</code>
Check if the given URL is a localhost URL.
If no URL is given, the current URL will be used.

| Param | Default |
| --- | --- |
| url | <code></code> | 


**Example**
```js
// check a specific URL
SipaEnv.isLocalhost('http://localhost:8000') // => true
SipaEnv.isLocalhost('http://127.0.0.1/path') // => true
SipaEnv.isLocalhost('http://example.com') // => false
SipaEnv.isLocalhost('http://mysite.local') // => false

// check the current URL
// running local at localhost
SipaEnv.isLocalhost() // => true
// running online at example.com
SipaEnv.isLocalhost() // => false
```
<a name="SipaEnv.isDebugMode"></a>

### SipaEnv.isDebugMode() &rarr; <code>boolean</code>
Check if debug mode is enabled.

The debug mode can be enabled, by adding a query parameter 'debug=true' into your URL.

**Returns**: <code>boolean</code> - true if enabled, otherwise false  

**Example**
```js
// running with debug mode enabled
// http://localhost:8000/?debug=true
SipaEnv.isDebugMode()
// => true

// running with debug mode disabled
// http://localhost:8000/
SipaEnv.isDebugMode()
// => false
```
<a name="SipaEnv.debugLog"></a>

### SipaEnv.debugLog(text)
Debug output on console if debug mode is enabled.

The debug mode can be enabled, by adding a query parameter 'debug=true' into your URL.

| Param | Type |
| --- | --- |
| text | <code>string</code> \| <code>any</code> | 


**Example**
```js
// running with debug mode enabled
// http://localhost:8000/?debug=true
SipaEnv.debugLog("This is a debug message");
// => "This is a debug message" on console

// running with debug mode disabled
// http://localhost:8000/
SipaEnv.debugLog("This is a debug message");
// => no output on console
```
