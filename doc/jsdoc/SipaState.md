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
    * [.set(key, value, options)](#SipaState.set)
    * [.setVariable(key, value, options)](#SipaState.setVariable)
    * [.setSession(key, value, options)](#SipaState.setSession)
    * [.setStorage(key, value, options)](#SipaState.setStorage)
    * [.getLevel(key)](#SipaState.getLevel) &rarr; <code>SipaState.LEVEL</code> \| <code>null</code>
    * [.hasKey(key)](#SipaState.hasKey) &rarr; <code>boolean</code>
    * [.get(key)](#SipaState.get)
    * [.getVariables()](#SipaState.getVariables) &rarr; <code>Object.&lt;String, any&gt;</code>
    * [.getSession()](#SipaState.getSession) &rarr; <code>Object.&lt;String, any&gt;</code>
    * [.getStorage()](#SipaState.getStorage) &rarr; <code>Object.&lt;String, any&gt;</code>
    * [.getAll()](#SipaState.getAll) &rarr; <code>Object.&lt;String, any&gt;</code>
    * [.getKeys()](#SipaState.getKeys) &rarr; <code>Array.&lt;String&gt;</code>
    * [.remove(key)](#SipaState.remove) &rarr; <code>boolean</code>
    * [.removeAll()](#SipaState.removeAll) &rarr; <code>boolean</code>
    * [.reset()](#SipaState.reset) &rarr; <code>boolean</code>
    * [.Level](#SipaState.Level) : <code>&#x27;variable&#x27;</code> \| <code>&#x27;session&#x27;</code> \| <code>&#x27;storage&#x27;</code>

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

<a name="SipaState.setVariable"></a>

### SipaState.setVariable(key, value, options)
Set value in persistence level 1 (variable)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| key | <code>string</code> |  |  |
| value | <code>any</code> |  |  |
| options | <code>object</code> |  |  |
| options.force | <code>boolean</code> | <code>false</code> | overwrite value without throwing error, if it is set at another level already |

<a name="SipaState.setSession"></a>

### SipaState.setSession(key, value, options)
Set value in persistence level 2 (session)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| key | <code>string</code> |  |  |
| value | <code>any</code> |  |  |
| options | <code>object</code> |  |  |
| options.force | <code>boolean</code> | <code>false</code> | overwrite value without throwing error, if it is set at another level already |

<a name="SipaState.setStorage"></a>

### SipaState.setStorage(key, value, options)
Set value in persistence level 3 (storage)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| key | <code>string</code> |  |  |
| value | <code>any</code> |  |  |
| options | <code>object</code> |  |  |
| options.force | <code>boolean</code> | <code>false</code> | overwrite value without throwing error, if it is set at another level already |

<a name="SipaState.getLevel"></a>

### SipaState.getLevel(key) &rarr; <code>SipaState.LEVEL</code> \| <code>null</code>
Get the persistence level of the value stored at the given key.
If key is not set at any level, returns null.

| Param | Type |
| --- | --- |
| key | <code>string</code> | 

<a name="SipaState.hasKey"></a>

### SipaState.hasKey(key) &rarr; <code>boolean</code>
Check if key is set already at any persistence level

| Param | Type |
| --- | --- |
| key | <code>string</code> | 

<a name="SipaState.get"></a>

### SipaState.get(key)
Get the value of the given key. Persistence level does not matter and is implicit.

| Param | Type |
| --- | --- |
| key | <code>string</code> | 

<a name="SipaState.getVariables"></a>

### SipaState.getVariables() &rarr; <code>Object.&lt;String, any&gt;</code>
Get all entries of persistence level 1 (variables)
<a name="SipaState.getSession"></a>

### SipaState.getSession() &rarr; <code>Object.&lt;String, any&gt;</code>
Get all entries of persistence level 2 (session)
<a name="SipaState.getStorage"></a>

### SipaState.getStorage() &rarr; <code>Object.&lt;String, any&gt;</code>
Get all entries of persistence level 3 (storage)
<a name="SipaState.getAll"></a>

### SipaState.getAll() &rarr; <code>Object.&lt;String, any&gt;</code>
Get all stored entries
<a name="SipaState.getKeys"></a>

### SipaState.getKeys() &rarr; <code>Array.&lt;String&gt;</code>
Get all keys
<a name="SipaState.remove"></a>

### SipaState.remove(key) &rarr; <code>boolean</code>
Remove the stored value of the given key(s)

**Returns**: <code>boolean</code> - true if value of any key was set and has been removed. False if no key did exist.  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> \| <code>Array</code> | key or keys to remove |

<a name="SipaState.removeAll"></a>

### SipaState.removeAll() &rarr; <code>boolean</code>
Delete all stored data - alias method for reset()

**Returns**: <code>boolean</code> - true if one or more entries have been deleted  
<a name="SipaState.reset"></a>

### SipaState.reset() &rarr; <code>boolean</code>
Delete all stored data

**Returns**: <code>boolean</code> - true if one or more entries have been deleted  
<a name="SipaState.Level"></a>

### SipaState.Level : <code>&#x27;variable&#x27;</code> \| <code>&#x27;session&#x27;</code> \| <code>&#x27;storage&#x27;</code>
**Kind**: static typedef of [<code>SipaState</code>](#SipaState)  
