<a name="SipaOnsenHooks"></a>

## SipaOnsenHooks
SipaOnsenHooks

App hook manager

* [SipaOnsenHooks](#SipaOnsenHooks)
    * [.beforeShowPage(type, func, page_id)](#SipaOnsenHooks.beforeShowPage)
    * [.beforeHidePage(type, func, page_id)](#SipaOnsenHooks.beforeHidePage)

<a name="SipaOnsenHooks.beforeShowPage"></a>

### SipaOnsenHooks.beforeShowPage(type, func, page_id)
Set, remove or trigger event 'beforeShowPage'

| Param | Type | Description |
| --- | --- | --- |
| type | <code>SipaHooks.HookType</code> |  |
| func | <code>function</code> | function to set or remove, ignored if parameter type is 'trigger' |
| page_id | <code>string</code> |  |

<a name="SipaOnsenHooks.beforeHidePage"></a>

### SipaOnsenHooks.beforeHidePage(type, func, page_id)
Set, remove or trigger event 'beforeHidePage'

| Param | Type | Description |
| --- | --- | --- |
| type | <code>SipaHooks.HookType</code> |  |
| func | <code>function</code> | function to set or remove, ignored if parameter type is 'trigger' |
| page_id | <code>string</code> |  |

