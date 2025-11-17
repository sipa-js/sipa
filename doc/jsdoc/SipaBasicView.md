<a name="SipaBasicView"></a>

## SipaBasicView
Basic class for pages and layouts

* [SipaBasicView](#SipaBasicView)
    * [.onInit()](#SipaBasicView.onInit)
    * [.onDestroy()](#SipaBasicView.onDestroy)
    * [.reinit()](#SipaBasicView.reinit)
    * [.isLoaded()](#SipaBasicView.isLoaded) &rarr; <code>boolean</code>
    * [.className()](#SipaBasicView.className) &rarr; <code>string</code>
    * [.type()](#SipaBasicView.type) &rarr; <code>&#x27;page&#x27;</code> \| <code>&#x27;layout&#x27;</code>

<a name="SipaBasicView.onInit"></a>

### SipaBasicView.onInit()
Called when the view is initialized

**Example**
```js
class MyPage extends SipaBasicView {
  static onInit() {
    console.log("MyPage initialized");
  }
}

SipaPage.load('my-page');
// => "MyPage initialized"
```
<a name="SipaBasicView.onDestroy"></a>

### SipaBasicView.onDestroy()
Called when the view is destroyed, when leaving the page.

**Example**
```js
class MyPage extends SipaBasicView {
  static onDestroy() {
    console.log("MyPage destroyed");
  }
}

SipaPage.load('my-page');
// => "MyPage initialized"
SipaPage.load('another-page');
// => "MyPage destroyed"
```
<a name="SipaBasicView.reinit"></a>

### SipaBasicView.reinit()
Shortcut to reinitialize the view (calls onDestroy and onInit)
<a name="SipaBasicView.isLoaded"></a>

### SipaBasicView.isLoaded() &rarr; <code>boolean</code>
Check if the current view is loaded

**Example**
```js
// Given ImprintPage is loaded
LoginPage.isLoaded();
// => false
```
<a name="SipaBasicView.className"></a>

### SipaBasicView.className() &rarr; <code>string</code>
Get the class name of the current view

**Example**
```js
class MyPage extends SipaBasicView {
}

const a = MyPage;
a.className()
// => 'MyPage'
```
<a name="SipaBasicView.type"></a>

### SipaBasicView.type() &rarr; <code>&#x27;page&#x27;</code> \| <code>&#x27;layout&#x27;</code>
Get the type of the current view

**Example**
```js
class MyLayout extends SipaBasicView {
}

MyLayout.type()
// => 'layout'
```

**Example**
```js
class MyPage extends SipaBasicView {
}

MyPage.type()
// => 'page'
```
