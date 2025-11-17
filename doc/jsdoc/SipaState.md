<a name="SipaState"></a>

## SipaState
Tool class to store global states at different persistence levels.

Level 1 (variable): Data will be lost after reload (SipaState.LEVEL.VARIABLE)
                    You can even store references and functions!

Level 2 (session): Data will be lost when browser is closed (SipaState.LEVEL.SESSION)
                   You can not store references but thanks to SipaSerializer isolated functions are possible!

Level 3 (storage): Data will be lost when clearing browser cache only (SipaState.LEVEL.STORAGE)
                   You can not store references but thanks to SipaSerializer isolated functions are possible!

* [SipaState](#SipaState)
    * [.LEVEL](#SipaState.LEVEL) : <code>Object</code>
    * [.PERSISTENCE_PREFIX](#SipaState.PERSISTENCE_PREFIX) : <code>string</code>
    * [.set(key, value, options)](#SipaState.set)
    * [.setVariable(key, value, options)](#SipaState.setVariable)
    * [.setSession(key, value, options)](#SipaState.setSession)
    * [.setStorage(key, value, options)](#SipaState.setStorage)
    * [.getLevel(key)](#SipaState.getLevel) &rarr; [<code>LEVEL</code>](#SipaState.LEVEL) \| <code>null</code>
    * [.hasKey(key)](#SipaState.hasKey) &rarr; <code>boolean</code>
    * [.get(key)](#SipaState.get) &rarr; <code>any</code> \| <code>undefined</code>
    * [.getVariables()](#SipaState.getVariables) &rarr; <code>Object.&lt;String, any&gt;</code>
    * [.getSession()](#SipaState.getSession) &rarr; <code>Object.&lt;String, any&gt;</code>
    * [.getStorage()](#SipaState.getStorage) &rarr; <code>Object.&lt;String, any&gt;</code>
    * [.getAll()](#SipaState.getAll) &rarr; <code>Object.&lt;String, any&gt;</code>
    * [.getKeys()](#SipaState.getKeys) &rarr; <code>Array.&lt;String&gt;</code>
    * [.remove(key)](#SipaState.remove) &rarr; <code>boolean</code>
    * [.removeAll()](#SipaState.removeAll) &rarr; <code>boolean</code>
    * [.reset()](#SipaState.reset) &rarr; <code>boolean</code>
    * [.Level](#SipaState.Level) : <code>&#x27;variable&#x27;</code> \| <code>&#x27;session&#x27;</code> \| <code>&#x27;storage&#x27;</code>

<a name="SipaState.LEVEL"></a>

### SipaState.LEVEL : <code>Object</code>
Persistence levels
<a name="SipaState.PERSISTENCE_PREFIX"></a>

### SipaState.PERSISTENCE\_PREFIX : <code>string</code>
Prefix for all keys to avoid conflicts with other data in sessionStorage or localStorage.
<a name="SipaState.set"></a>

### SipaState.set(key, value, options)
Set a value with the given persistence level, by default SipaState.LEVEL.SESSION

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| key | <code>string</code> |  |  |
| value | <code>any</code> |  |  |
| options | <code>object</code> |  |  |
| options.level | [<code>Level</code>](#SipaState.Level) | <code>&#x27;session&#x27;</code> |  |
| options.force | <code>boolean</code> | <code>false</code> | overwrite value, if it is set at another level already |


**Example**
```js
// Set a variable that will be lost after reload
SipaState.set("my_var", {a:1, b:2}, {level: SipaState.LEVEL.VARIABLE});

// Set a session value that will be lost after closing the browser
SipaState.set("my_sess", {a:1, b:2}, {level: SipaState.LEVEL.SESSION});
SipaState.set("my_sess", {a:1, b:2});

// Set a storage value that
SipaState.set("my_store", {a:1, b:2}, {level: SipaState.LEVEL.STORAGE});
```
<a name="SipaState.setVariable"></a>

### SipaState.setVariable(key, value, options)
Set value in persistence level 1 (variable).

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| key | <code>string</code> |  |  |
| value | <code>any</code> |  |  |
| options | <code>object</code> |  |  |
| options.force | <code>boolean</code> | <code>false</code> | overwrite value without throwing error, if it is set at another level already |


**Example**
```js
// Set a variable that will be lost after reload
SipaState.setVariable("my_var", {a:1, b:2});
```
<a name="SipaState.setSession"></a>

### SipaState.setSession(key, value, options)
Set value in persistence level 2 (session).

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| key | <code>string</code> |  |  |
| value | <code>any</code> |  |  |
| options | <code>object</code> |  |  |
| options.force | <code>boolean</code> | <code>false</code> | overwrite value without throwing error, if it is set at another level already |


**Example**
```js
// Set a session value that will be lost after closing the browser
SipaState.setSession("my_sess", {a:1, b:2});
```
<a name="SipaState.setStorage"></a>

### SipaState.setStorage(key, value, options)
Set value in persistence level 3 (storage)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| key | <code>string</code> |  |  |
| value | <code>any</code> |  |  |
| options | <code>object</code> |  |  |
| options.force | <code>boolean</code> | <code>false</code> | overwrite value without throwing error, if it is set at another level already |


**Example**
```js
// Set a storage value that will be lost when clearing browser cache only
SipaState.setStorage("my_store", {a:1, b:2});
```
<a name="SipaState.getLevel"></a>

### SipaState.getLevel(key) &rarr; [<code>LEVEL</code>](#SipaState.LEVEL) \| <code>null</code>
Get the persistence level of the value stored at the given key.
If key is not set at any level, returns null.

| Param | Type |
| --- | --- |
| key | <code>string</code> | 


**Example**
```js
SipaState.setSession("my_sess", {a:1, b:2});
SipaState.getLevel("my_sess"); // returns 'session'

SipaState.setVariable("my_var", {a:1, b:2});
SipaState.getLevel("my_var"); // returns 'variable'

SipaState.setStorage("my_store", {a:1, b:2});
SipaState.getLevel("my_store"); // returns 'storage'

SipaState.getLevel("not_existing_key"); // returns null

// If key is set at multiple levels, the highest level is returned (storage > session > variable)
SipaState.setStorage("my_key", {a:1, b:2});
SipaState.setSession("my_key", {a:1, b:2});
SipaState.setVariable("my_key", {a:1, b:2});
SipaState.getLevel("my_key"); // returns 'storage'

SipaState.remove("my_key");
SipaState.setSession("my_key", {a:1, b:2});
SipaState.setVariable("my_key", {a:1, b:2});
SipaState.getLevel("my_key"); // returns 'session'

SipaState.set("my_key", {a:1, b:2}, {level: SipaState.LEVEL.VARIABLE, force: true});
SipaState.getLevel("my_key"); // returns 'variable'
```
<a name="SipaState.hasKey"></a>

### SipaState.hasKey(key) &rarr; <code>boolean</code>
Check if key is set already at any persistence level.

| Param | Type |
| --- | --- |
| key | <code>string</code> | 


**Example**
```js
SipaState.setSession("my_sess", {a:1, b:2});
SipaState.hasKey("my_sess"); // returns true

SipaState.hasKey("not_existing_key"); // returns false

SipaState.setStorage("my_store", {a:1, b:2});
SipaState.hasKey("my_store"); // returns true
```
<a name="SipaState.get"></a>

### SipaState.get(key) &rarr; <code>any</code> \| <code>undefined</code>
Get the value of the given key. Persistence level does not matter and is implicit.
The priority is storage > session > variable.

**Returns**: <code>any</code> \| <code>undefined</code> - value or undefined if key does not exist  

| Param | Type |
| --- | --- |
| key | <code>string</code> | 


**Example**
```js
SipaState.setSession("my_sess", {a:1, b:2});
SipaState.get("my_sess"); // returns {a:1, b:2}

SipaState.get("not_existing_key"); // returns undefined
```
<a name="SipaState.getVariables"></a>

### SipaState.getVariables() &rarr; <code>Object.&lt;String, any&gt;</code>
Get all entries of persistence level 1 (variables).

**Example**
```js
SipaState.setVariable("var1", 1);
SipaState.setVariable("var2", 2);
SipaState.setSession("sess1", 1);
SipaState.setStorage("store1", 1);

SipaState.getVariables(); // returns {var1: 1, var2: 2}
```
<a name="SipaState.getSession"></a>

### SipaState.getSession() &rarr; <code>Object.&lt;String, any&gt;</code>
Get all entries of persistence level 2 (session).

**Example**
```js
SipaState.setVariable("var1", 1);
SipaState.setSession("sess1", 1);
SipaState.setSession("sess2", 2);
SipaState.setStorage("store1", 1);

SipaState.getSession(); // returns {sess1: 1, sess2: 2}
```
<a name="SipaState.getStorage"></a>

### SipaState.getStorage() &rarr; <code>Object.&lt;String, any&gt;</code>
Get all entries of persistence level 3 (storage).

**Example**
```js
SipaState.setVariable("var1", 1);
SipaState.setSession("sess1", 1);
SipaState.setStorage("store1", 1);
SipaState.setStorage("store2", 2);

SipaState.getStorage(); // returns {store1: 1, store2: 2}
```
<a name="SipaState.getAll"></a>

### SipaState.getAll() &rarr; <code>Object.&lt;String, any&gt;</code>
Get all stored entries.

**Example**
```js
SipaState.setVariable("var1", 1);
SipaState.setSession("sess1", 1);
SipaState.setStorage("store1", 1);

SipaState.getAll(); // returns {var1: 1, sess1: 1, store1: 1}
```
<a name="SipaState.getKeys"></a>

### SipaState.getKeys() &rarr; <code>Array.&lt;String&gt;</code>
Get all keys.

**Example**
```js
SipaState.setVariable("var1", 1);
SipaState.setSession("sess1", 1);
SipaState.setStorage("store1", 1);

SipaState.getKeys(); // returns ['var1', 'sess1', 'store1']
```
<a name="SipaState.remove"></a>

### SipaState.remove(key) &rarr; <code>boolean</code>
Remove the stored value of the given key(s).

**Returns**: <code>boolean</code> - true if value of any key was set and has been removed. False if no key did exist.  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> \| <code>Array</code> | key or keys to remove |


**Example**
```js
SipaState.setVariable("var1", 1);
SipaState.setSession("sess1", 1);
SipaState.setStorage("store1", 1);

SipaState.remove("sess1"); // returns true
SipaState.getKeys(); // returns ['var1', 'store1']

SipaState.remove("not_existing"); // returns false

SipaState.remove(["var1", "store1"]); // returns true
```
<a name="SipaState.removeAll"></a>

### SipaState.removeAll() &rarr; <code>boolean</code>
Delete all stored data - alias method for reset().

**Returns**: <code>boolean</code> - true if one or more entries have been deleted  

**Example**
```js
SipaState.setVariable("var1", 1);
SipaState.setSession("sess1", 1);
SipaState.setStorage("store1", 1);

SipaState.removeAll(); // returns true
SipaState.getKeys(); // returns []
```
<a name="SipaState.reset"></a>

### SipaState.reset() &rarr; <code>boolean</code>
Delete all stored data.

**Returns**: <code>boolean</code> - true if one or more entries have been deleted  

**Example**
```js
SipaState.setVariable("var1", 1);
SipaState.setSession("sess1", 1);
SipaState.setStorage("store1", 1);

SipaState.reset(); // returns true
SipaState.getKeys(); // returns []
```
<a name="SipaState.Level"></a>

### SipaState.Level : <code>&#x27;variable&#x27;</code> \| <code>&#x27;session&#x27;</code> \| <code>&#x27;storage&#x27;</code>
**Kind**: static typedef of [<code>SipaState</code>](#SipaState)  
