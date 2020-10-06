<a name="GM_wrench"></a>

## GM\_wrench
A collection of common utilities for implementing userscripts.  Some methods are adapted from the[selenium-webdriver](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/) project.

**Kind**: global variable  

* [GM_wrench](#GM_wrench)
    * [.sleep(ms)](#GM_wrench.sleep) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.addCss(css)](#GM_wrench.addCss)
    * [.addStylesheet(href)](#GM_wrench.addStylesheet)
    * [.wait()](#GM_wrench.wait)
    * [.waitForKeyElements(selectorOrFunction, callback, [waitOnce], [interval], [maxIntervals])](#GM_wrench.waitForKeyElements)
    * [.innerTypes](#GM_wrench.innerTypes) : <code>object</code>
        * [.Condition](#GM_wrench.innerTypes.Condition)
            * [new Condition(message, fn)](#new_GM_wrench.innerTypes.Condition_new)
            * [.description()](#GM_wrench.innerTypes.Condition+description) ⇒ <code>string</code>
        * [.HTMLElementCondition](#GM_wrench.innerTypes.HTMLElementCondition) ⇐ <code>Condition&lt;!(HTMLElement\|Promise&lt;!HTMLElement&gt;)&gt;</code>
            * [new HTMLElementCondition(message, fn)](#new_GM_wrench.innerTypes.HTMLElementCondition_new)
        * [.Error](#GM_wrench.innerTypes.Error) ⇐ <code>Error</code>
            * [new Error([opt_error])](#new_GM_wrench.innerTypes.Error_new)
        * [.TimeoutError](#GM_wrench.innerTypes.TimeoutError) ⇐ <code>Error</code>
            * [new TimeoutError([opt_error])](#new_GM_wrench.innerTypes.TimeoutError_new)

<a name="GM_wrench.sleep"></a>

### GM_wrench.sleep(ms) ⇒ <code>Promise.&lt;void&gt;</code>
Sleep for the given amount of time.

**Kind**: static method of [<code>GM\_wrench</code>](#GM_wrench)  
**Returns**: <code>Promise.&lt;void&gt;</code> - A promise that will be resolved when the sleep has finished.  
**See**: [webdriver.sleep](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html#sleep)  

| Param | Type | Description |
| --- | --- | --- |
| ms | <code>number</code> | The amount of time, in milliseconds, to sleep. |

**Example**  
```js
await GM_wrench.sleep(2000);
```
<a name="GM_wrench.addCss"></a>

### GM_wrench.addCss(css)
Add a new `<style>` with the given text to the `<head>`.

**Kind**: static method of [<code>GM\_wrench</code>](#GM_wrench)  

| Param | Type | Description |
| --- | --- | --- |
| css | <code>string</code> | The CSS rules to add. |

**Example**  
```js
GM_wrench.addCss(`    p {        height: 50px;    }`);
```
<a name="GM_wrench.addStylesheet"></a>

### GM_wrench.addStylesheet(href)
Add a new stylesheet `<link>` to the `<head>`.

**Kind**: static method of [<code>GM\_wrench</code>](#GM_wrench)  

| Param | Type | Description |
| --- | --- | --- |
| href | <code>string</code> | The URL of the stylesheet. |

**Example**  
```js
GM_wrench.addStylesheet('https://fonts.googleapis.com/css?family=Open+Sans');
```
<a name="GM_wrench.wait"></a>

### GM_wrench.wait()
TODO document this method

**Kind**: static method of [<code>GM\_wrench</code>](#GM_wrench)  
<a name="GM_wrench.waitForKeyElements"></a>

### GM_wrench.waitForKeyElements(selectorOrFunction, callback, [waitOnce], [interval], [maxIntervals])
Detect and handle AJAXed content.

**Kind**: static method of [<code>GM\_wrench</code>](#GM_wrench)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| selectorOrFunction | <code>string</code> \| <code>function</code> |  | The selector string or function. |
| callback | <code>function</code> |  | The callback function; takes a single DOM element as parameter.                                               If returns true, element will be processed again on subsequent iterations. |
| [waitOnce] | <code>boolean</code> | <code>true</code> | Whether to stop after the first elements are found. |
| [interval] | <code>number</code> | <code>300</code> | The time (ms) to wait between iterations. |
| [maxIntervals] | <code>number</code> | <code>-1</code> | The max number of intervals to run (negative number for unlimited). |

**Example**  
```js
GM_wrench.waitForKeyElements("div.comments", (element) => {  element.innerHTML = "This text inserted by waitForKeyElements().";});GM_wrench.waitForKeyElements(() => {  const iframe = document.querySelector('iframe');  if (iframe) {    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;    return iframeDoc.querySelectorAll("div.comments");  }  return null;}, callbackFunc);
```
<a name="GM_wrench.innerTypes"></a>

### GM_wrench.innerTypes : <code>object</code>
The internal types used by this library.

**Kind**: static namespace of [<code>GM\_wrench</code>](#GM_wrench)  

* [.innerTypes](#GM_wrench.innerTypes) : <code>object</code>
    * [.Condition](#GM_wrench.innerTypes.Condition)
        * [new Condition(message, fn)](#new_GM_wrench.innerTypes.Condition_new)
        * [.description()](#GM_wrench.innerTypes.Condition+description) ⇒ <code>string</code>
    * [.HTMLElementCondition](#GM_wrench.innerTypes.HTMLElementCondition) ⇐ <code>Condition&lt;!(HTMLElement\|Promise&lt;!HTMLElement&gt;)&gt;</code>
        * [new HTMLElementCondition(message, fn)](#new_GM_wrench.innerTypes.HTMLElementCondition_new)
    * [.Error](#GM_wrench.innerTypes.Error) ⇐ <code>Error</code>
        * [new Error([opt_error])](#new_GM_wrench.innerTypes.Error_new)
    * [.TimeoutError](#GM_wrench.innerTypes.TimeoutError) ⇐ <code>Error</code>
        * [new TimeoutError([opt_error])](#new_GM_wrench.innerTypes.TimeoutError_new)

<a name="GM_wrench.innerTypes.Condition"></a>

#### innerTypes.Condition
Defines a condition for use with [GM_wrench#wait](GM_wrench#wait).

**Kind**: static class of [<code>innerTypes</code>](#GM_wrench.innerTypes)  
**See**: [webdriver.Condition](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_Condition.html)  

* [.Condition](#GM_wrench.innerTypes.Condition)
    * [new Condition(message, fn)](#new_GM_wrench.innerTypes.Condition_new)
    * [.description()](#GM_wrench.innerTypes.Condition+description) ⇒ <code>string</code>

<a name="new_GM_wrench.innerTypes.Condition_new"></a>

##### new Condition(message, fn)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | A descriptive error message. Should complete the sentence "Waiting [...]". |
| fn | <code>function</code> | The condition function to evaluate on each iteration of the wait loop. |

<a name="GM_wrench.innerTypes.Condition+description"></a>

##### condition.description() ⇒ <code>string</code>
**Kind**: instance method of [<code>Condition</code>](#GM_wrench.innerTypes.Condition)  
**Returns**: <code>string</code> - A description of this condition.  
<a name="GM_wrench.innerTypes.HTMLElementCondition"></a>

#### innerTypes.HTMLElementCondition ⇐ <code>Condition&lt;!(HTMLElement\|Promise&lt;!HTMLElement&gt;)&gt;</code>
Defines a condition that will result in a [HTMLElement](HTMLElement).

**Kind**: static class of [<code>innerTypes</code>](#GM_wrench.innerTypes)  
**Extends**: <code>Condition&lt;!(HTMLElement\|Promise&lt;!HTMLElement&gt;)&gt;</code>  
**See**: [webdriver.WebElementCondition](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebElementCondition.html)  
<a name="new_GM_wrench.innerTypes.HTMLElementCondition_new"></a>

##### new HTMLElementCondition(message, fn)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | A descriptive error message. Should complete the sentence "Waiting [...]". |
| fn | <code>function</code> | The condition function to evaluate on each iteration of the wait loop. |

<a name="GM_wrench.innerTypes.Error"></a>

#### innerTypes.Error ⇐ <code>Error</code>
The base error type for GM_wrench methods.

**Kind**: static class of [<code>innerTypes</code>](#GM_wrench.innerTypes)  
**Extends**: <code>Error</code>  
<a name="new_GM_wrench.innerTypes.Error_new"></a>

##### new Error([opt_error])

| Param | Type | Description |
| --- | --- | --- |
| [opt_error] | <code>string</code> | The error message, if any. |

<a name="GM_wrench.innerTypes.TimeoutError"></a>

#### innerTypes.TimeoutError ⇐ <code>Error</code>
An operation did not complete before its timeout expired.

**Kind**: static class of [<code>innerTypes</code>](#GM_wrench.innerTypes)  
**Extends**: <code>Error</code>  
**See**: [webdriver.TimeoutError](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/error_exports_TimeoutError.html)  
<a name="new_GM_wrench.innerTypes.TimeoutError_new"></a>

##### new TimeoutError([opt_error])

| Param | Type | Description |
| --- | --- | --- |
| [opt_error] | <code>string</code> | The error message, if any. |

