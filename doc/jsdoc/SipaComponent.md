<a name="String"></a>

## SipaComponent
Easy but powerful component class implementation to create your reusable components

* [SipaComponent](#SipaComponent)
    * [new SipaComponent(data, options)](#new_SipaComponent_new)
    * _instance_
        * [.html()](#SipaComponent+html) &rarr; <code>string</code>
        * [.node()](#SipaComponent+node) &rarr; <code>Element</code>
        * [.append(query_selector)](#SipaComponent+append) &rarr; [<code>SipaComponent</code>](#SipaComponent)
        * [.prepend(query_selector)](#SipaComponent+prepend) &rarr; [<code>SipaComponent</code>](#SipaComponent)
        * [.data()](#SipaComponent+data) &rarr; <code>Object</code>
        * [.resetData(data)](#SipaComponent+resetData) &rarr; [<code>SipaComponent</code>](#SipaComponent)
        * [.value()](#SipaComponent+value)
        * [.element()](#SipaComponent+element) &rarr; <code>Element</code> \| <code>undefined</code>
        * [.elements()](#SipaComponent+elements) &rarr; <code>Array.&lt;Element&gt;</code> \| <code>undefined</code>
        * [.selector()](#SipaComponent+selector) &rarr; <code>string</code>
        * [.destroy(options)](#SipaComponent+destroy) &rarr; [<code>SipaComponent</code>](#SipaComponent)
        * [.isDestroyed()](#SipaComponent+isDestroyed) &rarr; <code>boolean</code>
        * [.remove()](#SipaComponent+remove) &rarr; [<code>SipaComponent</code>](#SipaComponent)
        * [.update(data, options)](#SipaComponent+update) &rarr; [<code>SipaComponent</code>](#SipaComponent)
        * [.addClass(class_name, options)](#SipaComponent+addClass) &rarr; [<code>SipaComponent</code>](#SipaComponent)
        * [.hasClass(class_name)](#SipaComponent+hasClass) &rarr; <code>boolean</code>
        * [.removeClass(class_name, options)](#SipaComponent+removeClass) &rarr; [<code>SipaComponent</code>](#SipaComponent)
        * [.show(options)](#SipaComponent+show) &rarr; [<code>SipaComponent</code>](#SipaComponent)
        * [.hide(options)](#SipaComponent+hide) &rarr; [<code>SipaComponent</code>](#SipaComponent)
        * [.isHidden()](#SipaComponent+isHidden) &rarr; <code>boolean</code>
        * [.isVisible()](#SipaComponent+isVisible) &rarr; <code>boolean</code>
        * [.children()](#SipaComponent+children) &rarr; <code>Object.&lt;string, SipaComponent&gt;</code>
        * [.childrenAliases()](#SipaComponent+childrenAliases) &rarr; <code>Array.&lt;string&gt;</code>
        * [.hasChildren()](#SipaComponent+hasChildren) &rarr; <code>boolean</code>
        * [.parent()](#SipaComponent+parent) &rarr; <code>undefined</code> \| [<code>SipaComponent</code>](#SipaComponent)
        * [.hasParent()](#SipaComponent+hasParent) &rarr; <code>boolean</code>
        * [.parentTop()](#SipaComponent+parentTop) &rarr; [<code>SipaComponent</code>](#SipaComponent)
    * _static_
        * [.all(options)](#SipaComponent.all) &rarr; <code>\*</code> \| <code>function</code>
        * [.bySipaId(sipa_id)](#SipaComponent.bySipaId) &rarr; <code>undefined</code> \| [<code>SipaComponent</code>](#SipaComponent)
        * [.destroyAll()](#SipaComponent.destroyAll)
        * [.init(css_selector)](#SipaComponent.init) &rarr; [<code>Array.&lt;SipaComponent&gt;</code>](#SipaComponent)
        * [.initElement(element, options)](#SipaComponent.initElement) &rarr; [<code>SipaComponent</code>](#SipaComponent)
        * [.initChildComponents(component)](#SipaComponent.initChildComponents) &rarr; <code>Element</code>
        * [.tagName()](#SipaComponent.tagName) &rarr; <code>string</code>
        * [.instanceOfElement(element)](#SipaComponent.instanceOfElement) &rarr; [<code>SipaComponent</code>](#SipaComponent)
        * [.registerComponent(component)](#SipaComponent.registerComponent)
        * [.template()](#SipaComponent.template) &rarr; <code>string</code>
        * [.Meta](#SipaComponent.Meta) : <code>Object</code>
        * [.Data](#SipaComponent.Data) : <code>Object</code>
        * [.Options](#SipaComponent.Options) : <code>Object</code>

<a name="new_SipaComponent_new"></a>

### new SipaComponent(data, options)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object.&lt;String, \*&gt;</code> |  | object of properties |
| options | <code>Object</code> |  |  |
| options.sipa_hidden | <code>boolean</code> | <code>false</code> | initial visibility state |
| options.sipa_classes | <code>string</code> |  | additional classes for component tag |
| options.sipa_custom_attributes | <code>Object.&lt;string, string&gt;</code> |  | additional custom attributes on the component tag |


**Example**
```js
const component = new SipaComponent({
         name: "Foo",
         age: 45,
     }, {
         sipa_hidden: true,
         sipa_classes: "dark-style",
         sipa_custom_attributes: {
             id: "special-instance",
             disabled: "disabled",
             onclick: "alert('hello world!')",
             style: "color: red;"
         }
     });
```
<a name="SipaComponent+html"></a>

### sipaComponent.html() &rarr; <code>string</code>
**Kind**: instance method of [<code>SipaComponent</code>](#SipaComponent)  

**Returns**: <code>string</code> - rendered HTML template() with current values of data  
<a name="SipaComponent+node"></a>

### sipaComponent.node() &rarr; <code>Element</code>
**Kind**: instance method of [<code>SipaComponent</code>](#SipaComponent)  

**Returns**: <code>Element</code> - element representation of html()  
<a name="SipaComponent+append"></a>

### sipaComponent.append(query_selector) &rarr; [<code>SipaComponent</code>](#SipaComponent)
Create a DOM node of the instance and append it to the given css query selector

| Param | Type |
| --- | --- |
| query_selector | <code>string</code> | 

<a name="SipaComponent+prepend"></a>

### sipaComponent.prepend(query_selector) &rarr; [<code>SipaComponent</code>](#SipaComponent)
Create a DOM node of the instance and prepend it to the given css query selector

| Param | Type |
| --- | --- |
| query_selector | <code>string</code> | 

<a name="SipaComponent+data"></a>

### sipaComponent.data() &rarr; <code>Object</code>
Get cloned data of the current instance
<a name="SipaComponent+resetData"></a>

### sipaComponent.resetData(data) &rarr; [<code>SipaComponent</code>](#SipaComponent)
Set cloned data of the current instance

| Param | Type |
| --- | --- |
| data | <code>Object</code> | 

<a name="SipaComponent+value"></a>

### sipaComponent.value()
Value representation of the component. Should be usually overwritten by the inherited component class.
<a name="SipaComponent+element"></a>

### sipaComponent.element() &rarr; <code>Element</code> \| <code>undefined</code>
Get the (first) element of the current instance that is in the DOM
<a name="SipaComponent+elements"></a>

### sipaComponent.elements() &rarr; <code>Array.&lt;Element&gt;</code> \| <code>undefined</code>
Get all elements of the current instance that is in the DOM
<a name="SipaComponent+selector"></a>

### sipaComponent.selector() &rarr; <code>string</code>
Get the unique css selector of the current instance(s) element(s)

**Returns**: <code>string</code> - css selector  
<a name="SipaComponent+destroy"></a>

### sipaComponent.destroy(options) &rarr; [<code>SipaComponent</code>](#SipaComponent)
Destroy the components DOM representation and class data representation

| Param | Type | Default |
| --- | --- | --- |
| options | <code>Object</code> |  | 
| options.force | <code>boolean</code> | <code>false</code> | 

<a name="SipaComponent+isDestroyed"></a>

### sipaComponent.isDestroyed() &rarr; <code>boolean</code>
Check if the current instance is destroyed

**Returns**: <code>boolean</code> - true if destroyed  
<a name="SipaComponent+remove"></a>

### sipaComponent.remove() &rarr; [<code>SipaComponent</code>](#SipaComponent)
Remove the DOM representation(s), but keep the class data representation
<a name="SipaComponent+update"></a>

### sipaComponent.update(data, options) &rarr; [<code>SipaComponent</code>](#SipaComponent)
Update the data of the instance and its children by alias if available. Then rerender its view.

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | [<code>Data</code>](#SipaComponent.Data) |  |  |
| options | <code>Object</code> |  |  |
| options.render | <code>boolean</code> | <code>true</code> | rerender DOM elements after data update |
| options.reset | <code>boolean</code> | <code>false</code> | if false, merge given data with existing, otherwise reset component data to given data |


**Example**
```js
<example-component enabled="false">
    <nested-component sipa-alias="my_nest" name="'foo'"></nested-component>
    <other-nested-component sipa-alias="other" age="77"></nested-component>
</example-component>

const my_instance = new ExampleComponent();

my_instance.update({
    enabled: true,
    my_nest: {
        name: "bar",
    },
    other: {
        age: 111,
    }
});
```
<a name="SipaComponent+addClass"></a>

### sipaComponent.addClass(class_name, options) &rarr; [<code>SipaComponent</code>](#SipaComponent)
Add given class to the current instance tag element and store its state

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| class_name | <code>string</code> |  | one or more classes separated by space |
| options | <code>Object</code> |  |  |
| options.update | <code>boolean</code> | <code>true</code> | rerender current instance DOM with new class |

<a name="SipaComponent+hasClass"></a>

### sipaComponent.hasClass(class_name) &rarr; <code>boolean</code>
Check if current component instance has given class(es) in its class state

**Returns**: <code>boolean</code> - true if class is set  

| Param | Description |
| --- | --- |
| class_name | one or more classes that must be included |


**Example**
```js
<example-component class="test bingo">Example</example-component>

const my_instance = new ExampleComponent();

my_instance.hasClass("test");
// => true
my_instance.hasClass("bingo test");
// => true
my_instance.hasClass("test togo");
// => false
```
<a name="SipaComponent+removeClass"></a>

### sipaComponent.removeClass(class_name, options) &rarr; [<code>SipaComponent</code>](#SipaComponent)
Remove given class from the current instance tag element and its state

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| class_name | <code>string</code> |  | one or more classes separated by space |
| options | <code>Object</code> |  |  |
| options.update | <code>boolean</code> | <code>true</code> | rerender current instance DOM without removed class |

<a name="SipaComponent+show"></a>

### sipaComponent.show(options) &rarr; [<code>SipaComponent</code>](#SipaComponent)
Show current instance

| Param | Type | Default |
| --- | --- | --- |
| options | <code>Object</code> |  | 
| options.update | <code>boolean</code> | <code>true</code> | 

<a name="SipaComponent+hide"></a>

### sipaComponent.hide(options) &rarr; [<code>SipaComponent</code>](#SipaComponent)
Hide current instance

| Param | Type | Default |
| --- | --- | --- |
| options | <code>Object</code> |  | 
| options.update | <code>boolean</code> | <code>true</code> | 

<a name="SipaComponent+isHidden"></a>

### sipaComponent.isHidden() &rarr; <code>boolean</code>
Check if current instance is hidden
<a name="SipaComponent+isVisible"></a>

### sipaComponent.isVisible() &rarr; <code>boolean</code>
Check if current instance is visible
<a name="SipaComponent+children"></a>

### sipaComponent.children() &rarr; <code>Object.&lt;string, SipaComponent&gt;</code>
Return children components of the current component with its sipa-aliases as their keys

**Returns**: <code>Object.&lt;string, SipaComponent&gt;</code> - Object<alias, component>  

**Example**
```js
<example-component>
    <nested-component sipa-alias="my_nest"></nested-component>
    <other-nested-component sipa-alias="other"></nested-component>
</example-component>

const my_instance = new ExampleComponent();

my_instance.children();
// => { my_nest: NestedComponent, other: OtherNestedComponent }
```
<a name="SipaComponent+childrenAliases"></a>

### sipaComponent.childrenAliases() &rarr; <code>Array.&lt;string&gt;</code>
Return all keys for children aliases
<a name="SipaComponent+hasChildren"></a>

### sipaComponent.hasChildren() &rarr; <code>boolean</code>
Check if the component has any children or not
<a name="SipaComponent+parent"></a>

### sipaComponent.parent() &rarr; <code>undefined</code> \| [<code>SipaComponent</code>](#SipaComponent)
Get parent component, if current component is a child component

**Returns**: <code>undefined</code> \| [<code>SipaComponent</code>](#SipaComponent) - component  
<a name="SipaComponent+hasParent"></a>

### sipaComponent.hasParent() &rarr; <code>boolean</code>
Check if the component has a parent or not
<a name="SipaComponent+parentTop"></a>

### sipaComponent.parentTop() &rarr; [<code>SipaComponent</code>](#SipaComponent)
Get the top level parent component, that has no parent component.
Will return the current component, if no parent exists.

**Returns**: [<code>SipaComponent</code>](#SipaComponent) - component  

**Example**
```js
<example-component>
    <nested-component sipa-alias="my_nest">
        <other-nested-component sipa-alias="other"></nested-component>
    </nested-component>
</example-component>

const my_instance = new ExampleComponent();

my_instance.children().my_nest.children().other.parentTop();
// => ExampleComponent
```
<a name="SipaComponent.all"></a>

### SipaComponent.all(options) &rarr; <code>\*</code> \| <code>function</code>
Return all instances of the component

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  |  |
| options.include_children | <code>boolean</code> | <code>false</code> | include embedded children components |

<a name="SipaComponent.bySipaId"></a>

### SipaComponent.bySipaId(sipa_id) &rarr; <code>undefined</code> \| [<code>SipaComponent</code>](#SipaComponent)
Get instance of current component class by sipa-id

| Param | Type |
| --- | --- |
| sipa_id | <code>number</code> | 

<a name="SipaComponent.destroyAll"></a>

### SipaComponent.destroyAll()
Destroy all instances of current component class
<a name="SipaComponent.init"></a>

### SipaComponent.init(css_selector) &rarr; [<code>Array.&lt;SipaComponent&gt;</code>](#SipaComponent)
Initialize all uninitialized components of the current component class in the DOM inside the given css selector automatically.

| Param | Type | Default |
| --- | --- | --- |
| css_selector | <code>string</code> | <code>&quot;&#x27;body&#x27;&quot;</code> | 

<a name="SipaComponent.initElement"></a>

### SipaComponent.initElement(element, options) &rarr; [<code>SipaComponent</code>](#SipaComponent)
Init given element as the current component class

**Returns**: [<code>SipaComponent</code>](#SipaComponent) - component instance  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>Element</code> |  |
| options | <code>Object</code> |  |
| options.sipa_component | [<code>SipaComponent</code>](#SipaComponent) | if given, reinit given component instance |
| options.parent_data | <code>Object</code> | data of parent element, if this is a child |

<a name="SipaComponent.initChildComponents"></a>

### SipaComponent.initChildComponents(component) &rarr; <code>Element</code>
Init child components of the given component if available

| Param | Type |
| --- | --- |
| component | [<code>SipaComponent</code>](#SipaComponent) | 

<a name="SipaComponent.tagName"></a>

### SipaComponent.tagName() &rarr; <code>string</code>
Get tag name of current component class

**Example**
```js
<example-component>blub</example-component>

const my_instance = new ExampleComponent();

my_instance.tagName();
// => "example-component"
```
<a name="SipaComponent.instanceOfElement"></a>

### SipaComponent.instanceOfElement(element) &rarr; [<code>SipaComponent</code>](#SipaComponent)
Get the component instance of the given element or one of its parent

| Param | Type |
| --- | --- |
| element | <code>HTMLElement</code> | 


**Example**
```js
<example-component sipa-id="1">
    <nested-component sipa-id="2">
        <span id="nested_span">nested</span>
    </nested-component>
    <span id="top_span">top</span>
</example-component>

const nested_span = document.getElementById("nested_span");
SipaComponent.instanceOfElement(nested_span);
// => NestedComponent

const top_span = document.getElementById("top_span");
SipaComponent.instanceOfElement(top_span);
// => ExampleComponent
```
<a name="SipaComponent.registerComponent"></a>

### SipaComponent.registerComponent(component)
Register given component class.

You need to register every new component that extends by SipaComponent to make it available.

| Param | Type |
| --- | --- |
| component | [<code>SipaComponent</code>](#SipaComponent) | 


**Example**
```js
class MyComponent extends SipaComponent {
    ...
}

SipaComponent.registerComponent(MyComponent);
```
<a name="SipaComponent.template"></a>

### SipaComponent.template() &rarr; <code>string</code>
Returns the template. Can be with embedded with EJS.

**Example**
```js
class MyComponent extends SipaComponent {
  ...
}

MyComponent.template = () => {
    return `
<my-component>
    Hello <%= name %>!
    <% if(age > 77) { %>
        <br>You are very old!
    <% } %>
</my-component>
    `;
}
```
<a name="SipaComponent.Meta"></a>

### SipaComponent.Meta : <code>Object</code>
**Kind**: static typedef of [<code>SipaComponent</code>](#SipaComponent)  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| sipa_id | <code>number</code> |  | auto increment |
| sipa_classes | <code>string</code> |  | internal state representation for classes managed by components methods addClass() and removeClass() |
| sipa_hidden | <code>boolean</code> | <code>false</code> | state representation of hide() and show() methods |
| sipa_alias | <code>string</code> |  | alias to access children by uniq accessor name |
| sipa_children | [<code>Array.&lt;SipaComponent&gt;</code>](#SipaComponent) |  | array of children sipa components |
| sipa_parent | [<code>SipaComponent</code>](#SipaComponent) |  | parent sipa component when using nested components |
| sipa_original_display | <code>string</code> |  | store original display style when using hide() to restore on show() |
| sipa_changed_visibility | <code>boolean</code> |  | info if visibility has been changed at least once |
| sipa_custom_attributes | <code>Object.&lt;string, string&gt;</code> |  | state representation of declarative custom attributes defined with attr- prefix |

<a name="SipaComponent.Data"></a>

### SipaComponent.Data : <code>Object</code>
**Kind**: static typedef of [<code>SipaComponent</code>](#SipaComponent)  
<a name="SipaComponent.Options"></a>

### SipaComponent.Options : <code>Object</code>
**Kind**: static typedef of [<code>SipaComponent</code>](#SipaComponent)  
**Properties**

| Name | Type | Default |
| --- | --- | --- |
| update_view_only_when_visible | <code>boolean</code> | <code>false</code> | 

<a name="SipaComponent."></a>

## SipaComponent.(html) &rarr; <code>ChildNode</code>
Parse Html string to element and return the first element of the string

| Param |
| --- |
| html | 

<a name="SipaComponent."></a>

## SipaComponent.() &rarr; <code>number</code>
Generate unique component id (auto increment)
<a name="instance"></a>

## instance(element) &rarr; [<code>SipaComponent</code>](#SipaComponent)
Get instance of current component. For usage in component templates

Handy shortcut alias for SipaComponent.instanceOfElement().

| Param | Type |
| --- | --- |
| element | <code>Element</code> | 


**Example**
```js
class MyComponent extends SipaComponent {
  dance() {
  }
}

class SuperComponent extends SipaComponent {
    superMan() {
    }
}

MyComponent.template = () => {
    return `
<my-component onclick="instance(this).dance();" onblur="instance(this).children().supp.superMan();">
    Hello <%= name %>!
    <super-component sipa-alias="supp" attr-onclick="instance(this).superMan();" attr-onblur="instance(this).parent().dance();"></super-component>
</my-component>
    `;
}
```
