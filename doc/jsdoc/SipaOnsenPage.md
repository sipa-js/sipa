<a name="String"></a>

## SipaOnsenPage
SipaOnsenPage

Tool class with page loader with included router for OnsenUI

* [SipaOnsenPage](#SipaOnsenPage)
    * [.config](#SipaOnsenPage.config) : [<code>SipaOnsenPageConfig</code>](#SipaOnsenPageConfig)
    * [.load(page_id, options)](#SipaOnsenPage.load)
    * [.extractIdOfTemplate(template, options)](#SipaOnsenPage.extractIdOfTemplate) &rarr; <code>string</code>
    * [.getClassNameOfTemplate(template, options)](#SipaOnsenPage.getClassNameOfTemplate) &rarr; <code>string</code>
    * [.typeOptions(type)](#SipaOnsenPage.typeOptions) &rarr; <code>TypeOptionsType</code>
    * [.currentPageId()](#SipaOnsenPage.currentPageId) &rarr; <code>string</code>
    * [.currentPageClass()](#SipaOnsenPage.currentPageClass) &rarr; <code>SipaBasicView</code>
    * [.currentLayoutId()](#SipaOnsenPage.currentLayoutId) &rarr; <code>string</code>
    * [.loadLayout(layout_id, options)](#SipaOnsenPage.loadLayout)
    * [.callMethodOfPage(page_id, method_name, parameters)](#SipaOnsenPage.callMethodOfPage)
    * [.callMethodOfLayout(layout_id, method_name, parameters)](#SipaOnsenPage.callMethodOfLayout)
    * [.initHistoryState()](#SipaOnsenPage.initHistoryState)
    * [.stackHistoryState(state, replace_state)](#SipaOnsenPage.stackHistoryState)
    * [.setConfig(config)](#SipaOnsenPage.setConfig)

<a name="SipaOnsenPage.config"></a>

### SipaOnsenPage.config : [<code>SipaOnsenPageConfig</code>](#SipaOnsenPageConfig)
**Kind**: static property of [<code>SipaOnsenPage</code>](#SipaOnsenPage)  
<a name="SipaOnsenPage.load"></a>

### SipaOnsenPage.load(page_id, options)
Load given page by page_id

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| page_id | <code>string</code> |  | to load |
| options | <code>Object</code> |  |  |
| options.stack_page | <code>boolean</code> | <code>true</code> | stack page in page history |
| options.reset | <code>boolean</code> | <code>false</code> | reset page to given page |
| options.replace | <code>boolean</code> | <code>false</code> | replace current page with given page. If reset=true is set, this setting will be ignored |
| options.init_history_tree | <code>boolean</code> | <code>false</code> | force to load history tree, default false |
| options.params | <code>Object</code> |  | parameters to be set at the new page |
| options.keep_params | <code>boolean</code> | <code>true</code> | keep parameters when loading other page |
| options.anchor | <code>string</code> |  | anchor to be set at the new page |
| options.keep_anchor | <code>boolean</code> | <code>false</code> | keep current anchor when loading other page |
| options.remove_params | <code>Array.&lt;String&gt;</code> |  | parameters to be removed at the new page |
| options.success | <code>function</code> |  | function to be called after successful loading |
| options.error | <code>function</code> |  | function to be called after loading fails |
| options.always | <code>function</code> |  | function to be called always after successful/erroneous loading |

<a name="SipaOnsenPage.extractIdOfTemplate"></a>

### SipaOnsenPage.extractIdOfTemplate(template, options) &rarr; <code>string</code>
Get the id only of the given template

**Returns**: <code>string</code> - absolute path  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| template | <code>string</code> |  | id or path of page or layout |
| options | <code>Object</code> |  |  |
| options.type | <code>SipaPage.PageType</code> | <code>&#x27;page&#x27;</code> |  |

<a name="SipaOnsenPage.getClassNameOfTemplate"></a>

### SipaOnsenPage.getClassNameOfTemplate(template, options) &rarr; <code>string</code>
Get the class name of the given template

**Returns**: <code>string</code> - class name  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| template | <code>string</code> |  | id or path of page or layout |
| options | <code>Object</code> |  |  |
| options.type | <code>SipaPage.PageType</code> | <code>&#x27;page&#x27;</code> |  |

<a name="SipaOnsenPage.typeOptions"></a>

### SipaOnsenPage.typeOptions(type) &rarr; <code>TypeOptionsType</code>
Get the options of the given type

**Returns**: <code>TypeOptionsType</code> - type options  

| Param | Type |
| --- | --- |
| type | <code>SipaPage.PageType</code> | 

<a name="SipaOnsenPage.currentPageId"></a>

### SipaOnsenPage.currentPageId() &rarr; <code>string</code>
Get page id of current loaded page

**Returns**: <code>string</code> - page id  
<a name="SipaOnsenPage.currentPageClass"></a>

### SipaOnsenPage.currentPageClass() &rarr; <code>SipaBasicView</code>
Get current page class
<a name="SipaOnsenPage.currentLayoutId"></a>

### SipaOnsenPage.currentLayoutId() &rarr; <code>string</code>
Get layout id of current loaded layout
<a name="SipaOnsenPage.loadLayout"></a>

### SipaOnsenPage.loadLayout(layout_id, options)
Load the given layout

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| layout_id | <code>string</code> |  | to load |
| options | <code>Object</code> |  |  |
| options.fade_effect | <code>boolean</code> | <code>true</code> | fade effect on layout change |
| options.keep_page | <code>boolean</code> | <code>false</code> | keep the loaded page, but change the layout only |

<a name="SipaOnsenPage.callMethodOfPage"></a>

### SipaOnsenPage.callMethodOfPage(page_id, method_name, parameters)
Call the given method of the given page with given parameters (optional)

| Param | Type |
| --- | --- |
| page_id | <code>string</code> | 
| method_name | <code>string</code> | 
| parameters | <code>Array</code> | 

<a name="SipaOnsenPage.callMethodOfLayout"></a>

### SipaOnsenPage.callMethodOfLayout(layout_id, method_name, parameters)
Call the given method of the given layout with given parameters (optional)

| Param | Type |
| --- | --- |
| layout_id | <code>string</code> | 
| method_name | <code>string</code> | 
| parameters | <code>Array</code> | 

<a name="SipaOnsenPage.initHistoryState"></a>

### SipaOnsenPage.initHistoryState()
Initialize the router for single page app browser history
<a name="SipaOnsenPage.stackHistoryState"></a>

### SipaOnsenPage.stackHistoryState(state, replace_state)
Stack the current page and layout state to the browser history

| Param | Type | Default |
| --- | --- | --- |
| state | <code>Object</code> |  | 
| state.page_id | <code>string</code> |  | 
| state.layout_id | <code>string</code> |  | 
| state.options | <code>Object</code> |  | 
| replace_state | <code>boolean</code> | <code>false</code> | 

<a name="SipaOnsenPage.setConfig"></a>

### SipaOnsenPage.setConfig(config)
Set the configuration of pages and layouts

| Param | Type |
| --- | --- |
| config | <code>Object</code> | 
| config.default_layout | <code>string</code> | 
| config.default_layouts | <code>Object</code> | 


**Example**
```js
SipaOnsenPage.setConfig({
      // default layout for all pages
      default_layout: 'default',
      // specific layouts for some pages { <page-name>: <layout-name> }
      default_layouts: {
          // overwrites the layout for the page 'login-page' with layout 'mini-dialog'
          'login-page': 'mini-dialog'
      }
  });
```
<a name="SipaOnsenPageConfig"></a>

## SipaOnsenPageConfig : <code>Object</code>
Custom type definitions for excellent IDE auto complete support

| Param | Type |
| --- | --- |
| default_layout | <code>string</code> | 
| default_layouts | <code>Object</code> | 

**Properties**

| Name | Type |
| --- | --- |
| prefix | <code>string</code> | 
| file_ext | <code>string</code> | 

