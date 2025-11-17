<a name="SipaOnsenHooks"></a>

## SipaOnsenHooks
SipaOnsenHooks

App hook manager extending SipaHooks with additional hooks for OnsenUI (mobile).

* [SipaOnsenHooks](#SipaOnsenHooks)
    * [.beforeShowPage(type, func, page_id)](#SipaOnsenHooks.beforeShowPage)
    * [.beforeHidePage(type, func, page_id)](#SipaOnsenHooks.beforeHidePage)

<a name="SipaOnsenHooks.beforeShowPage"></a>

### SipaOnsenHooks.beforeShowPage(type, func, page_id)
Set, remove or trigger event 'beforeShowPage'.

| Param | Type | Description |
| --- | --- | --- |
| type | <code>SipaHooks.HookType</code> |  |
| func | <code>function</code> | function to set or remove, ignored if parameter type is 'trigger' |
| page_id | <code>string</code> |  |


**Example**
```js
SipaOnsenHooks.beforeShowPage('on', () => {
  console.log("This is run before onShow() of any page is executed!");
});
```
<a name="SipaOnsenHooks.beforeHidePage"></a>

### SipaOnsenHooks.beforeHidePage(type, func, page_id)
Set, remove or trigger event 'beforeHidePage'.

| Param | Type | Description |
| --- | --- | --- |
| type | <code>SipaHooks.HookType</code> |  |
| func | <code>function</code> | function to set or remove, ignored if parameter type is 'trigger' |
| page_id | <code>string</code> |  |


**Example**
```js
SipaOnsenHooks.beforeHidePage('on', () => {
 console.log("This is run before onHide() of any page is executed!");
});
```
