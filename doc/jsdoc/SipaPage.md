<a name="SipaPage"></a>

## SipaPage
SipaPage

Tool class with page loader with included router

* [SipaPage](#SipaPage)
    * [.config](#SipaPage.config) : <code>SipaPage.Config</code>
    * [.load(page_id, options)](#SipaPage.load)
    * [.extractIdOfTemplate(template, options)](#SipaPage.extractIdOfTemplate) &rarr; <code>string</code>
    * [.getClassNameOfTemplate(template, options)](#SipaPage.getClassNameOfTemplate) &rarr; <code>string</code>
    * [.typeOptions(type)](#SipaPage.typeOptions) &rarr; <code>TypeOptionsType</code>
    * [.currentPageId()](#SipaPage.currentPageId) &rarr; <code>string</code>
    * [.currentPageClass()](#SipaPage.currentPageClass) &rarr; <code>SipaBasicView</code>
    * [.currentLayoutId()](#SipaPage.currentLayoutId) &rarr; <code>string</code>
    * [.loadLayout(layout_id, options)](#SipaPage.loadLayout)
    * [.callMethodOfPage(page_id, method_name, parameters)](#SipaPage.callMethodOfPage)
    * [.callMethodOfLayout(layout_id, method_name, parameters)](#SipaPage.callMethodOfLayout)
    * [.initHistoryState()](#SipaPage.initHistoryState)
    * [.stackHistoryState(state, replace_state)](#SipaPage.stackHistoryState)
    * [.setConfig(config)](#SipaPage.setConfig)
    * [.isInitialized()](#SipaPage.isInitialized) &rarr; <code>boolean</code>
    * [.reset()](#SipaPage.reset)
    * [.PageType](#SipaPage.PageType) : <code>Object</code>

<a name="SipaPage.config"></a>

### SipaPage.config : <code>SipaPage.Config</code>
**Kind**: static property of [<code>SipaPage</code>](#SipaPage)  
<a name="SipaPage.load"></a>

### SipaPage.load(page_id, options)
Load given page by page_id

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| page_id | <code>string</code> |  | to load |
| options | <code>Object</code> |  |  |
| options.layout_id | <code>string</code> |  | specify custom layout, overwrite default layout |
| options.force_load | <code>boolean</code> | <code>false</code> | force to load the page again, even if it is already loaded |
| options.fade_effect | <code>boolean</code> | <code>true</code> | use fade effect for the page container |
| options.stack_page | <code>boolean</code> | <code>true</code> | stack page in page history |
| options.params | <code>Object</code> |  | parameters to be set at the new page |
| options.keep_params | <code>boolean</code> | <code>true</code> | keep parameters when loading other page |
| options.anchor | <code>string</code> |  | anchor to be set at the new page |
| options.keep_anchor | <code>boolean</code> | <code>false</code> | keep current anchor when loading other page |
| options.remove_params | <code>Array.&lt;String&gt;</code> |  | parameters to be removed at the new page |
| options.success | <code>function</code> |  | function to be called after successful loading |
| options.error | <code>function</code> |  | function to be called after loading fails |
| options.always | <code>function</code> |  | function to be called always after successful/erroneous loading |


**Example**
```js
SipaPage.load('home', {
  layout_id: 'default', // optional, default layout is used if not given
  force_load: false, // optional, default false
  fade_effect: true, // optional, default true
  stack_page: true, // optional, default true
  params: { lang: 'de' }, // optional, default null
  keep_params: true, // optional, default true
  success: (data, text, response) => { console.log("page loaded successfully"); },
  error: (response, text, data) => { console.error("error loading page"); },
  always: (data, text, response) => { console.log("page load finished"); }
});
```
<a name="SipaPage.extractIdOfTemplate"></a>

### SipaPage.extractIdOfTemplate(template, options) &rarr; <code>string</code>
Get the id only of the given template.

**Returns**: <code>string</code> - absolute path  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| template | <code>string</code> |  | id or path of page or layout |
| options | <code>Object</code> |  |  |
| options.type | [<code>PageType</code>](#SipaPage.PageType) | <code>&#x27;page&#x27;</code> |  |


**Example**
```js
SipaPage.extractIdOfTemplate('views/pages/home/home.html');
// => 'home'

SipaPage.extractIdOfTemplate('views/pages/home');
// => 'home'

SipaPage.extractIdOfTemplate('views/pages/some/nested/nested.html');
// => 'some/nested'
```
<a name="SipaPage.getClassNameOfTemplate"></a>

### SipaPage.getClassNameOfTemplate(template, options) &rarr; <code>string</code>
Get the class name of the given template.

**Returns**: <code>string</code> - class name  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| template | <code>string</code> |  | id or path of page or layout |
| options | <code>Object</code> |  |  |
| options.type | [<code>PageType</code>](#SipaPage.PageType) | <code>&#x27;page&#x27;</code> |  |


**Example**
```js
SipaPage.getClassNameOfTemplate('views/pages/home/home.html');
// => 'HomePage'

SipaPage.getClassNameOfTemplate('views/pages/home');
// => 'HomePage'

SipaPage.getClassNameOfTemplate('views/pages/some/nested/nested.html');
// => 'SomeNestedPage'
```
<a name="SipaPage.typeOptions"></a>

### SipaPage.typeOptions(type) &rarr; <code>TypeOptionsType</code>
Get the options of the given type.

**Returns**: <code>TypeOptionsType</code> - type options  

| Param | Type |
| --- | --- |
| type | [<code>PageType</code>](#SipaPage.PageType) | 


**Example**
```js
SipaPage.typeOptions('page')
// => { prefix: 'views/pages/', file_ext: '.html' }

SipaPage.typeOptions('layout')
// => { prefix: 'views/layouts/', file_ext: '.html' }
```
<a name="SipaPage.currentPageId"></a>

### SipaPage.currentPageId() &rarr; <code>string</code>
Get page id of current loaded page.

**Returns**: <code>string</code> - page id  

**Example**
```js
// 'views/pages/home/home.html' is loaded
SipaPage.currentPageId()
// => 'home'

// 'views/pages/some/nested/nested.html' is loaded
SipaPage.currentPageId()
// => 'some/nested'
```
<a name="SipaPage.currentPageClass"></a>

### SipaPage.currentPageClass() &rarr; <code>SipaBasicView</code>
Get current page class.

**Example**
```js
// 'views/pages/home/home.html' is loaded
SipaPage.currentPageClass()
// => HomePage

// 'views/pages/some/nested/nested.html' is loaded
SipaPage.currentPageClass()
// => SomeNestedPage
```
<a name="SipaPage.currentLayoutId"></a>

### SipaPage.currentLayoutId() &rarr; <code>string</code>
Get layout id of current loaded layout.

**Example**
```js
// 'views/layouts/default/default.html' is loaded
SipaPage.currentLayoutId()
// => 'default'

// 'views/layouts/mini-dialog/mini-dialog.html' is loaded
SipaPage.currentLayoutId()
// => 'mini-dialog'
```
<a name="SipaPage.loadLayout"></a>

### SipaPage.loadLayout(layout_id, options)
Load the given layout.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| layout_id | <code>string</code> |  | to load |
| options | <code>Object</code> |  |  |
| options.fade_effect | <code>boolean</code> | <code>true</code> | fade effect on layout change |
| options.keep_page | <code>boolean</code> | <code>false</code> | keep the loaded page, but change the layout only |


**Example**
```js
SipaPage.loadLayout('default', {
  fade_effect: true, // optional, default true
  success: (data, text, response) => { console.log("layout loaded successfully"); },
  error: (response, text, data) => { console.error("error loading layout"); },
  always: (data, text, response) => { console.log("layout load finished"); }
});
```
<a name="SipaPage.callMethodOfPage"></a>

### SipaPage.callMethodOfPage(page_id, method_name, parameters)
Call the given method of the given page with given (optional) parameters.

| Param | Type |
| --- | --- |
| page_id | <code>string</code> | 
| method_name | <code>string</code> | 
| parameters | <code>Array</code> | 


**Example**
```js
class HomePage extends SipaBasicView {
  static someMethod(param1, param2) {
    console.log("someMethod called with", param1, param2);
  }
}

SipaPage.callMethodOfPage('home', 'someMethod', ['hello', 42]);
// => "someMethod called with hello 42"
```
<a name="SipaPage.callMethodOfLayout"></a>

### SipaPage.callMethodOfLayout(layout_id, method_name, parameters)
Call the given method of the given layout with given (optional) parameters.

| Param | Type |
| --- | --- |
| layout_id | <code>string</code> | 
| method_name | <code>string</code> | 
| parameters | <code>Array</code> | 


**Example**
```js
class DefaultLayout extends SipaBasicView {
 static someMethod(param1, param2) {
    console.log("someMethod called with", param1, param2);
  }
}

SipaPage.callMethodOfLayout('default', 'someMethod', ['hello', 42]);
// => "someMethod called with hello 42"
```
<a name="SipaPage.initHistoryState"></a>

### SipaPage.initHistoryState()
Initialize the router for single page app browser history.

This method is called automatically when setting the config of SipaPage.
<a name="SipaPage.stackHistoryState"></a>

### SipaPage.stackHistoryState(state, replace_state)
Stack the current page and layout state to the browser history.

| Param | Type | Default |
| --- | --- | --- |
| state | <code>Object</code> |  | 
| state.page_id | <code>string</code> |  | 
| state.layout_id | <code>string</code> |  | 
| state.options | <code>Object</code> |  | 
| replace_state | <code>boolean</code> | <code>false</code> | 


**Example**
```js
SipaPage.stackHistoryState({
  page_id: 'home',
  layout_id: 'default',
  options: { fade_effect: true, stack_page: true }
});
```
<a name="SipaPage.setConfig"></a>

### SipaPage.setConfig(config)
Set the configuration of pages and layouts

| Param | Type |
| --- | --- |
| config | <code>SipaPage.Config</code> | 


**Example**
```js
SipaPage.setConfig({
      // default layout for all pages
      default_layout: 'default',
      // specific layouts for some pages { <page-name>: <layout-name> }
      default_layouts: {
          // overwrites the layout for the page 'login-page' with layout 'mini-dialog'
          'login-page': 'mini-dialog'
      }
  });
```
<a name="SipaPage.isInitialized"></a>

### SipaPage.isInitialized() &rarr; <code>boolean</code>
Check if SipaPage was initialized with a config.
<a name="SipaPage.reset"></a>

### SipaPage.reset()
Reset all states

Useful for unit testing
<a name="SipaPage.PageType"></a>

### SipaPage.PageType : <code>Object</code>
Custom type definitions for excellent IDE auto complete support

| Param | Type |
| --- | --- |
| default_layout | <code>string</code> | 
| default_layouts | <code>Object</code> | 
| keep_anchor | <code>boolean</code> | 

**Properties**

| Name | Type |
| --- | --- |
| prefix | <code>string</code> | 
| file_ext | <code>string</code> | 

