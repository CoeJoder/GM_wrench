# GM_wrench
Greasemonkey Wrench.<br/>
A collection of helper functions and classes for userscripts.  Includes a subset of the [selenium-webdriver](https://github.com/SeleniumHQ/selenium/tree/trunk/javascript/node/selenium-webdriver#readme) API.

## Installation
Add the following to your userscript's metadata block:
```js
// @require https://cdn.jsdelivr.net/gh/CoeJoder/GM_wrench@v1.3/dist/GM_wrench.min.js
```
If your userscript was already installed, you'll have to reinstall it to pickup the change. See [documentation](https://sourceforge.net/p/greasemonkey/wiki/Metadata_Block/#require).

## API Reference
**Example** *(Wait up to 10 seconds to be logged in, then wait up to 3 seconds for a button to appear, then click on it)*  
```js
(async ({wait, until, By}) => {
    function isLoggedIn(username) {
        return -1 != document.body.innerHTML.search(`Welcome back, ${username}`);
    }
    await wait({
        condition: isLoggedIn,
        input: 'CoeJoder',
        timeout: 10000,
        message: 'Not logged in.'
    });
    await wait({
        condition: until.elementLocated(By.css('button')),
        input: document, 
        timeout: 3000
    }).click();
})(GM_wrench);
```

* [GM_wrench](#GM_wrench)
    * [.sleep(ms)](#GM_wrench.sleep) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.addCss(css)](#GM_wrench.addCss)
    * [.addStylesheet(href)](#GM_wrench.addStylesheet)
    * [.isCssSelectorSupported(selector)](#GM_wrench.isCssSelectorSupported) ⇒ <code>boolean</code>
    * [.waitForKeyElements(selectorOrFunction, callback, [waitOnce], [interval], [maxIntervals])](#GM_wrench.waitForKeyElements)
    * _selenium-webdriver_
        * [.wait([obj])](#GM_wrench.wait) ⇒ <code>Promise.&lt;V&gt;</code> \| <code>ElementPromise</code>
        * [.By](#GM_wrench.By)
            * [new By(using, value)](#new_GM_wrench.By_new)
            * [.css(selector)](#GM_wrench.By.css) ⇒ <code>By</code>
            * [.id(id)](#GM_wrench.By.id) ⇒ <code>By</code>
            * [.className(name)](#GM_wrench.By.className) ⇒ <code>By</code>
            * [.linkText(text)](#GM_wrench.By.linkText) ⇒ <code>By</code>
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
            * [.elementsLocated(locator)](#GM_wrench.until.elementsLocated) ⇒ <code>Condition.&lt;!ParentNode, !(Promise.&lt;?ArrayLike.&lt;Element&gt;&gt;)&gt;</code>

<a name="GM_wrench.sleep"></a>

### GM_wrench.sleep(ms) ⇒ <code>Promise.&lt;void&gt;</code>
Sleep for the given amount of time.

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


| Param | Type | Description |
| --- | --- | --- |
| css | <code>string</code> | The CSS rules to add. |

**Example**  
```js
GM_wrench.addCss(`
    p {
        height: 50px;
    }
`);
```
<a name="GM_wrench.addStylesheet"></a>

### GM_wrench.addStylesheet(href)
Add a new stylesheet `<link>` to the `<head>`.


| Param | Type | Description |
| --- | --- | --- |
| href | <code>string</code> | The URL of the stylesheet. |

**Example**  
```js
GM_wrench.addStylesheet('https://fonts.googleapis.com/css?family=Open+Sans');
```
<a name="GM_wrench.isCssSelectorSupported"></a>

### GM_wrench.isCssSelectorSupported(selector) ⇒ <code>boolean</code>
Check whether or not a given CSS selector is supported by the current browser.

**Returns**: <code>boolean</code> - Whether or not the selector is supported by the current browser.  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | The CSS selector. |

**Example**  
```js
if (!GM_wrench.isCssSelectorSupported(':has(x)')) {
    throw new Error("Browser does not support the ':has(x)' pseudo-selector");
}
```
<a name="GM_wrench.waitForKeyElements"></a>

### GM_wrench.waitForKeyElements(selectorOrFunction, callback, [waitOnce], [interval], [maxIntervals])
Detect and handle AJAXed content.  Can force each element to be processed one or more times.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| selectorOrFunction | <code>string</code> \| <code>function</code> |  | The selector string or function. |
| callback | <code>function</code> |  | The callback function; takes a single DOM element as parameter.  If                                               returns true, element will be processed again on subsequent iterations. |
| [waitOnce] | <code>boolean</code> | <code>true</code> | Whether to stop after the first elements are found. |
| [interval] | <code>number</code> | <code>300</code> | The time (ms) to wait between iterations. |
| [maxIntervals] | <code>number</code> | <code>-1</code> | The max number of intervals to run (negative number for unlimited). |

**Example**  
```js
GM_wrench.waitForKeyElements('div.comments', (element) => {
  element.innerHTML = 'This text inserted by waitForKeyElements().';
});

GM_wrench.waitForKeyElements(() => {
  const iframe = document.querySelector('iframe');
  if (iframe) {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    return iframeDoc.querySelectorAll('div.comments');
  }
  return null;
}, callbackFunc);
```
<a name="GM_wrench.wait"></a>

### GM_wrench.wait([obj]) ⇒ <code>Promise.&lt;V&gt;</code> \| <code>ElementPromise</code>
Waits for a condition to evaluate to a "truthy" value. The condition may be specified by a
[Condition](#GM_wrench.Condition), as a custom function, or as any promise-like thenable.

For a [Condition](#GM_wrench.Condition) or function, the wait will repeatedly evaluate the condition until it returns a truthy
value. If any errors occur while evaluating the condition, they will be allowed to propagate. In the event a
condition returns a Promise, the polling loop will wait for it to be resolved and use the resolved value for
whether the condition has been satisfied. The resolution time for a promise is always factored into whether a
wait has timed out.

If the provided condition is an [ElementCondition](#GM_wrench.ElementCondition), then the wait will return a
[ElementPromise](#GM_wrench.ElementPromise) that will resolve to the element that satisfied the condition.

**Returns**: <code>Promise.&lt;V&gt;</code> \| <code>ElementPromise</code> - A promise that will be resolved with the first truthy value returned
     by the condition function, or rejected if the condition times out. If the input input condition is an
     instance of an [ElementCondition](#GM_wrench.ElementCondition), the returned value will be an [ElementPromise](#GM_wrench.ElementPromise).  
**Category**: selenium-webdriver  
**Throws**:

- <code>TypeError</code> if the provided `condition` is not a valid type.

**See**

- [webdriver.wait](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html#wait)
- [webdriver.FluentWait](https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/support/ui/FluentWait.html)


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [obj] | <code>Object</code> |  | An object. |
| [obj.condition] | <code>PromiseLike.&lt;V&gt;</code> \| <code>Condition.&lt;T, V&gt;</code> \| <code>function</code> |  | The condition to wait on, defined as a promise, [Condition](#GM_wrench.Condition) object,       or a function to evaluate as a condition. |
| [obj.input] | <code>T</code> |  | The input value to pass to the evaluated conditions. |
| [obj.timeout] | <code>number</code> | <code>0</code> | The duration in milliseconds, how long to wait for the condition to be true. |
| [obj.pollTimeout] | <code>number</code> | <code>200</code> | The duration in milliseconds, how long to wait between polling the condition. |
| [obj.message] | <code>string</code> \| <code>function</code> |  | An optional message to use if the wait times out. |

**Example**  
```js
(async ({wait, until, By}) => {
    await wait({
        condition: until.elementLocated(By.css('button')),
        input: document
    }).click();
})(GM_wrench);
```
<a name="GM_wrench.By"></a>

### GM_wrench.By
Describes a mechanism for locating an element on the page.

**Category**: selenium-webdriver  
**See**: [webdriver.By](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_By.html)  

* [.By](#GM_wrench.By)
    * [new By(using, value)](#new_GM_wrench.By_new)
    * [.css(selector)](#GM_wrench.By.css) ⇒ <code>By</code>
    * [.id(id)](#GM_wrench.By.id) ⇒ <code>By</code>
    * [.className(name)](#GM_wrench.By.className) ⇒ <code>By</code>
    * [.linkText(text)](#GM_wrench.By.linkText) ⇒ <code>By</code>

<a name="new_GM_wrench.By_new"></a>

#### new By(using, value)

| Param | Type | Description |
| --- | --- | --- |
| using | <code>string</code> | The name of the location strategy to use. |
| value | <code>string</code> | The value to search for. |

<a name="GM_wrench.By.css"></a>

#### By.css(selector) ⇒ <code>By</code>
Locates elements using a CSS selector.

**Returns**: <code>By</code> - The new locator.  
**Category**: selenium-webdriver  
**See**: [webdriver.By.css](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_By.html#By.css)  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | The CSS selector to use. |

<a name="GM_wrench.By.id"></a>

#### By.id(id) ⇒ <code>By</code>
Locates elements by the ID attribute. This locator uses the CSS selector `*[id="$ID"]`, not `document.getElementById`.

**Returns**: <code>By</code> - The new locator.  
**Category**: selenium-webdriver  
**See**: [webdriver.By.id](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_By.html#By.id)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The ID to search for. |

<a name="GM_wrench.By.className"></a>

#### By.className(name) ⇒ <code>By</code>
Locates elements that have a specific class name.

**Returns**: <code>By</code> - The new locator.  
**Category**: selenium-webdriver  
**See**: [webdriver.By.className](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_By.html#By.className)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The class name to search for. |

<a name="GM_wrench.By.linkText"></a>

#### By.linkText(text) ⇒ <code>By</code>
Locates link elements whose visible text matches the given string.

**Returns**: <code>By</code> - The new locator.  
**Category**: selenium-webdriver  
**See**: [webdriver.By.linkText](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_By.html#By.linkText)  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The link text to search for. |

<a name="GM_wrench.Condition"></a>

### GM_wrench.Condition
Defines a condition for use with [wait](#GM_wrench.wait).

**Category**: selenium-webdriver  
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
**Returns**: <code>string</code> - A description of this condition.  
<a name="GM_wrench.ElementCondition"></a>

### GM_wrench.ElementCondition ⇐ <code>Condition</code>
Defines a condition that will result in an [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element).

**Extends**: <code>Condition</code>  
**Category**: selenium-webdriver  
**See**: [webdriver.WebElementCondition](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebElementCondition.html)  
<a name="new_GM_wrench.ElementCondition_new"></a>

#### new ElementCondition(message, fn)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | A descriptive error message. Should complete the sentence "Waiting [...]". |
| fn | <code>function</code> | The condition function to      evaluate on each iteration of the wait loop. |

<a name="GM_wrench.ElementPromise"></a>

### GM_wrench.ElementPromise ⇐ <code>Element</code>
A promise that will be fulfilled with an [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element).

**Extends**: <code>Element</code>  
**Implements**: <code>Promise&lt;Element&gt;</code>  
**Category**: selenium-webdriver  
**See**: [webdriver.WebElementPromise](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebElementPromise.html)  
<a name="new_GM_wrench.ElementPromise_new"></a>

#### new ElementPromise(el)

| Param | Type | Description |
| --- | --- | --- |
| el | <code>Promise.&lt;!Element&gt;</code> | A promise that will resolve to the promised element. |

<a name="GM_wrench.TimeoutError"></a>

### GM_wrench.TimeoutError ⇐ <code>Error</code>
An operation did not complete before its timeout expired.

**Extends**: <code>Error</code>  
**Category**: selenium-webdriver  
**See**: [webdriver.TimeoutError](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/error_exports_TimeoutError.html)  
<a name="new_GM_wrench.TimeoutError_new"></a>

#### new TimeoutError([opt_error])

| Param | Type | Description |
| --- | --- | --- |
| [opt_error] | <code>string</code> | The error message, if any. |

<a name="GM_wrench.until"></a>

### GM_wrench.until : <code>object</code>
Defines common conditions for use with [wait](#GM_wrench.wait).

**Category**: selenium-webdriver  

* [.until](#GM_wrench.until) : <code>object</code>
    * [.elementLocated(locator)](#GM_wrench.until.elementLocated) ⇒ <code>ElementCondition</code>
    * [.elementsLocated(locator)](#GM_wrench.until.elementsLocated) ⇒ <code>Condition.&lt;!ParentNode, !(Promise.&lt;?ArrayLike.&lt;Element&gt;&gt;)&gt;</code>

<a name="GM_wrench.until.elementLocated"></a>

#### until.elementLocated(locator) ⇒ <code>ElementCondition</code>
Creates a condition that will loop until an element is found with the given locator.

**Returns**: <code>ElementCondition</code> - The new condition.  
**Category**: selenium-webdriver  
**See**: [webdriver.until.elementLocated](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/until.html#elementLocated)  

| Param | Type | Description |
| --- | --- | --- |
| locator | <code>By</code> \| <code>function</code> | The locator to use. |

<a name="GM_wrench.until.elementsLocated"></a>

#### until.elementsLocated(locator) ⇒ <code>Condition.&lt;!ParentNode, !(Promise.&lt;?ArrayLike.&lt;Element&gt;&gt;)&gt;</code>
Creates a condition that will loop until at least one element is found with the given locator.

**Returns**: <code>Condition.&lt;!ParentNode, !(Promise.&lt;?ArrayLike.&lt;Element&gt;&gt;)&gt;</code> - The new condition.  
**Category**: selenium-webdriver  
**See**: [webdriver.until.elementsLocated](https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/until.html#elementsLocated)  

| Param | Type | Description |
| --- | --- | --- |
| locator | <code>By</code> \| <code>function</code> | The locator to use. |

