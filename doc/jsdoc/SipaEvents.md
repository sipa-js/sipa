<a name="SipaEvents"></a>

## SipaEvents
SipaEventsProvides adding and triggering customized events.

* [SipaEvents](#SipaEvents)
    * [new SipaEvents(...valid_event_names)](#new_SipaEvents_new)
    * [._event_registry](#SipaEvents+_event_registry) : <code>Object.&lt;string, Array.&lt;function()&gt;&gt;</code>
    * [.subscribe(event_name, callback)](#SipaEvents+subscribe)
    * [.unsubscribe(event_name, callback)](#SipaEvents+unsubscribe)
    * [.unsubscribeAll(event_name)](#SipaEvents+unsubscribeAll)
    * [.trigger(event_name, msg, options)](#SipaEvents+trigger)
    * [.reset()](#SipaEvents+reset)
    * [.createEvents(...event_names)](#SipaEvents+createEvents)
    * [.deleteEvents(...event_names)](#SipaEvents+deleteEvents)

<a name="new_SipaEvents_new"></a>

### new SipaEvents(...valid_event_names)

| Param | Type | Description |
| --- | --- | --- |
| ...valid_event_names | <code>string</code> | define the available event names |


**Example**
```js
// To add to a class, the suggested pattern is events() {        return this._events ??= new SipaEvents(['click','delete','update']); }
```
<a name="SipaEvents+_event_registry"></a>

### sipaEvents.\_event\_registry : <code>Object.&lt;string, Array.&lt;function()&gt;&gt;</code>
Here we store registered events
<a name="SipaEvents+subscribe"></a>

### sipaEvents.subscribe(event_name, callback)
**Kind**: instance method of [<code>SipaEvents</code>](#SipaEvents)  

| Param | Type | Description |
| --- | --- | --- |
| event_name | <code>string</code> | must be one of this._valid_event_names |
| callback | <code>function</code> |  |

<a name="SipaEvents+unsubscribe"></a>

### sipaEvents.unsubscribe(event_name, callback)
**Kind**: instance method of [<code>SipaEvents</code>](#SipaEvents)  

| Param | Type |
| --- | --- |
| event_name | <code>string</code> | 
| callback | <code>function</code> | 

<a name="SipaEvents+unsubscribeAll"></a>

### sipaEvents.unsubscribeAll(event_name)
Unsubscribe all subscriptions of the given event name.Usually you should only use the unsubscribe() method to unsubscribe. Use this method with care!

| Param |
| --- |
| event_name | 

<a name="SipaEvents+trigger"></a>

### sipaEvents.trigger(event_name, msg, options)
Calls all registered events of event_name

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| event_name | <code>String</code> |  |  |
| msg | <code>Array.&lt;any&gt;</code> |  | params to pass to the created event function |
| options | <code>Object</code> |  |  |
| options.validate | <code>boolean</code> | <code>true</code> | validate the given event name to be valid |

<a name="SipaEvents+reset"></a>

### sipaEvents.reset()
Unsubscribes all subscriptions of any event
<a name="SipaEvents+createEvents"></a>

### sipaEvents.createEvents(...event_names)
Extend valid event names dynamically

| Param | Type |
| --- | --- |
| ...event_names | <code>string</code> | 

<a name="SipaEvents+deleteEvents"></a>

### sipaEvents.deleteEvents(...event_names)
Delete valid event names dynamically

| Param | Type |
| --- | --- |
| ...event_names | <code>string</code> | 

