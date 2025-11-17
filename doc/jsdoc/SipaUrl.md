<a name="SipaUrl"></a>

## SipaUrl
SipaUrl

Tool class to access and manipulate
the current or given URLs

All non getter methods return the class itself for chaining.

* [SipaUrl](#SipaUrl)
    * [.getUrl()](#SipaUrl.getUrl) &rarr; <code>string</code>
    * [.getUrlWithoutParamsAndAnchor(url)](#SipaUrl.getUrlWithoutParamsAndAnchor) &rarr; <code>string</code>
    * [.setUrl(url, [options])](#SipaUrl.setUrl) &rarr; [<code>SipaUrl</code>](#SipaUrl)
    * [.loadCurrentUrl()](#SipaUrl.loadCurrentUrl) &rarr; [<code>SipaUrl</code>](#SipaUrl)
    * [.load()](#SipaUrl.load) &rarr; [<code>SipaUrl</code>](#SipaUrl)
    * [.loadUrl(url)](#SipaUrl.loadUrl) &rarr; [<code>SipaUrl</code>](#SipaUrl)
    * [.getProtocol()](#SipaUrl.getProtocol) &rarr; <code>string</code>
    * [.setProtocol(protocol)](#SipaUrl.setProtocol) &rarr; [<code>SipaUrl</code>](#SipaUrl)
    * [.setProtocolOfUrl(url, protocol)](#SipaUrl.setProtocolOfUrl) &rarr; <code>string</code>
    * [.getHostName()](#SipaUrl.getHostName) &rarr; <code>string</code>
    * [.getHostNameOfUrl(url)](#SipaUrl.getHostNameOfUrl) &rarr; <code>string</code>
    * [.setHostName(hostname)](#SipaUrl.setHostName) &rarr; [<code>SipaUrl</code>](#SipaUrl)
    * [.setHostNameOfUrl(url, hostname)](#SipaUrl.setHostNameOfUrl) &rarr; <code>string</code>
    * [.getParams()](#SipaUrl.getParams) &rarr; <code>Object.&lt;string, string&gt;</code>
    * [.setParams(params)](#SipaUrl.setParams) &rarr; [<code>SipaUrl</code>](#SipaUrl)
    * [.setParam(param_key, value)](#SipaUrl.setParam) &rarr; [<code>SipaUrl</code>](#SipaUrl)
    * [.removeParams(param_keys)](#SipaUrl.removeParams) &rarr; [<code>SipaUrl</code>](#SipaUrl)
    * [.removeParam(param_key)](#SipaUrl.removeParam) &rarr; [<code>SipaUrl</code>](#SipaUrl)
    * [.resetParams()](#SipaUrl.resetParams) &rarr; [<code>SipaUrl</code>](#SipaUrl)
    * [.hasParam(param_key)](#SipaUrl.hasParam) &rarr; <code>boolean</code>
    * [.createUrlParams(params, options)](#SipaUrl.createUrlParams) &rarr; <code>string</code>
    * [.getParamsOfUrl(url, options)](#SipaUrl.getParamsOfUrl) &rarr; <code>Object.&lt;string, string&gt;</code>
    * [.removeParamsOfUrl(url, param_keys)](#SipaUrl.removeParamsOfUrl) &rarr; <code>string</code>
    * [.removeParamOfUrl(url, param_key)](#SipaUrl.removeParamOfUrl) &rarr; <code>string</code>
    * [.setParamsOfUrl(url, params)](#SipaUrl.setParamsOfUrl) &rarr; <code>string</code>
    * [.setAnchor(anchor, jump)](#SipaUrl.setAnchor) &rarr; [<code>SipaUrl</code>](#SipaUrl)
    * [.removeAnchor()](#SipaUrl.removeAnchor) &rarr; [<code>SipaUrl</code>](#SipaUrl)
    * [.getAnchor()](#SipaUrl.getAnchor) &rarr; <code>string</code> \| <code>undefined</code>
    * [.setAnchorOfUrl(url, anchor)](#SipaUrl.setAnchorOfUrl) &rarr; <code>string</code>
    * [.getAnchorOfUrl(url, options)](#SipaUrl.getAnchorOfUrl) &rarr; <code>string</code> \| <code>undefined</code>
    * [.removeAnchorOfUrl(url)](#SipaUrl.removeAnchorOfUrl) &rarr; <code>string</code>

<a name="SipaUrl.getUrl"></a>

### SipaUrl.getUrl() &rarr; <code>string</code>
Get the current URL of the address bar

**Example**
```js
SipaUrl.getUrl();
// => https://my-website.com/web/?page=abc&param=ok
```
<a name="SipaUrl.getUrlWithoutParamsAndAnchor"></a>

### SipaUrl.getUrlWithoutParamsAndAnchor(url) &rarr; <code>string</code>
Get the given url without query parameters and without anchors.

**Returns**: <code>string</code> - url without parameters  

| Param | Type |
| --- | --- |
| url | <code>string</code> | 


**Example**
```js
const url = "https://my-business.com/post?some=stuff&foo=bar#my-anchor";
SipaUrl.getUrlWithoutParamsAndAnchor(url);
// => https://my-business.com/post
```
<a name="SipaUrl.setUrl"></a>

### SipaUrl.setUrl(url, [options]) &rarr; [<code>SipaUrl</code>](#SipaUrl)
Overwrite the current url with the given url in the address bar,
by default without reloading the page, if the hostname did not change.

**Returns**: [<code>SipaUrl</code>](#SipaUrl) - for chaining  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| url | <code>string</code> |  |  |
| [options] | <code>Object</code> |  |  |
| [options.force_load] | <code>boolean</code> | <code>false</code> | if true, the given url will be (re)loaded, default: false |


**Example**
```js
// Current URL: https://my-business.com/?some=stuff&foo=bar#my-anchor
SipaUrl.setUrl("https://my-business.com/?other=param#new-anchor");
// New URL: https://my-business.com/?other=param#new-anchor
```
<a name="SipaUrl.loadCurrentUrl"></a>

### SipaUrl.loadCurrentUrl() &rarr; [<code>SipaUrl</code>](#SipaUrl)
Reload the current URL in the address bar.

Typically used, when the URL was changed by other URL
manipulation methods, that do not reload the page by default.

**Returns**: [<code>SipaUrl</code>](#SipaUrl) - for chaining  

**Example**
```js
// Current URL: https://my-business.com/?some=stuff&foo=bar#my-anchor
SipaUrl.setParam("new","param");
SipaUrl.setHostName("new-host.com");
SipaUrl.setAnchor("new-anchor");
SipaUrl.loadCurrentUrl();
```
<a name="SipaUrl.load"></a>

### SipaUrl.load() &rarr; [<code>SipaUrl</code>](#SipaUrl)
Alias for SipaUrl.loadCurrentUrl()

**Returns**: [<code>SipaUrl</code>](#SipaUrl) - for chaining  
<a name="SipaUrl.loadUrl"></a>

### SipaUrl.loadUrl(url) &rarr; [<code>SipaUrl</code>](#SipaUrl)
Load the given URL in the address bar.

**Returns**: [<code>SipaUrl</code>](#SipaUrl) - for chaining  

| Param | Type |
| --- | --- |
| url | <code>string</code> | 


**Example**
```js
SipaUrl.loadUrl("https://my-business.com/?some=stuff&foo=bar#my-anchor");
```
<a name="SipaUrl.getProtocol"></a>

### SipaUrl.getProtocol() &rarr; <code>string</code>
Get the protocol of the current url (without colon)

**Example**
```js
// URL: https://my-business.com/some-param
SipaUrl.getProtocol();
// => 'https'

// URL: http://my-insecure-business.com/other-param
SipaUrl.getProtocol();
// => 'http'
```
<a name="SipaUrl.setProtocol"></a>

### SipaUrl.setProtocol(protocol) &rarr; [<code>SipaUrl</code>](#SipaUrl)
Set the protocol of the current url without reloading the page.

**Returns**: [<code>SipaUrl</code>](#SipaUrl) - for chaining  
**Throws**:

- <code>Error</code> if given protocol is not supported


| Param | Type |
| --- | --- |
| protocol | <code>string</code> | 


**Example**
```js
// URL: http://my-insecure-business.com/other-param
SipaUrl.setProtocol("https");
// URL: https://my-insecure-business.com/other-param
SipaUrl.load();
```
<a name="SipaUrl.setProtocolOfUrl"></a>

### SipaUrl.setProtocolOfUrl(url, protocol) &rarr; <code>string</code>
Set the protocol of the given url.

**Returns**: <code>string</code> - with given protocol  
**Throws**:

- <code>Error</code> if given protocol is not supported


| Param | Type |
| --- | --- |
| url | <code>string</code> | 
| protocol | <code>string</code> | 


**Example**
```js
const url = "http://my-insecure-business.com/other-param";
SipaUrl.setProtocolOfUrl(url, "https");
// => "https://my-insecure-business.com/other-param"
```
<a name="SipaUrl.getHostName"></a>

### SipaUrl.getHostName() &rarr; <code>string</code>
Get the host name of the current url.

**Example**
```js
// URL: https://my-business.com/some-param
SipaUrl.getHostName();
// => 'my-business.com'

// URL https://www.my-business.com/some-param
SipaUrl.getHostName();
// => 'www.my-business.com'

// URL: https://subdomain.my-business.com/some-param
SipaUrl.getHostName();
// => 'subdomain.my-business.com'

// URL: http://localhost:7000/other-param
SipaUrl.getHostName();
// => 'localhost'

// URL: http://127.0.0.1/foo
SipaUrl.getHostName();
// => '127.0.0.1'

// URL: http://localhost/foo
SipaUrl.getHostName();
// => 'localhost'
```
<a name="SipaUrl.getHostNameOfUrl"></a>

### SipaUrl.getHostNameOfUrl(url) &rarr; <code>string</code>
Get the host name of the given url.

Returns an empty string if the given url is not valid or no hostname could be extracted.

| Param | Type |
| --- | --- |
| url | <code>string</code> | 


**Example**
```js
const url = "https://my-business.com/some-param";
SipaUrl.getHostNameOfUrl(url);
// => 'my-business.com'

const url2 = "https://www.my-business.com/some-param";
SipaUrl.getHostNameOfUrl(url2);
// => 'www.my-business.com'

const url3 = "https://subdomain.my-business.com/some-param";
SipaUrl.getHostNameOfUrl(url3);
// => 'subdomain.my-business.com'
```
<a name="SipaUrl.setHostName"></a>

### SipaUrl.setHostName(hostname) &rarr; [<code>SipaUrl</code>](#SipaUrl)
Set the host name of the current url without reloading the page.

| Param | Type |
| --- | --- |
| hostname | <code>string</code> | 


**Example**
```js
// URL: https://my-business.com/some-param
SipaUrl.setHostName("new-host.com");
// URL: https://new-host.com/some-param
```
<a name="SipaUrl.setHostNameOfUrl"></a>

### SipaUrl.setHostNameOfUrl(url, hostname) &rarr; <code>string</code>
Set/overwrite the host name of the given url.

| Param | Type |
| --- | --- |
| url | <code>string</code> | 
| hostname | <code>string</code> | 


**Example**
```js
const url = "https://my-business.com/some-param";
SipaUrl.setHostNameOfUrl(url, "new-host.com");
// => https://new-host.com/some-param

const url2 = "https://www.my-business.com/some-param";
SipaUrl.setHostNameOfUrl(url2, "other-host.org");
// => https://other-host.org/some-param

const url3 = "https://subdomain.my-business.com/some-param";
SipaUrl.setHostNameOfUrl(url3, "127.0.0.1");
// => https://127.0.0.1/some-param
```
<a name="SipaUrl.getParams"></a>

### SipaUrl.getParams() &rarr; <code>Object.&lt;string, string&gt;</code>
Get all params of the current URL.

**Example**
```js
// URL: https://my-business.com/?one=1&stat=true
SipaUrl.getParams();
// => { "one": "1", "stat": "true" }
```
<a name="SipaUrl.setParams"></a>

### SipaUrl.setParams(params) &rarr; [<code>SipaUrl</code>](#SipaUrl)
Set or overwrite given parameters of the current url.

**Returns**: [<code>SipaUrl</code>](#SipaUrl) - for chaining  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>Object.&lt;string, string&gt;</code> | in format { param1: value1, param2: value2, ... } |


**Example**
```js
// URL: https://my-business.com/?one=1&stat=true&that=cool
SipaUrl.setParams({ "more": "better", "stat": "false"});
// URL: https://my-business.com/?one=1&stat=false&that=cool&more=better
```
<a name="SipaUrl.setParam"></a>

### SipaUrl.setParam(param_key, value) &rarr; [<code>SipaUrl</code>](#SipaUrl)
Set or overwrite one specific parameter of the current url.

**Returns**: [<code>SipaUrl</code>](#SipaUrl) - for chaining  

| Param | Type |
| --- | --- |
| param_key | <code>string</code> | 
| value | <code>string</code> | 


**Example**
```js
// URL: https://my-business.com/?super=banana&coca=cola
SipaUrl.setParam("pepsi","coke");
// URL: https://my-business.com/?super=banana&coca=cola&pepsi=coke
```
<a name="SipaUrl.removeParams"></a>

### SipaUrl.removeParams(param_keys) &rarr; [<code>SipaUrl</code>](#SipaUrl)
Remove given params of the current url.

**Returns**: [<code>SipaUrl</code>](#SipaUrl) - for chaining  

| Param | Type |
| --- | --- |
| param_keys | <code>Array.&lt;String&gt;</code> | 


**Example**
```js
// URL: https://my-business.com/?some=stuff&foo=bar&more=power
SipaUrl.removeParams(["some","more"]);
// URL: https://my-business.com/?foo=bar
```
<a name="SipaUrl.removeParam"></a>

### SipaUrl.removeParam(param_key) &rarr; [<code>SipaUrl</code>](#SipaUrl)
Remove given param of the current url.

**Returns**: [<code>SipaUrl</code>](#SipaUrl) - for chaining  

| Param | Type |
| --- | --- |
| param_key | <code>string</code> | 


**Example**
```js
// URL: https://my-business.com/?some=stuff&foo=bar
SipaUrl.removeParam("foo");
// URL: https://my-business.com/?some=stuff
```
<a name="SipaUrl.resetParams"></a>

### SipaUrl.resetParams() &rarr; [<code>SipaUrl</code>](#SipaUrl)
Remove all params of the current url.
If there is no parameter, nothing happens.
If there is an anchor, it will be preserved.

**Returns**: [<code>SipaUrl</code>](#SipaUrl) - for chaining  

**Example**
```js
// URL: https://my-business.com/?some=stuff&foo=bar#my-anchor
SipaUrl.resetParams();
// URL: https://my-business.com/#my-anchor
```
<a name="SipaUrl.hasParam"></a>

### SipaUrl.hasParam(param_key) &rarr; <code>boolean</code>
Check if the current url has the given parameter.
If the parameter exists, it does not matter if it has a value or not.
If the parameter exists multiple times, it also returns true.
If the parameter does not exist, it returns false.

| Param | Type |
| --- | --- |
| param_key | <code>string</code> | 

<a name="SipaUrl.createUrlParams"></a>

### SipaUrl.createUrlParams(params, options) &rarr; <code>string</code>
Creates a URL query string based on the given key<->value object.

| Param | Type | Description |
| --- | --- | --- |
| params | <code>Object.&lt;string, string&gt;</code> | in format { param1: value1, param2: value2, ... } |
| options | <code>Object</code> |  |
| options.url_encode | <code>boolean</code> | url encode parameter keys and values, default: true |
| options.multi_param_attributes | <code>boolean</code> | if attribute is of array, make it 'id=1&id=2&id=3' on true, or 'id=1,2,3' on false |


**Example**
```js
SipaUrl.createUrlParams({ a: 1, b: [1,2,3], c: "test space" })
// => 'a=1&b=1&b=2&b=3&c=test%20space'
```
<a name="SipaUrl.getParamsOfUrl"></a>

### SipaUrl.getParamsOfUrl(url, options) &rarr; <code>Object.&lt;string, string&gt;</code>
Create a JSON, containing the parameters of the given url.

**Returns**: <code>Object.&lt;string, string&gt;</code> - return a JSON with { param1: value1, param2: value2, ... }  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | the url to extract parameters from |
| options | <code>Object</code> |  |
| options.decode_uri | <code>boolean</code> | decode uri parameter values |


**Example**
```js
SipaUrl.getParamsOfUrl("https://my-business.com/?some=stuff&foo=bar");
// => { "some": "stuff", "foo": "bar" }
```
<a name="SipaUrl.removeParamsOfUrl"></a>

### SipaUrl.removeParamsOfUrl(url, param_keys) &rarr; <code>string</code>
Remove the given parameters from the given url.

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | to remove the params from |
| param_keys | <code>Array.&lt;String&gt;</code> | array of keys to remove from the given url, e.g. ['key1','key2'} |


**Example**
```js
const url = "https://my-business.com/?some=stuff&foo=bar&more=power";
SipaUrl.removeParamsOfUrl(url, ["some","more"]);
// => https://my-business.com/?foo=bar
```
<a name="SipaUrl.removeParamOfUrl"></a>

### SipaUrl.removeParamOfUrl(url, param_key) &rarr; <code>string</code>
Remove the given one parameter from the given url.

**Returns**: <code>string</code> - with given parameter removed  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> |  |
| param_key | <code>string</code> | name of the param |


**Example**
```js
const url = "https://my-business.com/?some=stuff&foo=bar";
SipaUrl.removeParamOfUrl(url, "foo");
// => https://my-business.com/?some=stuff
```
<a name="SipaUrl.setParamsOfUrl"></a>

### SipaUrl.setParamsOfUrl(url, params) &rarr; <code>string</code>
Set/overwrite the parameters of the given url.

**Returns**: <code>string</code> - with given parameters  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> |  |
| params | <code>Object.&lt;string, string&gt;</code> | in format { param1: value1, param2: value2, ... } |


**Example**
```js
const url = "https://my-business.com/?one=1&stat=true&that=cool"
SipaUrl.setParamsOfUrl(url, { "more": "better", "stat": "false"});
// => https://my-business.com/?one=1&stat=false&that=cool&more=better
```
<a name="SipaUrl.setAnchor"></a>

### SipaUrl.setAnchor(anchor, jump) &rarr; [<code>SipaUrl</code>](#SipaUrl)
Set or overwrite given anchor of the current url.

**Returns**: [<code>SipaUrl</code>](#SipaUrl) - for chaining  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| anchor | <code>string</code> |  | without leading # character |
| jump | <code>boolean</code> | <code>false</code> | jump to anchor |


**Example**
```js
// URL: https://my-business.com/?some=stuff#my-anchor
SipaUrl.setAnchor("new-anchor");
// URL: https://my-business.com/?some=stuff#new-anchor

// URL: https://my-business.com/?without=anchor
SipaUrl.setAnchor("added-anchor");
// URL: https://my-business.com/?without=anchor#added-anchor
```
<a name="SipaUrl.removeAnchor"></a>

### SipaUrl.removeAnchor() &rarr; [<code>SipaUrl</code>](#SipaUrl)
Remove the anchor of the current URL.

**Returns**: [<code>SipaUrl</code>](#SipaUrl) - for chaining  

**Example**
```js
// URL: https://my-business.com/?some=stuff&foo=bar#my-anchor
SipaUrl.removeAnchor();
// URL: https://my-business.com/?some=stuff&foo=bar
```
<a name="SipaUrl.getAnchor"></a>

### SipaUrl.getAnchor() &rarr; <code>string</code> \| <code>undefined</code>
Get the anchor of the current URL without leading #.

Returns undefined if there is no anchor.

**Example**
```js
// URL: https://my-business.com/?some=stuff&foo=bar#my-anchor
SipaUrl.getAnchor();
// => 'my-anchor'

// URL: https://my-business.com/?some=stuff&foo=bar
SipaUrl.getAnchor();
// => undefined
```
<a name="SipaUrl.setAnchorOfUrl"></a>

### SipaUrl.setAnchorOfUrl(url, anchor) &rarr; <code>string</code>
Set/overwrite the anchor of the given url.

**Returns**: <code>string</code> - with given anchor  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> |  |
| anchor | <code>string</code> | as string, without leading # |


**Example**
```js
const url = "https://my-business.com/?some=stuff#my-anchor";
SipaUrl.setAnchorOfUrl(url, "new-anchor");
// => https://my-business.com/?some=stuff#new-anchor

const url2 = "https://my-business.com/?without=anchor";
SipaUrl.setAnchorOfUrl(url2, "added-anchor");
// => https://my-business.com/?without=anchor#added-anchor
```
<a name="SipaUrl.getAnchorOfUrl"></a>

### SipaUrl.getAnchorOfUrl(url, options) &rarr; <code>string</code> \| <code>undefined</code>
Get the anchor of the given url.

**Returns**: <code>string</code> \| <code>undefined</code> - the anchor of the given url  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> |  |
| options | <code>object</code> |  |
| options.return_prefixed_hash | <code>boolean</code> | return the prefixed hash |


**Example**
```js
const url = "https://my-business.com/?some=stuff&foo=bar#my-anchor";
SipaUrl.getAnchorOfUrl(url);
// => 'my-anchor'

const url2 = "https://my-business.com/?some=stuff&foo=bar";
SipaUrl.getAnchorOfUrl(url2);
// => undefined
```
<a name="SipaUrl.removeAnchorOfUrl"></a>

### SipaUrl.removeAnchorOfUrl(url) &rarr; <code>string</code>
Remove the anchor of the given url.

**Returns**: <code>string</code> - without anchor  

| Param | Type |
| --- | --- |
| url | <code>string</code> | 


**Example**
```js
const url = "https://my-business.com/?some=stuff&foo=bar#my-anchor";
SipaUrl.removeAnchorOfUrl(url);
// => https://my-business.com/?some=stuff&foo=bar
```
