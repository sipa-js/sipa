<a name="String"></a>

## SipaHelper
SipaHelper

Tool helper class with common helper methods

* [SipaHelper](#SipaHelper)
    * [.mergeOptions(source, addition)](#SipaHelper.mergeOptions) &rarr; <code>Object</code>
    * [.isArrayContainingEmptyValue(value)](#SipaHelper.isArrayContainingEmptyValue) &rarr; <code>boolean</code>
    * [.validateParams(params)](#SipaHelper.validateParams)
    * [.throwParamError(param_name, param, expected_type)](#SipaHelper.throwParamError)
    * [.cutLeadingCharacters(text, leading_characters)](#SipaHelper.cutLeadingCharacters) &rarr; <code>string</code>
    * [.cutTrailingCharacters(text, trailing_characters)](#SipaHelper.cutTrailingCharacters) &rarr; <code>string</code>
    * [.constantizeString(constant)](#SipaHelper.constantizeString) &rarr; <code>\*</code>

<a name="SipaHelper.mergeOptions"></a>

### SipaHelper.mergeOptions(source, addition) &rarr; <code>Object</code>
Merge default options (source) with custom options (addition)

Works only fine with one level depth, don't merge nested (Object) options, as references are copied then!

**Returns**: <code>Object</code> - merged object  

| Param | Type |
| --- | --- |
| source | <code>Object</code> | 
| addition | <code>Object</code> | 


**Example**
```js
SipaHelper.mergeOptions({ a: 1, b: "two"},{b: "TWO", c: null });
// => { a: 1, b: "TWO", c: null }
```
<a name="SipaHelper.isArrayContainingEmptyValue"></a>

### SipaHelper.isArrayContainingEmptyValue(value) &rarr; <code>boolean</code>
Check if given value is an array (slice) of size 1 and contains type empty

**Returns**: <code>boolean</code> - true if a array of size 1 and contains empty => [empty], if size is 1 and not of type empty then false  
**Throws**:

- <code>Error</code> if array is not of size 1


| Param | Type |
| --- | --- |
| value | <code>any</code> | 


**Example**
```js
let arr = ["one"];
delete arr[1]:
arr;
// => [empty]
SipaHelper.isArrayContainingEmptyValue(arr);
// => true
```
<a name="SipaHelper.validateParams"></a>

### SipaHelper.validateParams(params)
Check the given parameter to be of the expected type.
If it is not valid, throw an exception.
**Throws**:

- <code>Error</code> throws an error if given parameter is not valid.


| Param | Type |
| --- | --- |
| params | [<code>Array.&lt;SipaParamValidation&gt;</code>](#SipaParamValidation) | 


**Example**
```js
function Example(param_one, other_param) {
    SipaHelper.validateParams([
        {param_name: 'param_one', param_value: param_one, expected_type: 'Object'},
        {param_name: 'other_param', param_value: other_param, expected_type: 'boolean'},
    ]);
}
Example("one",true);
// => Invalid parameter 'param_one' given. Expected type 'Object' but got type 'string'!`
```
<a name="SipaHelper.throwParamError"></a>

### SipaHelper.throwParamError(param_name, param, expected_type)
Throw an exception for invalid parameter
**Throws**:

- <code>Error</code> always throws an error


| Param | Type | Description |
| --- | --- | --- |
| param_name | <code>string</code> |  |
| param | <code>any</code> |  |
| expected_type | <code>string</code> | e.g. 'Object', 'string, 'Array', 'number', ... |


**Example**
```js
SipaHelper.throwParamError('param_one', "one", 'Object');
// => Invalid parameter 'param_one' given. Expected type 'Object' but got type 'string'!
```
<a name="SipaHelper.cutLeadingCharacters"></a>

### SipaHelper.cutLeadingCharacters(text, leading_characters) &rarr; <code>string</code>
Cut leading characters (string) from given text.
**Throws**:

- <code>Error</code> when text or leading_characters are not strings


| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | to cut |
| leading_characters | <code>string</code> | to cut from text |


**Example**
```js
.cutLeadingCharacters('/some/path/is/that','/')
 // => 'some/path/is/that'
```
<a name="SipaHelper.cutTrailingCharacters"></a>

### SipaHelper.cutTrailingCharacters(text, trailing_characters) &rarr; <code>string</code>
Cut trailing characters (string) from given text.
**Throws**:

- <code>Error</code> when text or trailing_characters are not strings


| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | to cut |
| trailing_characters | <code>string</code> | to cut from text |


**Example**
```js
.cutLeadingCharacters('/some/path/file.ext','.ext')
 // => 'some/path/file'
```
<a name="SipaHelper.constantizeString"></a>

### SipaHelper.constantizeString(constant) &rarr; <code>\*</code>
Transform the given string into its constant representation.

If the representation does not exist, an exception is thrown.
**Throws**:

- <code>Error</code> when constant does not exist or name is invalid


| Param | Type |
| --- | --- |
| constant | <code>string</code> | 


**Example**
```js
class Foo {
    static function bar() { console.log("foobar"); }
}

SipaHelper.constantizeString("Foo").bar();
// => foobar
```
<a name="SipaParamValidation"></a>

## SipaParamValidation : <code>Object</code>
Custom type definitions for excellent IDE auto complete support
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| param_value | <code>any</code> |  |
| param_name | <code>string</code> |  |
| expected_type, | <code>string</code> | e.g. 'Object', 'String, 'Array', ... |

