<a name="GM_wrench"></a>

## GM\_wrench
A collection of common utilities for implementing userscripts.  Some methods are adapted from the[selenium-webdriver](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/) project.

**Kind**: global constant  

* [GM_wrench](#GM_wrench)
    * [.sleep(ms)](#GM_wrench.sleep) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.addCss(css)](#GM_wrench.addCss)
    * [.addStylesheet(href)](#GM_wrench.addStylesheet)
    * [.waitForKeyElements(selectorOrFunction, callback, [waitOnce], [interval], [maxIntervals])](#GM_wrench.waitForKeyElements)
    * [.Waiter](#GM_wrench.Waiter)
        * [new Waiter([input], [timeout], [pollTimeout], [message])](#new_GM_wrench.Waiter_new)
        * [.wait(condition)](#GM_wrench.Waiter+wait) ⇒ <code>Promise.&lt;V&gt;</code> \| <code>ElementPromise</code>
    * [.By](#GM_wrench.By)
        * [new By(using, value)](#new_GM_wrench.By_new)
        * [.css(selector)](#GM_wrench.By.css) ⇒ <code>By</code>
    * [.Condition](#GM_wrench.Condition)
        * [new Condition(message, fn)](#new_GM_wrench.Condition_new)
        * [.description()](#GM_wrench.Condition+description) ⇒ <code>string</code>
    * [.ElementCondition](#GM_wrench.ElementCondition) ⇐ <code>Condition</code>
        * [new ElementCondition(message, fn)](#new_GM_wrench.ElementCondition_new)
    * [.ElementPromise](#GM_wrench.ElementPromise) ⇐ <code>Element</code>
        * [new ElementPromise(el)](#new_GM_wrench.ElementPromise_new)
    * [.TimeoutError](#GM_wrench.TimeoutError) ⇐ <code>Error</code>
        * [new TimeoutError([opt_error])](#new_GM_wrench.TimeoutError_new)
    * [.until](#GM_wrench.until) : <code>object</code>
        * [.elementLocated(locator)](#GM_wrench.until.elementLocated) ⇒ <code>ElementCondition</code>
        * [.elementsLocated(locator)](#GM_wrench.until.elementsLocated) ⇒ <code>Condition.&lt;!ParentNode, !(Promise.&lt;!ArrayLike.&lt;Element&gt;&gt;)&gt;</code>

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
<a name="GM_wrench.waitForKeyElements"></a>

### GM_wrench.waitForKeyElements(selectorOrFunction, callback, [waitOnce], [interval], [maxIntervals])
Detect and handle AJAXed content.  Can force each element to be processed one or more times.

**Kind**: static method of [<code>GM\_wrench</code>](#GM_wrench)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| selectorOrFunction | <code>string</code> \| <code>function</code> |  | The selector string or function. |
| callback | <code>function</code> |  | The callback function; takes a single DOM element as parameter.  If                                               returns true, element will be processed again on subsequent iterations. |
| [waitOnce] | <code>boolean</code> | <code>true</code> | Whether to stop after the first elements are found. |
| [interval] | <code>number</code> | <code>300</code> | The time (ms) to wait between iterations. |
| [maxIntervals] | <code>number</code> | <code>-1</code> | The max number of intervals to run (negative number for unlimited). |

**Example**  
```js
GM_wrench.waitForKeyElements("div.comments", (element) => {  element.innerHTML = "This text inserted by waitForKeyElements().";});GM_wrench.waitForKeyElements(() => {  const iframe = document.querySelector('iframe');  if (iframe) {    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;    return iframeDoc.querySelectorAll("div.comments");  }  return null;}, callbackFunc);
```
<a name="GM_wrench.Waiter"></a>

### GM_wrench.Waiter
Waits for a condition to evaluate to a "truthy" value. The condition may be specified by a[Condition](#GM_wrench.Condition), as a custom function, or as any promise-like thenable.For a [Condition](#GM_wrench.Condition) or function, the wait will repeatedly evaluate the condition until it returns a truthyvalue. If any errors occur while evaluating the condition, they will be allowed to propagate. In the event acondition returns a Promise, the polling loop will wait for it to be resolved and use the resolved value forwhether the condition has been satisfied. The resolution time for a promise is always factored into whether await has timed out.If the provided condition is an [ElementCondition](#GM_wrench.ElementCondition), then the wait will return a[ElementPromise](#GM_wrench.ElementPromise) that will resolve to the element that satisfied the condition.

**Kind**: static class of [<code>GM\_wrench</code>](#GM_wrench)  
**See**: [webdriver.FluentWait](https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/support/ui/FluentWait.html)  

* [.Waiter](#GM_wrench.Waiter)
    * [new Waiter([input], [timeout], [pollTimeout], [message])](#new_GM_wrench.Waiter_new)
    * [.wait(condition)](#GM_wrench.Waiter+wait) ⇒ <code>Promise.&lt;V&gt;</code> \| <code>ElementPromise</code>

<a name="new_GM_wrench.Waiter_new"></a>

#### new Waiter([input], [timeout], [pollTimeout], [message])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [input] | <code>T</code> |  | The input value to pass to the evaluated conditions. |
| [timeout] | <code>number</code> | <code>0</code> | The duration in milliseconds, how long to wait for the condition to be true. |
| [pollTimeout] | <code>number</code> | <code>200</code> | The duration in milliseconds, how long to wait between polling the condition. |
| [message] | <code>string</code> \| <code>function</code> |  | An optional message to use if the wait times out. |

**Example** *(Waiting up to 10 seconds for text to appear, then wait up to 3 seconds for an element.)*  
```js
(async ({Waiter, until, By}) => {
    function isLoggedIn(username) {
        return -1 != document.body.innerHTML.search(`Welcome back, ${username}`);
    }
    await new Waiter("CoeJoder", 10000)
            .wait(isLoggedIn);
    let button = await new Waiter(document, 3000, 50)
            .wait(until.elementLocated(By.css('button')));
    button.click();
})(GM_wrench);
```
<a name="GM_wrench.Waiter+wait"></a>

#### waiter.wait(condition) ⇒ <code>Promise.&lt;V&gt;</code> \| <code>ElementPromise</code>
Wait for condition to be satisfied.

**Kind**: instance method of [<code>Waiter</code>](#GM_wrench.Waiter)  
**Returns**: <code>Promise.&lt;V&gt;</code> \| <code>ElementPromise</code> - A promise that will be resolved with the first truthy value returned     by the condition function, or rejected if the condition times out. If the input input condition is an     instance of an [ElementCondition](#GM_wrench.ElementCondition), the returned value will be an [ElementPromise](#GM_wrench.ElementPromise).  
**Throws**:

- <code>TypeError</code> if the provided `condition` is not a valid type.

**See**: [webdriver.wait](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html#wait)  

| Param | Type | Description |
| --- | --- | --- |
| condition | <code>PromiseLike.&lt;V&gt;</code> \| <code>Condition.&lt;T, V&gt;</code> \| <code>function</code> | The condition to wait on, defined as a promise,      [Condition](#GM_wrench.Condition) object, or a function to evaluate as a condition. |

<a name="GM_wrench.By"></a>

### GM_wrench.By
Describes a mechanism for locating an element on the page.

**Kind**: static class of [<code>GM\_wrench</code>](#GM_wrench)  
**See**: [webdriver.By](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_By.html)  

* [.By](#GM_wrench.By)
    * [new By(using, value)](#new_GM_wrench.By_new)
    * [.css(selector)](#GM_wrench.By.css) ⇒ <code>By</code>

<a name="new_GM_wrench.By_new"></a>

#### new By(using, value)

| Param | Type | Description |
| --- | --- | --- |
| using | <code>string</code> | The name of the location strategy to use. |
| value | <code>string</code> | The value to search for. |

<a name="GM_wrench.By.css"></a>

#### By.css(selector) ⇒ <code>By</code>
Locates elements using a CSS selector.

**Kind**: static method of [<code>By</code>](#GM_wrench.By)  
**Returns**: <code>By</code> - The new locator.  
**See**: [By.css](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_By.html#By.css)  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | The CSS selector to use. |

<a name="GM_wrench.Condition"></a>

### GM_wrench.Condition
Defines a condition for use with [GM_wrench.wait](GM_wrench.wait).

**Kind**: static class of [<code>GM\_wrench</code>](#GM_wrench)  
**See**: [webdriver.Condition](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_Condition.html)  

* [.Condition](#GM_wrench.Condition)
    * [new Condition(message, fn)](#new_GM_wrench.Condition_new)
    * [.description()](#GM_wrench.Condition+description) ⇒ <code>string</code>

<a name="new_GM_wrench.Condition_new"></a>

#### new Condition(message, fn)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | A descriptive error message. Should complete the sentence "Waiting [...]". |
| fn | <code>function</code> | The condition function to evaluate on each iteration of the wait loop. |

<a name="GM_wrench.Condition+description"></a>

#### condition.description() ⇒ <code>string</code>
**Kind**: instance method of [<code>Condition</code>](#GM_wrench.Condition)  
**Returns**: <code>string</code> - A description of this condition.  
<a name="GM_wrench.ElementCondition"></a>

### GM_wrench.ElementCondition ⇐ <code>Condition</code>
Defines a condition that will result in an [Element](Element).

**Kind**: static class of [<code>GM\_wrench</code>](#GM_wrench)  
**Extends**: <code>Condition</code>  
**See**: [webdriver.WebElementCondition](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebElementCondition.html)  
<a name="new_GM_wrench.ElementCondition_new"></a>

#### new ElementCondition(message, fn)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | A descriptive error message. Should complete the sentence "Waiting [...]". |
| fn | <code>function</code> | The condition function to      evaluate on each iteration of the wait loop. |

<a name="GM_wrench.ElementPromise"></a>

### GM_wrench.ElementPromise ⇐ <code>Element</code>
A promise that will be fulfilled with an Element.

**Kind**: static class of [<code>GM\_wrench</code>](#GM_wrench)  
**Extends**: <code>Element</code>  
**Implements**: <code>Promise&lt;Element&gt;</code>  
**See**: [https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebElementPromise.html](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebElementPromise.html)  
<a name="new_GM_wrench.ElementPromise_new"></a>

#### new ElementPromise(el)

| Param | Type | Description |
| --- | --- | --- |
| el | <code>Promise.&lt;!Element&gt;</code> | A promise that will resolve to the promised element. |

<a name="GM_wrench.TimeoutError"></a>

### GM_wrench.TimeoutError ⇐ <code>Error</code>
An operation did not complete before its timeout expired.

**Kind**: static class of [<code>GM\_wrench</code>](#GM_wrench)  
**Extends**: <code>Error</code>  
**See**: [webdriver.TimeoutError](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/error_exports_TimeoutError.html)  
<a name="new_GM_wrench.TimeoutError_new"></a>

#### new TimeoutError([opt_error])

| Param | Type | Description |
| --- | --- | --- |
| [opt_error] | <code>string</code> | The error message, if any. |

<a name="GM_wrench.until"></a>

### GM_wrench.until : <code>object</code>
Defines common conditions for use with [Waiter](#GM_wrench.Waiter).

**Kind**: static namespace of [<code>GM\_wrench</code>](#GM_wrench)  

* [.until](#GM_wrench.until) : <code>object</code>
    * [.elementLocated(locator)](#GM_wrench.until.elementLocated) ⇒ <code>ElementCondition</code>
    * [.elementsLocated(locator)](#GM_wrench.until.elementsLocated) ⇒ <code>Condition.&lt;!ParentNode, !(Promise.&lt;!ArrayLike.&lt;Element&gt;&gt;)&gt;</code>

<a name="GM_wrench.until.elementLocated"></a>

#### until.elementLocated(locator) ⇒ <code>ElementCondition</code>
Creates a condition that will loop until an element is found with the given locator.

**Kind**: static method of [<code>until</code>](#GM_wrench.until)  
**Returns**: <code>ElementCondition</code> - The new condition.  

| Param | Type | Description |
| --- | --- | --- |
| locator | <code>By</code> \| <code>function</code> | The locator to use. |

<a name="GM_wrench.until.elementsLocated"></a>

#### until.elementsLocated(locator) ⇒ <code>Condition.&lt;!ParentNode, !(Promise.&lt;!ArrayLike.&lt;Element&gt;&gt;)&gt;</code>
Creates a condition that will loop until at least one element is found with the given locator.

**Kind**: static method of [<code>until</code>](#GM_wrench.until)  
**Returns**: <code>Condition.&lt;!ParentNode, !(Promise.&lt;!ArrayLike.&lt;Element&gt;&gt;)&gt;</code> - The new condition.  

| Param | Type | Description |
| --- | --- | --- |
| locator | <code>By</code> \| <code>function</code> | The locator to use. |

