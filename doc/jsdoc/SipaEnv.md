<a name="SipaEnv"></a>

## SipaEnv
SipaEnv

Tool class with environment dependent methods

* [SipaEnv](#SipaEnv)
    * [.version()](#SipaEnv.version) &rarr; <code>string</code>
    * [.name()](#SipaEnv.name) &rarr; <code>string</code>
    * [.description()](#SipaEnv.description) &rarr; <code>string</code>
    * [.isRunningLocalHost()](#SipaEnv.isRunningLocalHost) &rarr; <code>boolean</code>
    * [.isDebugMode()](#SipaEnv.isDebugMode) &rarr; <code>boolean</code>
    * [.debugLog(text)](#SipaEnv.debugLog)

<a name="SipaEnv.version"></a>

### SipaEnv.version() &rarr; <code>string</code>
Get the current version of your app.

The returned value within this method will automatically be
updated from your package.json at every release build cycle.
<a name="SipaEnv.name"></a>

### SipaEnv.name() &rarr; <code>string</code>
Get the current name of your app.

The returned value within this method will automatically be
updated from your package.json at every release build cycle.
<a name="SipaEnv.description"></a>

### SipaEnv.description() &rarr; <code>string</code>
Get the current description of your app.

The returned value within this method will automatically be
updated from your package.json at every release build cycle.
<a name="SipaEnv.isRunningLocalHost"></a>

### SipaEnv.isRunningLocalHost() &rarr; <code>boolean</code>
Check if Sipa is running at localhost.

**Returns**: <code>boolean</code> - true if localhost, otherwise false  
<a name="SipaEnv.isDebugMode"></a>

### SipaEnv.isDebugMode() &rarr; <code>boolean</code>
Check if debug mode is enabled

The debug mode can be enabled, by adding a query parameter 'debug=true' into your URL

**Returns**: <code>boolean</code> - true if enabled, otherwise false  
<a name="SipaEnv.debugLog"></a>

### SipaEnv.debugLog(text)
Debug output on console if debug mode is enabled

| Param | Type |
| --- | --- |
| text | <code>string</code> \| <code>any</code> | 

