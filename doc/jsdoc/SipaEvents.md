<a name="SipaEvents"></a>

## SipaEvents
SipaEvents

The SipaEvents class provides a simple event system where you can define valid event names,
subscribe to events with callback functions, unsubscribe from events, and trigger events with optional parameters.

Typical use cases are:
- A component wants to notify other components or business logic about changes.
- A component wants to react on changes of other components.
- A component wants to provide hooks for business logic.

A typical way, to integrate SipaEvents in your class is to provide an events() method that returns an instance
of SipaEvents as shown in the example below.

The amount of params is not limited. You can pass as many params as you want to the callback function.

* [SipaEvents](#SipaEvents)
    * [new SipaEvents([...valid_event_names])](#new_SipaEvents_new)
    * [.subscribe(event_name, callback)](#SipaEvents+subscribe)
    * [.unsubscribe(event_name, callback)](#SipaEvents+unsubscribe)
    * [.unsubscribeAll(event_name)](#SipaEvents+unsubscribeAll)
    * [.trigger(event_name, [msg], [options])](#SipaEvents+trigger)
    * [.reset()](#SipaEvents+reset)
    * [.createEvents(...event_names)](#SipaEvents+createEvents)
    * [.deleteEvents(...event_names)](#SipaEvents+deleteEvents)
    * [.getValidEventNames()](#SipaEvents+getValidEventNames) &rarr; <code>Array.&lt;string&gt;</code>

<a name="new_SipaEvents_new"></a>

### new SipaEvents([...valid_event_names])
Create a new SipaEvents instance with the given valid event names.

Valid element names ensure that only known events are used and will otherwise throw an error.


| Param | Type | Description |
| --- | --- | --- |
| [...valid_event_names] | <code>string</code> | define the available, valid event names |


**Example**
```js
// To extend a class with events, the suggested pattern is the following, directly defining the valid event names at initialization:
 class MyClass {
   // ...

   events() {
          return this._events ??= new SipaEvents(['click','delete','update']);
   }

   onClick() {
          this.events().trigger('click', [param1, param2, param3, ...], options);
   }
 }

 m = new MyClass();
 m.events().subscribe('click', (param1, param2, param3, ...) => {
     console.log("There was a click on my class ...");
 });
```
<a name="SipaEvents+subscribe"></a>

### sipaEvents.subscribe(event_name, callback)
Subscribe to an event with a callback function.
**Throws**:

- <code>Error</code> when event_name is not valid


| Param | Type | Description |
| --- | --- | --- |
| event_name | <code>string</code> | must be one of this._valid_event_names |
| callback | <code>function</code> |  |


**Example**
```js
my_sipa_events.subscribe('click', (param1, param2, param3, ...) => {
    console.log("There was a click on my class ...");
    // do something with param1, param2, param3, ...
});
```
<a name="SipaEvents+unsubscribe"></a>

### sipaEvents.unsubscribe(event_name, callback)
Unsubscribe from an event that has been subscribed before.

The callback function must be the same function reference as used in subscribe().
**Throws**:

- <code>Error</code> when event_name is not valid


| Param | Type |
| --- | --- |
| event_name | <code>string</code> | 
| callback | <code>function</code> | 


**Example**
```js
my_sipa_events.unsubscribe('click', my_callback_function);
```
<a name="SipaEvents+unsubscribeAll"></a>

### sipaEvents.unsubscribeAll(event_name)
Unsubscribe all subscriptions of the given event name.

Usually you should only use the unsubscribe() method to unsubscribe. Use this method with care!
**Throws**:

- <code>Error</code> when event_name is not valid


| Param | Type |
| --- | --- |
| event_name | <code>string</code> | 


**Example**
```js
my_sipa_events.unsubscribeAll('click');
```
<a name="SipaEvents+trigger"></a>

### sipaEvents.trigger(event_name, [msg], [options])
Trigger all registered events of event_name to be called with the given params.
**Throws**:

- <code>Error</code> when event_name is not valid


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| event_name | <code>String</code> |  |  |
| [msg] | <code>Array.&lt;any&gt;</code> | <code>[]</code> | params to pass to the created event function |
| [options] | <code>Object</code> |  |  |
| [options.validate] | <code>boolean</code> | <code>true</code> | validate the given event name to be valid. Can make sense to disable this when the registration might happen later, or you have optional subscribers. |


**Example**
```js
my_sipa_events.trigger('click', [param1, param2, param3, ...], { validate: true });
```
<a name="SipaEvents+reset"></a>

### sipaEvents.reset()
Unsubscribes all subscriptions of any event.

This will reset the event registry to an empty state.
<a name="SipaEvents+createEvents"></a>

### sipaEvents.createEvents(...event_names)
Extend valid event names dynamically.

Valid element names ensure that only known events are used and will otherwise throw an error.

| Param | Type |
| --- | --- |
| ...event_names | <code>string</code> | 


**Example**
```js
// add some new event valid names
my_sipa_events.createEvents("turn_on","some_other_event");
```
<a name="SipaEvents+deleteEvents"></a>

### sipaEvents.deleteEvents(...event_names)
Delete valid event names dynamically

| Param | Type |
| --- | --- |
| ...event_names | <code>string</code> | 


**Example**
```js
// delete some event valid names
my_sipa_events.deleteEvents("turn_on","some_other_event");
```
<a name="SipaEvents+getValidEventNames"></a>

### sipaEvents.getValidEventNames() &rarr; <code>Array.&lt;string&gt;</code>
Get all valid (registered) event names.

**Example**
```js
my_sipa_events.getValidEventNames();
// returns ['click','delete','update']
```
