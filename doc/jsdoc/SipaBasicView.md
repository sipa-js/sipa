<a name="SipaBasicView"></a>

## SipaBasicView
Basic class for pages and layouts

* [SipaBasicView](#SipaBasicView)
    * [.isLoaded()](#SipaBasicView.isLoaded) &rarr; <code>boolean</code>
    * [.className()](#SipaBasicView.className) &rarr; <code>string</code>
    * [.type()](#SipaBasicView.type) &rarr; <code>&#x27;page&#x27;</code> \| <code>&#x27;layout&#x27;</code>

<a name="SipaBasicView.isLoaded"></a>

### SipaBasicView.isLoaded() &rarr; <code>boolean</code>
Check if the current view is loaded

**Example**
```js
// ImprintPage is loadedLoginPage.isLoaded();// => false
```
<a name="SipaBasicView.className"></a>

### SipaBasicView.className() &rarr; <code>string</code>
Get the class name of the current view

**Example**
```js
class MyPage extends SipaBasicView {}const a = MyPage;a.className()// => 'MyPage'
```
<a name="SipaBasicView.type"></a>

### SipaBasicView.type() &rarr; <code>&#x27;page&#x27;</code> \| <code>&#x27;layout&#x27;</code>
Get the type of the current view

**Example**
```js
class MyLayout extends SipaBasicView {}MyLayout.type()// => 'layout'
```
