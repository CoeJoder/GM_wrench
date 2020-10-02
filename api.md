<a name="UserscriptUtils"></a>

## UserscriptUtils
A collection of common utilities for implementing userscripts.  Some methods are adapted from the

**Kind**: global class  

* [UserscriptUtils](#UserscriptUtils)
    * [new UserscriptUtils()](#new_UserscriptUtils_new)
    * [.sleep(ms)](#UserscriptUtils+sleep) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.addCss(css)](#UserscriptUtils+addCss)
    * [.addStylesheet(href)](#UserscriptUtils+addStylesheet)
    * [.waitForKeyElements(selectorOrFunction, callback, [waitOnce], [interval], [maxIntervals])](#UserscriptUtils+waitForKeyElements)

<a name="new_UserscriptUtils_new"></a>

### new UserscriptUtils()
Constructor.

<a name="UserscriptUtils+sleep"></a>

### userscriptUtils.sleep(ms) ⇒ <code>Promise.&lt;void&gt;</code>
Sleep for the given amount of time.

**Kind**: instance method of [<code>UserscriptUtils</code>](#UserscriptUtils)  
**Returns**: <code>Promise.&lt;void&gt;</code> - A promise that will be resolved when the sleep has finished.  
**See**: [webdriver.sleep](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html#sleep)  

| Param | Type | Description |
| --- | --- | --- |
| ms | <code>number</code> | The amount of time, in milliseconds, to sleep. |

**Example**  
```js
await userscriptUtils.sleep(2000);
```
<a name="UserscriptUtils+addCss"></a>

### userscriptUtils.addCss(css)
Add a new `<style>` with the given text to the `<head>`.

**Kind**: instance method of [<code>UserscriptUtils</code>](#UserscriptUtils)  

| Param | Type | Description |
| --- | --- | --- |
| css | <code>string</code> | The CSS rules to add. |

**Example**  
```js
userscriptUtils.addCss(`
```
<a name="UserscriptUtils+addStylesheet"></a>

### userscriptUtils.addStylesheet(href)
Add a new stylesheet `<link>` to the `<head>`.

**Kind**: instance method of [<code>UserscriptUtils</code>](#UserscriptUtils)  

| Param | Type | Description |
| --- | --- | --- |
| href | <code>string</code> | The URL of the stylesheet. |

**Example**  
```js
userscriptUtils.addStylesheet('https://fonts.googleapis.com/css?family=Open+Sans');
```
<a name="UserscriptUtils+waitForKeyElements"></a>

### userscriptUtils.waitForKeyElements(selectorOrFunction, callback, [waitOnce], [interval], [maxIntervals])
Detect and handle AJAXed content.

**Kind**: instance method of [<code>UserscriptUtils</code>](#UserscriptUtils)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| selectorOrFunction | <code>string</code> \| <code>function</code> |  | The selector string or function. |
| callback | <code>function</code> |  | The callback function; takes a single DOM element as parameter.                                               If returns true, element will be processed again on subsequent iterations. |
| [waitOnce] | <code>boolean</code> | <code>true</code> | Whether to stop after the first elements are found. |
| [interval] | <code>number</code> | <code>300</code> | The time (ms) to wait between iterations. |
| [maxIntervals] | <code>number</code> | <code>-1</code> | The max number of intervals to run (negative number for unlimited). |

**Example**  
```js
userscriptUtils.waitForKeyElements("div.comments", (element) => {
```