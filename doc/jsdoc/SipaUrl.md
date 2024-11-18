<a name="SipaUrl"></a>

## SipaUrl
SipaUrlTool class to access and manipulatethe current or given URLs

* [SipaUrl](#SipaUrl)
    * [.getUrl()](#SipaUrl.getUrl) &rarr; <code>string</code>
    * [.getProtocol()](#SipaUrl.getProtocol) &rarr; <code>&#x27;http&#x27;</code> \| <code>&#x27;https&#x27;</code>
    * [.getHostName()](#SipaUrl.getHostName) &rarr; <code>string</code>
    * [.getParams()](#SipaUrl.getParams) &rarr; <code>Object.&lt;string, string&gt;</code>
    * [.setParams(params)](#SipaUrl.setParams)
    * [.setParam(param_key, value)](#SipaUrl.setParam)
    * [.removeParams(param_keys)](#SipaUrl.removeParams)
    * [.removeParam(param_key)](#SipaUrl.removeParam)
    * [.setAnchor(anchor, jump)](#SipaUrl.setAnchor)
    * [.removeAnchor()](#SipaUrl.removeAnchor)
    * [.getAnchor()](#SipaUrl.getAnchor) &rarr; <code>string</code>
    * [.createUrlParams(params, options)](#SipaUrl.createUrlParams) &rarr; <code>string</code>
    * [.getParamsOfUrl(url, options)](#SipaUrl.getParamsOfUrl) &rarr; <code>Object.&lt;string, string&gt;</code>
    * [.removeParamsOfUrl(url, param_keys)](#SipaUrl.removeParamsOfUrl) &rarr; <code>string</code>
    * [.removeParamOfUrl(url, param_key)](#SipaUrl.removeParamOfUrl)
    * [.setParamsOfUrl(url, params)](#SipaUrl.setParamsOfUrl) &rarr; <code>string</code>
    * [.setAnchorOfUrl(url, anchor)](#SipaUrl.setAnchorOfUrl) &rarr; <code>string</code>
    * [.getAnchorOfUrl(url, options)](#SipaUrl.getAnchorOfUrl) &rarr; <code>string</code>
    * [.removeAnchorOfUrl(url)](#SipaUrl.removeAnchorOfUrl) &rarr; <code>string</code>

<a name="SipaUrl.getUrl"></a>

### SipaUrl.getUrl() &rarr; <code>string</code>
Get the current address of the website

**Example**
```js
SipaUrl.getUrl();// => https://my-website.com/web/?page=abc&param=ok
```
<a name="SipaUrl.getProtocol"></a>

### SipaUrl.getProtocol() &rarr; <code>&#x27;http&#x27;</code> \| <code>&#x27;https&#x27;</code>
Get the protocol of the current url (without colon)

**Example**
```js
SipaUrl.getProtocol();// => 'https'
```
<a name="SipaUrl.getHostName"></a>

### SipaUrl.getHostName() &rarr; <code>string</code>
Get the host name of the current url

**Example**
```js
localhost     127.0.0.1     localhost:7000     my-domain.com
```
<a name="SipaUrl.getParams"></a>

### SipaUrl.getParams() &rarr; <code>Object.&lt;string, string&gt;</code>
Get all params of the current URL

**Example**
```js
// URL: https://my-business.com/?one=1&stat=trueSipaUrl.getParams();// => { "one": "1", "stat": "true" }
```
<a name="SipaUrl.setParams"></a>

### SipaUrl.setParams(params)
Set or overwrite given parameters of the current url

| Param | Type | Description |
| --- | --- | --- |
| params | <code>Object.&lt;string, string&gt;</code> | in format { param1: value1, param2: value2, ... } |


**Example**
```js
// URL: https://my-business.com/?one=1&stat=true&that=coolSipaUrl.setParams({ "more": "better", "stat": "false"});// URL: https://my-business.com/?one=1&stat=false&that=cool&more=better
```
<a name="SipaUrl.setParam"></a>

### SipaUrl.setParam(param_key, value)
Set or overwrite one specific parameter of the current url

| Param | Type |
| --- | --- |
| param_key | <code>string</code> | 
| value | <code>string</code> | 


**Example**
```js
// URL: https://my-business.com/?super=banana&coca=colaSipaUrl.setParam("pepsi","coke");// URL: https://my-business.com/?super=banana&coca=cola&pepsi=coke
```
<a name="SipaUrl.removeParams"></a>

### SipaUrl.removeParams(param_keys)
Remove given params of the current url

| Param | Type |
| --- | --- |
| param_keys | <code>Array.&lt;String&gt;</code> | 


**Example**
```js
// URL: https://my-business.com/?some=stuff&foo=bar&more=powerSipaUrl.removeParams(["some","more"]);// URL: https://my-business.com/?foo=bar
```
<a name="SipaUrl.removeParam"></a>

### SipaUrl.removeParam(param_key)
Remove given param of the current url

| Param | Type |
| --- | --- |
| param_key | <code>string</code> | 


**Example**
```js
// URL: https://my-business.com/?some=stuff&foo=barSipaUrl.removeParam("foo");// URL: https://my-business.com/?some=stuff
```
<a name="SipaUrl.setAnchor"></a>

### SipaUrl.setAnchor(anchor, jump)
Set or overwrite given anchor of the current url

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| anchor | <code>string</code> |  | without leading # character |
| jump | <code>boolean</code> | <code>false</code> | jump to anchor |

<a name="SipaUrl.removeAnchor"></a>

### SipaUrl.removeAnchor()
Remove the anchor of the current URL

**Example**
```js
// URL: https://my-business.com/?some=stuff&foo=bar#my-anchorSipaUrl.removeAnchor();// URL: https://my-business.com/?some=stuff&foo=bar
```
<a name="SipaUrl.getAnchor"></a>

### SipaUrl.getAnchor() &rarr; <code>string</code>
Get the anchor of the current URL without leading #
<a name="SipaUrl.createUrlParams"></a>

### SipaUrl.createUrlParams(params, options) &rarr; <code>string</code>
Creates an url query string based on the given key<->value object

| Param | Type | Description |
| --- | --- | --- |
| params | <code>Object.&lt;string, string&gt;</code> | in format { param1: value1, param2: value2, ... } |
| options | <code>Object</code> |  |
| options.url_encode | <code>boolean</code> | url encode parameter keys and values, default: true |
| options.multi_param_attributes | <code>boolean</code> | if attribute is of array, make it 'id=1&id=2&id=3' on true, or 'id=1,2,3' on false |


**Example**
```js
{ a: 1, b: [1,2,3], c: "test space" } => 'a=1&b=1&b=2&b=3&c=test%20space'
```
<a name="SipaUrl.getParamsOfUrl"></a>

### SipaUrl.getParamsOfUrl(url, options) &rarr; <code>Object.&lt;string, string&gt;</code>
Create a JSON, containing the parameters of the given url

**Returns**: <code>Object.&lt;string, string&gt;</code> - return a JSON with { param1: value1, param2: value2, ... }  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | the url to extract parameters from |
| options | <code>Object</code> |  |
| options.decode_uri | <code>boolean</code> | decode uri parameter values |


**Example**
```js
SipaUrl.getParamsOfUrl("https://my-business.com/?some=stuff&foo=bar");// => { "some": "stuff", "foo": "bar" }
```
<a name="SipaUrl.removeParamsOfUrl"></a>

### SipaUrl.removeParamsOfUrl(url, param_keys) &rarr; <code>string</code>
Remove the given parameters from the given url

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | to remove the params from |
| param_keys | <code>Array.&lt;String&gt;</code> | array of keys to remove from the given url, e.g. ['key1','key2'} |

<a name="SipaUrl.removeParamOfUrl"></a>

### SipaUrl.removeParamOfUrl(url, param_key)
Remove the given one parameter from the given url

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> |  |
| param_key | <code>string</code> | name of the param |

<a name="SipaUrl.setParamsOfUrl"></a>

### SipaUrl.setParamsOfUrl(url, params) &rarr; <code>string</code>
Set/overwrite the parameters of the given url

**Returns**: <code>string</code> - with given parameters  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> |  |
| params | <code>Object.&lt;string, string&gt;</code> | in format { param1: value1, param2: value2, ... } |

<a name="SipaUrl.setAnchorOfUrl"></a>

### SipaUrl.setAnchorOfUrl(url, anchor) &rarr; <code>string</code>
Set/overwrite the anchor of the given url

**Returns**: <code>string</code> - with given anchor  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> |  |
| anchor | <code>string</code> | as string, without leading # |

<a name="SipaUrl.getAnchorOfUrl"></a>

### SipaUrl.getAnchorOfUrl(url, options) &rarr; <code>string</code>
Get the anchor of the given url

**Returns**: <code>string</code> - the anchor of the given url  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> |  |
| options | <code>object</code> |  |
| options.return_prefixed_hash | <code>boolean</code> | return the prefixed hash |

<a name="SipaUrl.removeAnchorOfUrl"></a>

### SipaUrl.removeAnchorOfUrl(url) &rarr; <code>string</code>
Remove the anchor of the given url

**Returns**: <code>string</code> - without anchor  

| Param | Type |
| --- | --- |
| url | <code>string</code> | 

