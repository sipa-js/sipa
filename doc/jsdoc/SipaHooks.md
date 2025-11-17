<a name="SipaHooks"></a>

## SipaHooks
SipaHooks

App hook manager

* [SipaHooks](#SipaHooks)
    * [.beforeInitPage(type, func, page_id)](#SipaHooks.beforeInitPage)
    * [.beforeShowPage(type, func, page_id)](#SipaHooks.beforeShowPage)
    * [.beforeDestroyPage(type, func, page_id)](#SipaHooks.beforeDestroyPage)
    * [.beforeInitLayout(type, func, layout_id)](#SipaHooks.beforeInitLayout)
    * [.beforeDestroyLayout(type, func, layout_id)](#SipaHooks.beforeDestroyLayout)
    * [.reset()](#SipaHooks.reset)
    * [.HookType](#SipaHooks.HookType) : <code>&#x27;on&#x27;</code> \| <code>&#x27;off&#x27;</code> \| <code>&#x27;trigger&#x27;</code>

<a name="SipaHooks.beforeInitPage"></a>

### SipaHooks.beforeInitPage(type, func, page_id)
Set, remove or trigger event 'beforeInitPage'

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>HookType</code>](#SipaHooks.HookType) |  |
| func | <code>function</code> | function to set or remove, ignored if parameter type is 'trigger' |
| page_id | <code>string</code> |  |


**Example**
```js
SipaHooks.beforeInitPage('on', () => {
    console.log("This is run before onInit() of any page is executed!");
});
```
<a name="SipaHooks.beforeShowPage"></a>

### SipaHooks.beforeShowPage(type, func, page_id)
Set, remove or trigger event 'beforeShowPage'.

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>HookType</code>](#SipaHooks.HookType) |  |
| func | <code>function</code> | function to set or remove, ignored if parameter type is 'trigger' |
| page_id | <code>string</code> |  |


**Example**
```js
SipaHooks.beforeShowPage('on', () => {
  console.log("This is run before onShow() of any page is executed!");
});
```
<a name="SipaHooks.beforeDestroyPage"></a>

### SipaHooks.beforeDestroyPage(type, func, page_id)
Set, remove or trigger event 'beforeDestroyPage'.

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>HookType</code>](#SipaHooks.HookType) |  |
| func | <code>function</code> | function to set or remove, ignored if parameter type is 'trigger' |
| page_id | <code>string</code> |  |


**Example**
```js
SipaHooks.beforeDestroyPage('on', () => {
    console.log("This is run before onDestroy() of any page is executed!");
});
```
<a name="SipaHooks.beforeInitLayout"></a>

### SipaHooks.beforeInitLayout(type, func, layout_id)
Set, remove or trigger event 'beforeInitLayout'.

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>HookType</code>](#SipaHooks.HookType) |  |
| func | <code>function</code> | function to set or remove, ignored if parameter type is 'trigger' |
| layout_id | <code>string</code> |  |


**Example**
```js
SipaHooks.beforeInitLayout('on', () => {
    console.log("This is run before onInit() of any layout is executed!");
});
```
<a name="SipaHooks.beforeDestroyLayout"></a>

### SipaHooks.beforeDestroyLayout(type, func, layout_id)
Set, remove or trigger event 'beforeDestroyLayout'.

| Param | Type | Description |
| --- | --- | --- |
| type | [<code>HookType</code>](#SipaHooks.HookType) |  |
| func | <code>function</code> | function to set or remove, ignored if parameter type is 'trigger' |
| layout_id | <code>string</code> |  |


**Example**
```js
SipaHooks.beforeDestroyLayout('on', () => {
    console.log("This is run before onDestroy() of any layout is executed!");
});
```
<a name="SipaHooks.reset"></a>

### SipaHooks.reset()
Reset all hooks
<a name="SipaHooks.HookType"></a>

### SipaHooks.HookType : <code>&#x27;on&#x27;</code> \| <code>&#x27;off&#x27;</code> \| <code>&#x27;trigger&#x27;</code>
**Kind**: static typedef of [<code>SipaHooks</code>](#SipaHooks)  
