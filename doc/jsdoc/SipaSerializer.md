<a name="SipaSerializer"></a>

## SipaSerializer
Serializer to serialize data of primitive types or even complex Objects,
to ensure to be stored as valid JSON and can be deserialized back without data loss.

Includes support for
- Boolean, Number, String, Array, Object, null (native JS[SON] support)

And includes special type handling to support the following types:
- Functions
- RegExp, Date
- NaN, Infinity, -Infinity, undefined
- empty (special type when deleting an item of an array)

The special types are escaped by an internal escaping when serialized.
See SipaSerializer.STORAGE_PLACEHOLDERS for the escapes.

* [SipaSerializer](#SipaSerializer)
    * [.STORAGE_PLACEHOLDERS](#SipaSerializer.STORAGE_PLACEHOLDERS) : <code>Object</code>
    * [.serialize(value)](#SipaSerializer.serialize) &rarr; <code>string</code> \| <code>null</code>
    * [.deserialize(value)](#SipaSerializer.deserialize) &rarr; <code>Boolean</code> \| <code>String</code> \| <code>Number</code> \| <code>Array</code> \| <code>Object</code> \| <code>RegExp</code> \| <code>Date</code> \| <code>undefined</code> \| <code>NaN</code> \| <code>Infinity</code> \| <code>null</code> \| <code>\*</code>
    * [.isFunctionString(value)](#SipaSerializer.isFunctionString) &rarr; <code>boolean</code>
    * [.isArrayString(value)](#SipaSerializer.isArrayString) &rarr; <code>boolean</code>
    * [.isObjectString(value)](#SipaSerializer.isObjectString) &rarr; <code>boolean</code>
    * [.deserializeFunctionString(value)](#SipaSerializer.deserializeFunctionString) &rarr; <code>function</code>
    * [.deepSerializeSpecialTypes(obj)](#SipaSerializer.deepSerializeSpecialTypes) &rarr; <code>Array</code> \| <code>Object</code>
    * [.deepDeserializeSpecialTypes(obj)](#SipaSerializer.deepDeserializeSpecialTypes) &rarr; <code>Array</code> \| <code>Object</code>

<a name="SipaSerializer.STORAGE_PLACEHOLDERS"></a>

### SipaSerializer.STORAGE\_PLACEHOLDERS : <code>Object</code>
Placeholders for special types when serialized.
These placeholders are used to identify and restore the special types during deserialization.
<a name="SipaSerializer.serialize"></a>

### SipaSerializer.serialize(value) &rarr; <code>string</code> \| <code>null</code>
Serialize given value to be stored in JSON without loosing its original value.

**Returns**: <code>string</code> \| <code>null</code> - returns string or null if value is null  

| Param | Type |
| --- | --- |
| value | <code>any</code> | 


**Example**
```js
const my_example_object = {
   name: "My Object",
   created: new Date(),
   pattern: /abc/i,
   doSomething: function(a, b) { return a + b; },
   nothing: null,
   not_defined: undefined,
   not_a_number: NaN,
   infinite: Infinity,
   items: [1, 2, 3, 4]
 };

 delete my_example_object.items[2]; // create an empty entry in the array
 console.log(my_example_object.items); // [1, 2, empty, 4]


 const serialized = SipaSerializer.serialize(my_example_object);
 console.log(serialized);
 // Example output (formatted for readability):
 /*{
   "name": "My Object",
   "created": "::Date::2023-10-05T12:34:56.789Z",
   "pattern": "::RegExp::/abc/i",
   "doSomething": "function(a, b) { return a + b; }",
   "nothing": null,
   "not_defined": "::undefined::",
   "not_a_number": "::NaN::",
   "infinite": "::Infinity::",
   "items": [1, 2, "::empty::", 4]
 }* /
 // serialized is now a valid JSON string that can be stored without data loss


 const deserialized = SipaSerializer.deserialize(serialized);
 // deserialized is now a clone of my_example_object with all original values and types
 console.log(deserialized.name); // "My Object"
 console.log(deserialized.created instanceof Date); // true
 console.log(deserialized.pattern instanceof RegExp); // true
 console.log(typeof deserialized.doSomething === 'function'); // true
 console.log(deserialized.nothing === null); // true
 console.log(typeof deserialized.not_defined === 'undefined'); // true
 console.log(typeof deserialized.not_a_number === 'number' && isNaN(deserialized.not_a_number)); // true
 console.log(deserialized.infinite === Infinity); // true
 console.log(Array.isArray(deserialized.items) && deserialized.items.length === 4 && !(2 in deserialized.items)); // true, note the empty entry at index 2
```
<a name="SipaSerializer.deserialize"></a>

### SipaSerializer.deserialize(value) &rarr; <code>Boolean</code> \| <code>String</code> \| <code>Number</code> \| <code>Array</code> \| <code>Object</code> \| <code>RegExp</code> \| <code>Date</code> \| <code>undefined</code> \| <code>NaN</code> \| <code>Infinity</code> \| <code>null</code> \| <code>\*</code>
Serialize given value to be stored in JSON without loosing its original value.

| Param | Type |
| --- | --- |
| value | <code>String</code> \| <code>null</code> | 


**Example**
```js
const serialized = `{
  "name": "My Object",
  "created": "::Date::2023-10-05T12:34:56.789Z",
  "pattern": "::RegExp::/abc/i",
  "doSomething": "function(a, b) { return a + b; }",
  "nothing": null,
  "not_defined": "::undefined::",
  "not_a_number": "::NaN::",
  "infinite": "::Infinity::",
  "items": [1, 2, "::empty::", 4]
  }`;

  const deserialized = SipaSerializer.deserialize(serialized);
  // deserialized is now a clone of my_example_object with all original values and types
  console.log(deserialized); // show the full object
  {
      name: "My Object",
      created: Date, // actual Date object
      pattern: RegExp, // actual RegExp object
      doSomething: function(a, b) { return a + b; }, //
      nothing: null,
      not_defined: undefined,
      not_a_number: NaN,
      infinite: Infinity,
      items: [1, 2, empty, 4]
  }
```
<a name="SipaSerializer.isFunctionString"></a>

### SipaSerializer.isFunctionString(value) &rarr; <code>boolean</code>
Check if given string is a valid javascript function.

Note: This method does not check if the function makes sense, only if the syntax is valid.

| Param | Type |
| --- | --- |
| value | <code>String</code> | 


**Example**
```js
SipaSerializer.isFunctionString("function(a, b) { return a + b; }"); // true
SipaSerializer.isFunctionString("(a, b) => { return a + b; }"); // true
SipaSerializer.isFunctionString("a => a * 2"); // true
SipaSerializer.isFunctionString("function myFunc(a, b) { return a + b; }"); // true
SipaSerializer.isFunctionString("myFunc(a, b) { return a + b; }"); // true, function name without prefix 'function'
```
<a name="SipaSerializer.isArrayString"></a>

### SipaSerializer.isArrayString(value) &rarr; <code>boolean</code>
Check if given string is a valid javascript array.

| Param | Type |
| --- | --- |
| value | <code>String</code> | 


**Example**
```js
SipaSerializer.isArrayString("[1, 2, 3]"); // true
SipaSerializer.isArrayString("['a', 'b', 'c']"); // true
SipaSerializer.isArrayString("[true, false, null]"); // true
SipaSerializer.isArrayString("[1, [2, 3], {a: 4}]"); // true
SipaSerializer.isArrayString("{a: 1, b: 2}"); // false
SipaSerializer.isArrayString("function() {}"); // false
SipaSerializer.isArrayString("not an array"); // false
```
<a name="SipaSerializer.isObjectString"></a>

### SipaSerializer.isObjectString(value) &rarr; <code>boolean</code>
Check if given string is a valid javascript object.

| Param | Type |
| --- | --- |
| value | <code>String</code> | 


**Example**
```js
SipaSerializer.isObjectString("{a: 1, b: 2}"); // true
SipaSerializer.isObjectString("{'a': 1, 'b': 2}"); // true
SipaSerializer.isObjectString('{"a": 1, "b": 2}'); // true
SipaSerializer.isObjectString("{a: 1, b: {c: 3}}"); // true
SipaSerializer.isObjectString("[1, 2, 3]"); // false
SipaSerializer.isObjectString("function() {}"); // false
SipaSerializer.isObjectString("not an object"); // false
```
<a name="SipaSerializer.deserializeFunctionString"></a>

### SipaSerializer.deserializeFunctionString(value) &rarr; <code>function</code>
Deserialize a valid javascript string into a callable function.

| Param | Type |
| --- | --- |
| value | <code>String</code> | 


**Example**
```js
const fn1 = SipaSerializer.deserializeFunctionString("function(a, b) { return a + b; }");
console.log(fn1(2, 3)); // 5
```
<a name="SipaSerializer.deepSerializeSpecialTypes"></a>

### SipaSerializer.deepSerializeSpecialTypes(obj) &rarr; <code>Array</code> \| <code>Object</code>
Serializes (escapes) all special types within an Array or Object
to be stored in JSON without data loss.

Original Array or Object is cloned and will not be manipulated.

| Param | Type |
| --- | --- |
| obj | <code>Array</code> \| <code>Object</code> | 


**Example**
```js
const my_example_object = {
  name: "My Object",
  created: new Date(),
  pattern: /abc/i,
  doSomething: function(a, b) { return a + b; },
  nothing: null,
  not_defined: undefined,
  not_a_number: NaN,
  infinite: Infinity,
  items: [1, 2, 3, 4]
};

delete my_example_object.items[2]; // create an empty entry in the array
console.log(my_example_object.items); // [1, 2, empty, 4]

const escaped = SipaSerializer.deepSerializeSpecialTypes(my_example_object);
console.log(escaped);
{
  name: "My Object",
  created: "::Date::2023-10-05T12:34:56.789Z",
  pattern: "::RegExp::/abc/i",
  doSomething: "function(a, b) { return a + b; }",
  nothing: null,
  not_defined: "::undefined::",
  not_a_number: "::NaN::",
  infinite: "::Infinity::",
  items: [1, 2, "::empty::", 4]
}
```
<a name="SipaSerializer.deepDeserializeSpecialTypes"></a>

### SipaSerializer.deepDeserializeSpecialTypes(obj) &rarr; <code>Array</code> \| <code>Object</code>
Deserializes (unescapes) all special types of the given Array or Object.

Original Array or Object is cloned and will not be manipulated.

| Param | Type |
| --- | --- |
| obj | <code>Array</code> \| <code>Object</code> | 


**Example**
```js
const escaped = {
  name: "My Object",
  created: "::Date::2023-10-05T12:34:56.789Z",
  pattern: "::RegExp::/abc/i",
  doSomething: "function(a, b) { return a + b; }",
  nothing: null,
  not_defined: "::undefined::",
  not_a_number: "::NaN::",
  infinite: "::Infinity::",
  items: [1, 2, "::empty::", 4]
};

const deserialized = SipaSerializer.deepDeserializeSpecialTypes(escaped);
console.log(deserialized);
{
  name: "My Object",
  created: Date, // actual Date object
  pattern: RegExp, // actual RegExp object
  doSomething: function(a, b) { return a + b; }, // actual function
  nothing: null,
  not_defined: undefined,
  not_a_number: NaN,
  infinite: Infinity,
  items: [1, 2, empty, 4] // note the empty entry at index 2
}
```
