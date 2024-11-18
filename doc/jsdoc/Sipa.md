<a name="Sipa"></a>

## Sipa
SipaFramework core class to provide core functionality.

* [Sipa](#Sipa)
    * [.getVersion()](#Sipa.getVersion) &rarr; <code>string</code>
    * [.init(init_function)](#Sipa.init)

<a name="Sipa.getVersion"></a>

### Sipa.getVersion() &rarr; <code>string</code>
Get the version of the used library
<a name="Sipa.init"></a>

### Sipa.init(init_function)
Callback function to fire to init the whole Sipa app.This is the entry point for your app. The given callback is called after Sipa is initialized.

| Param | Type |
| --- | --- |
| init_function | <code>function</code> | 


**Example**
```js
Sipa.init(() => {  SipaPage.load('login');});
```
