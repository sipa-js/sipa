<a name="SipaSerializer"></a>

## SipaSerializer
Serializer to serialize data of primitive types or even complex Objects,
to ensure to be stored as valid JSON and can be deserialized back without data loss.

Includes support for
- Boolean, Number, String, Array, Object, null (native JS[SON] support)
And special type handling to support the following types
- Functions
- RegExp, Date
- NaN, Infinity, undefined
- empty (special type when deleting an item of an array)

The special types are escaped by an internal escaping when serialized.
See SipaSerializer.STORAGE_PLACEHOLDERS for the escapes.

* [SipaSerializer](#SipaSerializer)
    * [.serialize(value)](#SipaSerializer.serialize) &rarr; <code>string</code> \| <code>null</code>
    * [.deserialize(value)](#SipaSerializer.deserialize) &rarr; <code>Boolean</code> \| <code>String</code> \| <code>Number</code> \| <code>Array</code> \| <code>Object</code> \| <code>RegExp</code> \| <code>Date</code> \| <code>undefined</code> \| <code>NaN</code> \| <code>Infinity</code> \| <code>null</code> \| <code>\*</code>
    * [.isFunctionString(value)](#SipaSerializer.isFunctionString) &rarr; <code>boolean</code>
    * [.isArrayString(value)](#SipaSerializer.isArrayString) &rarr; <code>boolean</code>
    * [.isObjectString(value)](#SipaSerializer.isObjectString) &rarr; <code>boolean</code>
    * [.deserializeFunctionString(value)](#SipaSerializer.deserializeFunctionString) &rarr; <code>function</code>
    * [.deepSerializeSpecialTypes(obj)](#SipaSerializer.deepSerializeSpecialTypes) &rarr; <code>Array</code> \| <code>Object</code>
    * [.deepDeserializeSpecialTypes(obj)](#SipaSerializer.deepDeserializeSpecialTypes) &rarr; <code>Array</code> \| <code>Object</code>

<a name="SipaSerializer.serialize"></a>

### SipaSerializer.serialize(value) &rarr; <code>string</code> \| <code>null</code>
Serialize given value to be stored in JSON without loosing its original value

**Returns**: <code>string</code> \| <code>null</code> - returns string or null if value is null  

| Param | Type |
| --- | --- |
| value | <code>any</code> | 

<a name="SipaSerializer.deserialize"></a>

### SipaSerializer.deserialize(value) &rarr; <code>Boolean</code> \| <code>String</code> \| <code>Number</code> \| <code>Array</code> \| <code>Object</code> \| <code>RegExp</code> \| <code>Date</code> \| <code>undefined</code> \| <code>NaN</code> \| <code>Infinity</code> \| <code>null</code> \| <code>\*</code>
Serialize given value to be stored in JSON without loosing its original value

| Param | Type |
| --- | --- |
| value | <code>String</code> \| <code>null</code> | 

<a name="SipaSerializer.isFunctionString"></a>

### SipaSerializer.isFunctionString(value) &rarr; <code>boolean</code>
Check if given string is a valid javascript function

| Param | Type |
| --- | --- |
| value | <code>String</code> | 

<a name="SipaSerializer.isArrayString"></a>

### SipaSerializer.isArrayString(value) &rarr; <code>boolean</code>
Check if given string is a valid javascript array

| Param | Type |
| --- | --- |
| value | <code>String</code> | 

<a name="SipaSerializer.isObjectString"></a>

### SipaSerializer.isObjectString(value) &rarr; <code>boolean</code>
Check if given string is a valid javascript object

| Param | Type |
| --- | --- |
| value | <code>String</code> | 

<a name="SipaSerializer.deserializeFunctionString"></a>

### SipaSerializer.deserializeFunctionString(value) &rarr; <code>function</code>
Deserialize a valid javascript string into a callable function

| Param | Type |
| --- | --- |
| value | <code>String</code> | 

<a name="SipaSerializer.deepSerializeSpecialTypes"></a>

### SipaSerializer.deepSerializeSpecialTypes(obj) &rarr; <code>Array</code> \| <code>Object</code>
Serializes (escapes) all special types within an Array or Object
to be stored in JSON without data loss.

Original Array or Object is cloned and will not be manipulated.

| Param | Type |
| --- | --- |
| obj | <code>Array</code> \| <code>Object</code> | 

<a name="SipaSerializer.deepDeserializeSpecialTypes"></a>

### SipaSerializer.deepDeserializeSpecialTypes(obj) &rarr; <code>Array</code> \| <code>Object</code>
Deserializes (unescapes) all special types of the given Array or Object

Original Array or Object is cloned and will not be manipulated.

| Param | Type |
| --- | --- |
| obj | <code>Array</code> \| <code>Object</code> | 

