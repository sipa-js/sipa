<a name="String"></a>

## SipaOnsenPage
SipaOnsenPage

Tool class with page loader with included router for OnsenUI (mobile).

* [SipaOnsenPage](#SipaOnsenPage)
    * [.config](#SipaOnsenPage.config) : [<code>Config</code>](#SipaOnsenPage.Config)
    * [.load(page_id, options)](#SipaOnsenPage.load)
    * [.getOnsenNavigator()](#SipaOnsenPage.getOnsenNavigator) &rarr; <code>Element</code>
    * [.extractIdOfTemplate(template, options)](#SipaOnsenPage.extractIdOfTemplate) &rarr; <code>string</code>
    * [.getClassNameOfTemplate(template, options)](#SipaOnsenPage.getClassNameOfTemplate) &rarr; <code>string</code>
    * [.typeOptions(type)](#SipaOnsenPage.typeOptions) &rarr; [<code>TypeOptionsType</code>](#TypeOptionsType)
    * [.currentPageId()](#SipaOnsenPage.currentPageId) &rarr; <code>string</code> \| <code>undefined</code>
    * [.currentPageClass()](#SipaOnsenPage.currentPageClass) &rarr; <code>SipaBasicView</code> \| <code>undefined</code>
    * [.currentLayoutId()](#SipaOnsenPage.currentLayoutId) &rarr; <code>string</code>
    * [.loadLayout(layout_id, options)](#SipaOnsenPage.loadLayout)
    * [.callMethodOfPage(page_id, method_name, parameters)](#SipaOnsenPage.callMethodOfPage)
    * [.callMethodOfLayout(layout_id, method_name, parameters)](#SipaOnsenPage.callMethodOfLayout)
    * [.setConfig(config)](#SipaOnsenPage.setConfig)
    * [.popPage(options)](#SipaOnsenPage.popPage) &rarr; <code>Promise</code>
    * [.addStatusBarMock()](#SipaOnsenPage.addStatusBarMock)
    * [.removeStatusBarMock()](#SipaOnsenPage.removeStatusBarMock)
    * [._initStatusBarMock()](#SipaOnsenPage._initStatusBarMock)
    * [.reset()](#SipaOnsenPage.reset)
    * [.Config](#SipaOnsenPage.Config) : <code>Object</code>
    * [.OnsenOptions](#SipaOnsenPage.OnsenOptions) : <code>Object</code>

<a name="SipaOnsenPage.config"></a>

### SipaOnsenPage.config : [<code>Config</code>](#SipaOnsenPage.Config)
**Kind**: static property of [<code>SipaOnsenPage</code>](#SipaOnsenPage)  
<a name="SipaOnsenPage.load"></a>

### SipaOnsenPage.load(page_id, options)
Load given page by page_id

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| page_id | <code>string</code> |  | to load |
| options | <code>Object</code> |  |  |
| options.reset | <code>boolean</code> | <code>false</code> | reset page to given page |
| options.replace | <code>boolean</code> | <code>false</code> | replace current page with given page. If reset=true is set, this option will be ignored |
| options.push | <code>boolean</code> | <code>false</code> | stack given page over current page, independent if it exists already. If reset=true or replace=true is set, this option will be ignored |
| options.onsen | [<code>OnsenOptions</code>](#SipaOnsenPage.OnsenOptions) |  | options passed to original OnsenUI bringPageTop / pushPage / replacePage / resetPage |
| options.init_history_tree | <code>boolean</code> | <code>false</code> | force to load history tree, default false |
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
SipaOnsenPage.load('home', {
  reset: true,
  params: { user_id: 123 },
  anchor: 'section2',
  keep_params: false,
  keep_anchor: false,
  fade_effect: true,
  onsen: { animation: 'fade' },
  success: (data, text, response) => {
    console.log("Page loaded successfully");
  },
  error: (response, text, data) => {
    console.error("Error loading page");
  }
});
```
<a name="SipaOnsenPage.getOnsenNavigator"></a>

### SipaOnsenPage.getOnsenNavigator() &rarr; <code>Element</code>
Get the OnsenUI navigator element.
<a name="SipaOnsenPage.extractIdOfTemplate"></a>

### SipaOnsenPage.extractIdOfTemplate(template, options) &rarr; <code>string</code>
Get the id only of the given template.

**Returns**: <code>string</code> - absolute path  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| template | <code>string</code> |  | id or path of page or layout |
| options | <code>Object</code> |  |  |
| options.type | <code>SipaPage.PageType</code> | <code>&#x27;page&#x27;</code> |  |


**Example**
```js
SipaOnsenPage.extractIdOfTemplate('views/pages/test/test.html');
// => 'test'

SipaOnsenPage.extractIdOfTemplate('views/pages/group/children.html');
// => 'group/children'
```
<a name="SipaOnsenPage.getClassNameOfTemplate"></a>

### SipaOnsenPage.getClassNameOfTemplate(template, options) &rarr; <code>string</code>
Get the class name of the given template.

**Returns**: <code>string</code> - class name  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| template | <code>string</code> |  | id or path of page or layout |
| options | <code>Object</code> |  |  |
| options.type | <code>SipaPage.PageType</code> | <code>&#x27;page&#x27;</code> |  |


**Example**
```js
SipaOnsenPage.getClassNameOfTemplate('views/pages/test/test.html');
// => 'TestPage'

SipaOnsenPage.getClassNameOfTemplate('views/pages/group/children/children.html');
// => 'GroupChildrenPage'

SipaOnsenPage.getClassNameOfTemplate('views/layouts/main/main.html', {type: 'layout'});
// => 'MainLayout'
```
<a name="SipaOnsenPage.typeOptions"></a>

### SipaOnsenPage.typeOptions(type) &rarr; [<code>TypeOptionsType</code>](#TypeOptionsType)
Get the options of the given type.

**Returns**: [<code>TypeOptionsType</code>](#TypeOptionsType) - type options  

| Param | Type |
| --- | --- |
| type | <code>SipaPage.PageType</code> | 


**Example**
```js
SipaOnsenPage.typeOptions('page');
// => { prefix: 'views/pages/', file_ext: '.html' }

SipaOnsenPage.typeOptions('layout');
// => { prefix: 'views/layouts/', file_ext: '.html' }
```
<a name="SipaOnsenPage.currentPageId"></a>

### SipaOnsenPage.currentPageId() &rarr; <code>string</code> \| <code>undefined</code>
Get page id of current loaded page.

If no page is loaded, return undefined.

**Returns**: <code>string</code> \| <code>undefined</code> - page id  

**Example**
```js
// page 'HomePage' is loaded
SipaOnsenPage.currentPageId();
// => 'home'
```
<a name="SipaOnsenPage.currentPageClass"></a>

### SipaOnsenPage.currentPageClass() &rarr; <code>SipaBasicView</code> \| <code>undefined</code>
Get current page class.

If no page is loaded, return undefined.

**Example**
```js
// page with id 'home' is loaded
SipaOnsenPage.currentPageClass();
// => HomePage
```
<a name="SipaOnsenPage.currentLayoutId"></a>

### SipaOnsenPage.currentLayoutId() &rarr; <code>string</code>
Get layout id of current loaded layout.

**Example**
```js
// layout 'DefaultLayout' is loaded
SipaOnsenPage.currentLayoutId();
// => 'default-layout'
```
<a name="SipaOnsenPage.loadLayout"></a>

### SipaOnsenPage.loadLayout(layout_id, options)
Load the given layout.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| layout_id | <code>string</code> |  | to load |
| options | <code>Object</code> |  |  |
| options.fade_effect | <code>boolean</code> | <code>true</code> | fade effect on layout change |
| options.keep_page | <code>boolean</code> | <code>false</code> | keep the loaded page, but change the layout only |

<a name="SipaOnsenPage.callMethodOfPage"></a>

### SipaOnsenPage.callMethodOfPage(page_id, method_name, parameters)
Call the given method of the given page with given (optional) parameters.

| Param | Type |
| --- | --- |
| page_id | <code>string</code> | 
| method_name | <code>string</code> | 
| parameters | <code>Array</code> | 


**Example**
```js
SipaOnsenPage.callMethodOfPage('home', 'myCustomMethod', [param1, param2]);
```
<a name="SipaOnsenPage.callMethodOfLayout"></a>

### SipaOnsenPage.callMethodOfLayout(layout_id, method_name, parameters)
Call the given method of the given layout with given (optional) parameters.

| Param | Type |
| --- | --- |
| layout_id | <code>string</code> | 
| method_name | <code>string</code> | 
| parameters | <code>Array</code> | 


**Example**
```js
SipaOnsenPage.callMethodOfLayout('default-layout', 'myCustomMethod', [param1, param2]);
```
<a name="SipaOnsenPage.setConfig"></a>

### SipaOnsenPage.setConfig(config)
Set the configuration of pages and layouts.

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
<a name="SipaOnsenPage.popPage"></a>

### SipaOnsenPage.popPage(options) &rarr; <code>Promise</code>
Pop the current page from the stack.

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> |  |
| options.onsen | [<code>OnsenOptions</code>](#SipaOnsenPage.OnsenOptions) | options passed to original OnsenUI popPage |


**Example**
```js
SipaOnsenPage.load("home");
// some user interaction later

SipaOnsenPage.load("details");
// some user interaction later

SipaOnsenPage.popPage();
// now back to 'home'
```
<a name="SipaOnsenPage.addStatusBarMock"></a>

### SipaOnsenPage.addStatusBarMock()
Add a status bar mock to the app at the top.

**Example**
```js
SipaOnsenPage.addStatusBarMock();
```
<a name="SipaOnsenPage.removeStatusBarMock"></a>

### SipaOnsenPage.removeStatusBarMock()
Remove status bar mock of the app at the top if available.

**Example**
```js
SipaOnsenPage.removeStatusBarMock();
```
<a name="SipaOnsenPage._initStatusBarMock"></a>

### SipaOnsenPage.\_initStatusBarMock()
Initialize status bar mock - do NOT run before first page is loaded!
<a name="SipaOnsenPage.reset"></a>

### SipaOnsenPage.reset()
Reset all states

Useful for unit testing.
<a name="SipaOnsenPage.Config"></a>

### SipaOnsenPage.Config : <code>Object</code>
**Kind**: static typedef of [<code>SipaOnsenPage</code>](#SipaOnsenPage)  

| Param | Type |
| --- | --- |
| default_layout | <code>string</code> | 
| default_layouts | <code>Object</code> | 

<a name="SipaOnsenPage.OnsenOptions"></a>

### SipaOnsenPage.OnsenOptions : <code>Object</code>
**Kind**: static typedef of [<code>SipaOnsenPage</code>](#SipaOnsenPage)  

| Param | Type | Description |
| --- | --- | --- |
| animation | <code>&#x27;slide&#x27;</code> \| <code>&#x27;lift&#x27;</code> \| <code>&#x27;fade&#x27;</code> \| <code>&#x27;none&#x27;</code> \| <code>&#x27;slide-ios&#x27;</code> \| <code>&#x27;lift-ios&#x27;</code> \| <code>&#x27;fade-ios&#x27;</code> \| <code>&#x27;slide-md&#x27;</code> \| <code>&#x27;lift-md&#x27;</code> \| <code>&#x27;fade-md&#x27;</code> | Animation name. Available animations are "slide", "lift", "fade" and "none". These are platform based animations. For fixed animations, add "-ios" or "-md" suffix to the animation name. E.g. "lift-ios", "lift-md". Defaults values are "slide-ios" and "fade-md". |
| animationOptions | <code>Object</code> | Specify the animation’s duration, delay and timing. E.g. {duration: 0.2, delay: 0.4, timing: 'ease-in'}. |
| animationOptions.duration | <code>number</code> |  |
| animationOptions.delay | <code>number</code> |  |
| animationOptions.timing | <code>string</code> |  |
| callback | <code>function</code> | Function that is called when the transition has ended. |
| data | <code>Object</code> | Custom data that will be stored in the new page element. |
| times | <code>number</code> | Number of pages to be popped. Only one animation will be shown. Works only on popPage |
| page | <code>string</code> | Only necessary if no page is given. |
| pageHTML | <code>string</code> | HTML code that will be computed as a new page. Overwrites page parameter. |

<a name="TypeOptionsType"></a>

## TypeOptionsType : <code>Object</code>
Custom type definitions for excellent IDE auto complete support
**Properties**

| Name | Type |
| --- | --- |
| prefix | <code>string</code> | 
| file_ext | <code>string</code> | 

