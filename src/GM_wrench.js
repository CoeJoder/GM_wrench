// @ts-check

/**
 * @example
 * (async ({Waiter, until, By}) => {
 *     await new Waiter(document)
 *             .wait(until.elementLocated(By.css("button")));
 *             .click();
 * })(GM_wrench);
 */
var GM_wrench = GM_wrench || {};
(() => {
    'use strict'

    /**
     * Sleep for the given amount of time.
     * @see {@link https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html#sleep|webdriver.sleep}
     *
     * @example
     * await GM_wrench.sleep(2000);
     *
     * @param {number} ms      The amount of time, in milliseconds, to sleep.
     * @return {Promise<void>} A promise that will be resolved when the sleep has finished.
     */
    GM_wrench.sleep = function (ms) {
        return new Promise((resolve) => setTimeout(() => resolve(), ms));
    };

    /**
     * Add a new `<style>` with the given text to the `<head>`.
     *
     * @example
     * GM_wrench.addCss(`
     *     p {
     *         height: 50px;
     *     }
     * `);
     *
     * @param {string} css The CSS rules to add.
     */
    GM_wrench.addCss = function (css) {
        var style = document.createElement('style');
        style.type = 'text/css';
        // @ts-ignore
        if (style.styleSheet) {
            // @ts-ignore
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        document.getElementsByTagName('head')[0].appendChild(style);
    };

    /**
     * Add a new stylesheet `<link>` to the `<head>`.
     *
     * @example
     * GM_wrench.addStylesheet('https://fonts.googleapis.com/css?family=Open+Sans');
     *
     * @param {string} href The URL of the stylesheet.
     */
    GM_wrench.addStylesheet = function (href) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.getElementsByTagName('head')[0].appendChild(link);
    };
    
    /**
     * Detect and handle AJAXed content.  Can force each element to be processed one or more times.
     *
     * @example
     * GM_wrench.waitForKeyElements("div.comments", (element) => {
     *   element.innerHTML = "This text inserted by waitForKeyElements().";
     * });
     *
     * GM_wrench.waitForKeyElements(() => {
     *   const iframe = document.querySelector('iframe');
     *   if (iframe) {
     *     const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
     *     return iframeDoc.querySelectorAll("div.comments");
     *   }
     *   return null;
     * }, callbackFunc);
     *
     * @param {(string|function)} selectorOrFunction The selector string or function.
     * @param {function}          callback           The callback function; takes a single DOM element as parameter.  If
     *                                               returns true, element will be processed again on subsequent iterations.
     * @param {boolean}           [waitOnce=true]    Whether to stop after the first elements are found.
     * @param {number}            [interval=300]     The time (ms) to wait between iterations.
     * @param {number}            [maxIntervals=-1]  The max number of intervals to run (negative number for unlimited).
     */
    GM_wrench.waitForKeyElements = function (selectorOrFunction, callback, waitOnce, interval, maxIntervals) {
        if (typeof waitOnce === "undefined") {
            waitOnce = true;
        }
        if (typeof interval === "undefined") {
            interval = 300;
        }
        if (typeof maxIntervals === "undefined") {
            maxIntervals = -1;
        }
        var targetNodes = (typeof selectorOrFunction === "function")
            ? selectorOrFunction()
            : document.querySelectorAll(selectorOrFunction);

        var targetsFound = targetNodes && targetNodes.length > 0;
        if (targetsFound) {
            targetNodes.forEach(function (targetNode) {
                var attrAlreadyFound = "data-userscript-alreadyFound";
                var alreadyFound = targetNode.getAttribute(attrAlreadyFound) || false;
                if (!alreadyFound) {
                    var cancelFound = callback(targetNode);
                    if (cancelFound) {
                        targetsFound = false;
                    }
                    else {
                        targetNode.setAttribute(attrAlreadyFound, true);
                    }
                }
            });
        }

        if (maxIntervals !== 0 && !(targetsFound && waitOnce)) {
            maxIntervals -= 1;
            setTimeout(function () {
                GM_wrench.waitForKeyElements(selectorOrFunction, callback, waitOnce, interval, maxIntervals);
            }, interval);
        }
    };

    /**
     * Resolves a wait message from either a function or a string.
     * @private
     * @see {@link https://github.com/SeleniumHQ/selenium/blob/d912be8f325d3bed9758140b50599ee0619f1929/javascript/node/selenium-webdriver/lib/webdriver.js#L221|webdriver.resolveWaitMessage}
     * @category selenium-webdriver
     *
     * @param {(string|Function)} [message] An optional message to use if the wait times out.
     * @return {string}                     The resolved message.
     */
    function resolveWaitMessage(message) {
        return message
            ? `${typeof message === 'function' ? message() : message}\n`
            : '';
    }

    /**
     * Determines whether a {@code value} should be treated as a promise.  Any object whose "then" property is a
     * function will be considered a promise.
     * @private
     * @see {@link https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/promise.html#isPromise|isPromise}
     * @category selenium-webdriver
     *
     * @param {*} value  The value to test.
     * @return {boolean} Whether the value is a promise.
     */
    function isPromise(value) {
        try {
            return (value && (typeof value === 'object' || typeof value === 'function') && typeof value['then'] === 'function');
        } catch (ex) {
            return false;
        }
    }

    /**
     * @classdesc Waits for a condition to evaluate to a "truthy" value. The condition may be specified by a
     * {@link GM_wrench.Condition}, as a custom function, or as any promise-like thenable.
     *
     * For a {@link GM_wrench.Condition} or function, the wait will repeatedly evaluate the condition until it returns a truthy
     * value. If any errors occur while evaluating the condition, they will be allowed to propagate. In the event a
     * condition returns a Promise, the polling loop will wait for it to be resolved and use the resolved value for
     * whether the condition has been satisfied. The resolution time for a promise is always factored into whether a
     * wait has timed out.
     *
     * If the provided condition is an {@link GM_wrench.ElementCondition}, then the wait will return a
     * {@link GM_wrench.ElementPromise} that will resolve to the element that satisfied the condition.
     *
     * @example <caption>Waiting up to 10 seconds for text to appear, then wait up to 3 seconds for an element.</caption>
     * (async ({Waiter, until, By}) => {
     *     function isLoggedIn(username) {
     *         return -1 != document.body.innerHTML.search(`Welcome back, ${username}`);
     *     }
     *     await new Waiter("CoeJoder", 10000)
     *             .wait(isLoggedIn);
     *     let button = await new Waiter(document, 3000, 50)
     *             .wait(until.elementLocated(By.css('button')));
     *     button.click();
     * })(GM_wrench);
     *
     * @template T,V
     * @class
     * @memberof GM_wrench
     * @see {@link https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/support/ui/FluentWait.html|webdriver.FluentWait}
     * @category selenium-webdriver
     *
     * @param {T}                 [input]             The input value to pass to the evaluated conditions. 
     * @param {number}            [timeout=0]         The duration in milliseconds, how long to wait for the condition to be true.
     * @param {number}            [pollTimeout=200]   The duration in milliseconds, how long to wait between polling the condition.
     * @param {(string|Function)} [message=undefined] An optional message to use if the wait times out.
     */
    function Waiter(input = undefined, timeout = 0, pollTimeout = 200, message = undefined) {
        this.input = input;
        this.timeout = timeout;
        this.pollTimeout = pollTimeout;
        this.message = message;
    }
    GM_wrench.Waiter = Waiter;

    /**
     * Wait for condition to be satisfied.
     * @see {@link https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html#wait|webdriver.wait}
     * @category selenium-webdriver
     *
     * @param {!(PromiseLike<V>|Condition<T, V>|function(T): V)} condition The condition to wait on, defined as a promise,
     *      {@link GM_wrench.Condition} object, or a function to evaluate as a condition.
     * @return {!(Promise<V>|ElementPromise)} A promise that will be resolved with the first truthy value returned
     *      by the condition function, or rejected if the condition times out. If the input input condition is an
     *      instance of an {@link GM_wrench.ElementCondition}, the returned value will be an {@link GM_wrench.ElementPromise}.
     * @throws {TypeError} if the provided `condition` is not a valid type.
     */
    Waiter.prototype.wait = function (condition) {
        let input = this.input;
        let timeout = this.timeout;
        let message = this.message;
        let pollTimeout = this.pollTimeout;

        if (typeof timeout !== 'number' || timeout < 0) {
            throw TypeError('timeout must be a number >= 0: ' + timeout);
        }
        if (typeof pollTimeout !== 'number' || pollTimeout < 0) {
            throw TypeError('pollTimeout must be a number >= 0: ' + pollTimeout);
        }

        if (isPromise(condition)) {
            let pCondition = /** @type {!PromiseLike} */ (condition);
            return new Promise((resolve, reject) => {
                if (!timeout) {
                    resolve(pCondition);
                    return;
                }
                let start = Date.now();
                let timer = setTimeout(function () {
                    timer = null
                    try {
                        let timeoutMessage = resolveWaitMessage(message);
                        reject(new TimeoutError(`${timeoutMessage}Timed out waiting for promise to resolve after ${Date.now() - start}ms`));
                    } catch (ex) {
                        reject(new TimeoutError(`${ex.message}\nTimed out waiting for promise to resolve after ${Date.now() - start}ms`));
                    }
                }, timeout);
                const clearTimer = () => timer && clearTimeout(timer);

                pCondition.then(
                    function (value) {
                        clearTimer();
                        resolve(value);
                    },
                    function (error) {
                        clearTimer();
                        reject(error);
                    }
                );
            });
        }

        let fn;
        if (condition instanceof Condition) {
            message = message || condition.description();
            fn = condition.fn;
        }
        else if (typeof fn === 'function') {
            fn = condition;
        }
        else {
            throw TypeError('Wait condition must be a promise-like object, function, or a Condition object');
        }

        function evaluateCondition() {
            return new Promise((resolve, reject) => {
                try {
                    resolve(fn(input));
                } catch (ex) {
                    reject(ex);
                }
            });
        }
        let pResult = new Promise((resolve, reject) => {
            const startTime = Date.now();
            const pollCondition = async () => {
                evaluateCondition().then(function (value) {
                    const elapsed = Date.now() - startTime;
                    if (value) {
                        resolve(value);
                    } else if (timeout && elapsed >= timeout) {
                        try {
                            let timeoutMessage = resolveWaitMessage(message);
                            reject(new TimeoutError(`${timeoutMessage}Wait timed out after ${elapsed}ms`));
                        } catch (ex) {
                            reject(new TimeoutError(`${ex.message}\nWait timed out after ${elapsed}ms`));
                        }
                    } else {
                        setTimeout(pollCondition, pollTimeout);
                    }
                }, reject);
            };
            pollCondition();
        });
        if (condition instanceof ElementCondition) {
            return new ElementPromise(pResult.then(function (value) {
                if (!(value instanceof Element)) {
                    throw TypeError('ElementCondition did not resolve to a Element: ' + Object.prototype.toString.call(value));
                }
                return value;
            }));
        }
        return pResult;
    };
    
    /**
     * Helper method for implementing inheritance.
     * @static
     * @private
     *
     * @param {function} subType   The subtype constructor.
     * @param {function} superType The supertype constructor.
     */
    function inheritType(subType, superType) {
        subType.prototype = Object.create(superType.prototype);
        subType.prototype.constructor = subType;
    }
    
    /**
     * @classdesc Describes a mechanism for locating an element on the page.
     * @class
     * @memberof GM_wrench
     * @see {@link https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_By.html|webdriver.By}
     * @category selenium-webdriver
     * 
     * @param {string} using The name of the location strategy to use.
     * @param {string} value The value to search for.
     */
    function By(using, value) {
        this.using = using;
        this.value = value;
    }
    By.prototype.toString = function () {
        return `By(${this.using}, ${this.value})`;
    };
    GM_wrench.By = By;

    /**
     * Locates elements using a CSS selector.
     * @static
     * @see {@link https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_By.html#By.css|webdriver.By.css}
     * @category selenium-webdriver
     * 
     * @param {string} selector The CSS selector to use.
     * @return {!By}            The new locator.
     */
    By.css = function (selector) {
        return new By('css', selector);
    };

    /**
     * @classdesc Defines a condition for use with {@link GM_wrench.Waiter}.
     * @class
     * @memberof GM_wrench
     * @see {@link https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_Condition.html|webdriver.Condition}
     * @category selenium-webdriver
     *
     * @template T,V
     * @param {string}       message A descriptive error message. Should complete the sentence "Waiting [...]".
     * @param {function(!T): V} fn   The condition function to evaluate on each iteration of the wait loop.
     */
    function Condition(message, fn) {
        this.message = message;
        this.fn = fn;
    }
    GM_wrench.Condition = Condition;

    /**
     * @return {string} A description of this condition.
     */
    Condition.prototype.description = function () {
        return 'Waiting ' + this.message;
    };

    /**
     * @classdesc Defines a condition that will result in an {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Element}.
     * @class
     * @extends {Condition}
     * @memberof GM_wrench
     * @see {@link https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebElementCondition.html|webdriver.WebElementCondition}
     * @category selenium-webdriver
     *
     * @param {string} message A descriptive error message. Should complete the sentence "Waiting [...]".
     * @param {function(!ParentNode): !(Element|Promise<!Element>)} fn The condition function to
     *      evaluate on each iteration of the wait loop.
     */
    function ElementCondition(message, fn) {
        Condition.call(this, message, fn);
    }
    inheritType(ElementCondition, Condition);
    GM_wrench.ElementCondition = ElementCondition;

    /**
     * @classdesc A promise that will be fulfilled with an {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Element}.
     * @class
     * @extends {Element}
     * @implements {Promise<Element>}
     * @memberof GM_wrench
     * @see {@link https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebElementPromise.html|webdriver.WebElementPromise}
     * @category selenium-webdriver
     * 
     * @param {!Promise<!Element>} el A promise that will resolve to the promised element.
     */
    function ElementPromise(el) {
        this.then = el.then.bind(el);
        this.catch = el.catch.bind(el);
    }
    inheritType(ElementPromise, Element);
    GM_wrench.ElementPromise = ElementPromise;

    /**
     * @classdesc An operation did not complete before its timeout expired.
     * @class
     * @extends Error
     * @memberof GM_wrench
     * @see {@link https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/error_exports_TimeoutError.html|webdriver.TimeoutError}
     * @category selenium-webdriver
     *
     * @param {string} [opt_error] The error message, if any.
     */
    function TimeoutError(opt_error) {
        Error.call(this, opt_error);
        this.message = opt_error;
    }
    inheritType(TimeoutError, Error);
    TimeoutError.prototype.name = TimeoutError.name;
    GM_wrench.TimeoutError = TimeoutError;

    /**
     * Checks if a value is a valid locator.
     * @private
     * @category selenium-webdriver
     * 
     * @param {!(By|function|string|object)} locator The value to check.  If a string, it is returned as a `By.css` value.
     * @return {!(By|function)}                      The valid locator.
     * @throws {TypeError}                           If the given value does not define a valid locator strategy.
     */
    function checkLocator(locator) {
        if (locator instanceof By || typeof locator === 'function') {
            return locator;
        }
        if (typeof locator === 'string') {
            return By.css(locator);
        }
        if (locator
            && typeof locator === 'object'
            && typeof locator.using === 'string'
            && typeof locator.value === 'string') {
            return new By(locator.using, locator.value);
        }
        for (let key in locator) {
            if (Object.prototype.hasOwnProperty.call(locator, key)
                && Object.prototype.hasOwnProperty.call(By, key)) {
                return By[key](locator[key]);
            }
        }
        throw new TypeError('Invalid locator');
    }

    /** WebDriver commands which are normally implemented by the remote end. */
    const commands = {
        /**
         * @private
         * 
         * @param {!ParentNode} context                   The search context.
         * @param {!string} using                         The name of the location strategy to use.
         * @param {!string} value                         The value to search for.
         * @returns {!Promise<!NodeListOf<!Element>>} A promise that will resolve to an array-like collection of Elements.
         */
        findElements: async function (context, using, value) {
            switch (using) {
                case 'css': return context.querySelectorAll(value);
                default: throw new TypeError('Unrecognized locator type: ' + using);
            }
        }
    };

    /**
     * Defines common conditions for use with {@link GM_wrench.Waiter}.
     * @namespace
     * @category selenium-webdriver
     */
    GM_wrench.until = {};

    /**
     * Search for multiple elements on the page. Refer to the documentation on
     * [webdriver.findElement(by)]{@link https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html#findElement}
     * for information on element locator strategies.
     * @private
     * @category selenium-webdriver
     *
     * @param {!(By|Function)} locator               The locator to use.
     * @param {!ParentNode} context      The search context.
     * @return {!(Promise<!ArrayLike<Element>>)} A promise that will resolve to an array-like collection of Elements.
     */
    async function findElements(locator, context = document) {
        locator = checkLocator(locator);
        let result;
        if (typeof locator === 'function') {
            result = await locator(context);
            if (result instanceof Element) {
                result = [result];
            }
            else if (Array.isArray(result)) {
                result = result.filter(function (item) {
                    return item instanceof Element;
                });
            }
            else {
                result = [];
            }
        }
        else {
            result = await commands.findElements(context, locator.using, locator.value);
        }
        return result;
    }

    /**
     * Creates a condition that will loop until an element is found with the given locator.
     * @see {@link https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/until.html#elementLocated|webdriver.until.elementLocated}
     * @category selenium-webdriver
     *
     * @param {!(By|Function)} locator The locator to use.
     * @return {!ElementCondition}     The new condition.
     */
    GM_wrench.until.elementLocated = function (locator) {
        locator = checkLocator(locator);
        let locatorStr = (typeof locator === 'function') ? 'by function()' : locator + '';
        return new ElementCondition(
            'for element to be located ' + locatorStr,
            async function (context) {
                const elements = await findElements(locator, context);
                return elements[0];
            }
        );
    };

    /**
     * Creates a condition that will loop until at least one element is found with the given locator.
     * @see {@link https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/until.html#elementsLocated|webdriver.until.elementsLocated}
     * @category selenium-webdriver
     *
     * @param {!(By|Function)} locator                                    The locator to use.
     * @return {!Condition<!ParentNode, !(Promise<!ArrayLike<Element>>)>} The new condition.
     */
    GM_wrench.until.elementsLocated = function (locator) {
        locator = checkLocator(locator);
        let locatorStr = (typeof locator === 'function') ? 'by function()' : locator + '';
        return new Condition(
            'for at least one element to be located ' + locatorStr,
            async function (context) {
                const elements = await findElements(locator, context);
                return elements.length > 0 ? elements : null;
            }
        );
    };
})();
