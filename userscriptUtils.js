/**
 * A collection of common utilities for implementing userscripts.  Some methods are adapted from the
 * {@link https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/|selenium-webdriver} project.
 */
var GM_wrench = {};
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
        if (style.styleSheet) {
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
     * Resolves a wait message from either a function or a string.
     * @private
     * @see {@link https://github.com/SeleniumHQ/selenium/blob/d912be8f325d3bed9758140b50599ee0619f1929/javascript/node/selenium-webdriver/lib/webdriver.js#L221|webdriver.resolveWaitMessage}
     *
     * @param {(string|Function)=} message An optional message to use if the wait times out.
     * @return {string}                    The resolved message.
     */
    function resolveWaitMessage(message) {
        return message
            ? `${typeof message === 'function' ? message() : message}\n`
            : '';
    }

    /**
     * Determines whether a {@code value} should be treated as a promise.
     * Any object whose "then" property is a function will be considered a promise.
     * @private
     * @see {@link https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/promise.html#isPromise|isPromise}
     *
     * @param {?} value The value to test.
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
     * TODO document this method
     */
    GM_wrench.wait = function (condition, timeout = 0, message = undefined, pollTimeout = 200) {
        if (typeof timeout !== 'number' || timeout < 0) {
            throw TypeError('timeout must be a number >= 0: ' + timeout);
        }
        if (typeof pollTimeout !== 'number' || pollTimeout < 0) {
            throw TypeError('pollTimeout must be a number >= 0: ' + pollTimeout);
        }

        if (isPromise(condition)) {
            return new Promise((resolve, reject) => {
                if (!timeout) {
                    resolve(condition);
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

                condition.then(function (value) {
                    clearTimer();
                    resolve(value);
                },
                    function (error) {
                        clearTimer();
                        reject(error);
                    });
            });
        }

        let fn = (condition);
        if (condition instanceof Condition) {
            message = message || condition.description();
            fn = condition.fn;
        }
        if (typeof fn !== 'function') {
            throw TypeError('Wait condition must be a promise-like object, function, or a Condition object');
        }

        function evaluateCondition() {
            return new Promise((resolve, reject) => {
                try {
                    resolve(fn(GM_wrench));
                } catch (ex) {
                    reject(ex);
                }
            });
        }
        let result = new Promise((resolve, reject) => {
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
        if (condition instanceof HTMLElementCondition) {
            result = result.then(function (value) {
                if (!(value instanceof HTMLElement)) {
                    throw TypeError('HTMLElementCondition did not resolve to a HTMLElement: ' + Object.prototype.toString.call(value));
                }
                return value;
            });
            //            result = new HTMLElementPromise(this, result.then(function (value) {
            //                if (!(value instanceof HTMLElement)) {
            //                    throw TypeError('HTMLElementCondition did not resolve to a HTMLElement: ' + Object.prototype.toString.call(value));
            //                }
            //                return value;
            //            }));
        }
        return result;
    }

    /**
     * Detect and handle AJAXed content.
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
     * @param {function}          callback           The callback function; takes a single DOM element as parameter.
     *                                               If returns true, element will be processed again on subsequent iterations.
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
                self.waitForKeyElements(selectorOrFunction, callback, waitOnce, interval, maxIntervals);
            }, interval);
        }
    };

    /**
     * Helper method for implementing classical inheritance.
     * @static
     * @private
     *
     * @param {function} subType   The subtype constructor.
     * @param {function} superType The supertype constructor.
     */
    function inheritType(subType, superType) {
        subType.prototype = Object.create(superType);
        subType.prototype.constructor = subType;
    }

    /**
     * @classdesc Defines a condition for use with {@link GM_wrench#wait}.
     * @class
     * @memberof GM_wrench
     * @private
     * @see {@link https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_Condition.html|webdriver.Condition}
     *
     * @param {string} message          A descriptive error message. Should complete the sentence "Waiting [...]".
     * @param {function(!GM_wrench)} fn The condition function to evaluate on each iteration of the wait loop.
     */
    function Condition(message, fn) {
        this.message = message;
        this.fn = fn;
    };
    /**
     * @return {string} A description of this condition.
     */
    Condition.prototype.description = function () {
        return 'Waiting ' + this.message;
    };
    GM_wrench.Condition = Condition;

    /**
     * @classdesc Defines a condition that will result in a {@link HTMLElement}.
     * @class
     * @extends {Condition<!(HTMLElement|Promise<!HTMLElement>)>}
     * @memberof GM_wrench
     * @private
     * @see {@link https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebElementCondition.html|webdriver.WebElementCondition}
     *
     * @param {string} message A descriptive error message. Should complete the sentence "Waiting [...]".
     * @param {function(!GM_wrench): !(HTMLElement|Promise<!HTMLElement>)}
     *     fn The condition function to evaluate on each iteration of the wait loop.
     */
    function HTMLElementCondition(message, fn) {
        Condition.call(this, message, fn);
    };
    inheritType(HTMLElementCondition, Condition);
    GM_wrench.HTMLElementCondition = HTMLElementCondition;

    /**
     * @classdesc A promise that will be fulfilled with a HTMLElement.
     * @class
     * @extends {HTMLElement}
     * @memberof GM_wrench
     * @private
     * TODO finish documentation
     */
    function HTMLElementPromise(el) {
        this.then = el.then.bind(el);
        this.catch = el.catch.bind(el);
    };
    inheritType(HTMLElementPromise, HTMLElement);
    GM_wrench.HTMLElementPromise = HTMLElementPromise;

    /**
     * @classdesc An operation did not complete before its timeout expired.
     * @class
     * @extends Error
     * @memberof GM_wrench
     * @hideconstructor
     * @see {@link https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/error_exports_TimeoutError.html|webdriver.TimeoutError}
     *
     * @param {string=} opt_error The error message, if any.
     */
    function TimeoutError(opt_error) {
        Error.call(this, opt_error);
        this.message = opt_error;
    };
    inheritType(TimeoutError, Error)
    TimeoutError.prototype.name = TimeoutError.name;
    GM_wrench.TimeoutError = TimeoutError;

    /**
     * @classdesc Describes a mechanism for locating an element on the page.
     * @class
     * @memberof GM_wrench
     * @see {@link https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_By.html|webdriver.By}
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
     * Locates elements using a query selector.
     * @static
     * 
     * @param {string} selector The query selector to use.
     * @return {!By} The new locator.
     */
    By.query = function (selector) {
        return new By('query', selector);
    };

    /**
     * Checks if a value is a valid locator.
     * @private
     * 
     * @param {!(By|Function|string)} locator The value to check.  If string, it is returned as a `By.query` value.
     * @return {!(By|Function)}               The valid locator.
     * @throws {TypeError}                    If the given value does not define a valid locator strategy.
     */
    function checkLocator(locator) {
        if (locator instanceof By || typeof locator === 'function') {
            return locator;
        }
        if (typeof locator === 'string') {
            return By.query(locator);
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

    const commands = {
        findElement: async function (context, using, value) {

        },

        /**
         * @private
         * 
         * @param {!(Document|HTMLElement)} context  The search context.
         * @param {!string} using                    The name of the location strategy to use.
         * @param {!string} value                    The value to search for.
         * @returns {!Promise<!Array<!HTMLElement>>} A promise that will resolve to an array of HTMLElements.
         */
        findElements: async function (context, using, value) {
            switch (using) {
                case 'query': return context.querySelectorAll(value);
                default: throw new TypeError('Unrecognized locator type: ' + using);
            }
        }
    };

    /**
     * Locates an element on the page. If the element cannot be found, a
     * {@link error.NoSuchElementError} will be returned by the driver.
     *
     * This function should not be used to test whether an element is present on
     * the page. Rather, you should use {@link #findElements}:
     *
     *     GM_wrench.findElements(By.id('foo'))
     *         .then(found => console.log('Element found? %s', !!found.length));
     *
     * The search criteria for an element may be defined using one of the
     * factories in the {@link By} namespace, or as a short-hand
     * {@link By.Hash} object. For example, the following two statements
     * are equivalent:
     *
     *     var e1 = GM_wrench.findElement(By.id('foo'));
     *     var e2 = GM_wrench.findElement({id:'foo'});
     *
     * You may also provide a custom locator function, which takes as input this
     * instance and returns a {@link HTMLElement}, or a promise that will resolve
     * to a HTMLElement. If the returned promise resolves to an array of
     * HTMLElements, GM_wrench will use the first element. For example, to find the
     * first visible link on a page, you could write:
     *
     *     var link = GM_wrench.findElement(firstVisibleLink);
     *
     *     function firstVisibleLink(GM_wrench) {
     *       var links = GM_wrench.findElements(By.tagName('a'));
     *       return promise.filter(links, function(link) {
     *         return link.isDisplayed();
     *       });
     *     }
     *
     * @param {!(by.By|Function)} locator The locator to use.
     * @return {!HTMLElementPromise} A HTMLElement that can be used to issue
     *     commands against the located element. If the element is not found, the
     *     element will be invalidated and all scheduled commands aborted.
     */
    function findElement(locator) {
        let id
        locator = by.checkedLocator(locator)
        if (typeof locator === 'function') {
            id = this.findElementInternal_(locator, this)
        }
        else {
            let cmd = new command.Command(command.Name.FIND_ELEMENT)
                .setParameter('using', locator.using)
                .setParameter('value', locator.value)
            id = this.execute(cmd)
        }
        return new WebElementPromise(this, id)
    }

    /**
     * @param {!Function} locatorFn The locator function to use.
     * @param {!(WebDriver|WebElement)} context The search context.
     * @return {!Promise<!WebElement>} A promise that will resolve to a list of WebElements.
     * @private
     */
    async function findElementInternal_(locatorFn, context) {
        let result = await locatorFn(context)
        if (Array.isArray(result)) {
            result = result[0]
        }
        if (!(result instanceof WebElement)) {
            throw new TypeError('Custom locator did not return a WebElement')
        }
        return result
    }

    /**
     * Search for multiple elements on the page. Refer to the documentation on
     * {@link GM_wrench#findElement(by)} for information on element locator strategies.
     *
     * @param {!(By|Function)} locator          The locator to use.
     * @param {!(Document|HTMLElement)} context The search context.
     * @return {!Promise<!Array<!HTMLElement>>} A promise that will resolve to an array of HTMLElements.
     */
    async function findElements(locator, context = document) {
        locator = checkLocator(locator);
        let result;
        if (typeof locator === 'function') {
            result = await locator(context);
            if (result instanceof HTMLElement) {
                result = [result];
            }
            else if (Array.isArray(result)) {
                result = result.filter(function (item) {
                    return item instanceof HTMLElement;
                });
            }
            else {
                result = [];
            }
        }
        else {
            result = await commands.findElements(context, locator.using, locator.value);
            if (!Array.isArray(result)) {
                result = [];
            }
        }
        return result;
    }
    GM_wrench.findElements = findElements;

    /**
     * Defines common conditions for use with {@link GM_wrench#wait}.
     */
    GM_wrench.until = {};

    /**
     * Creates a condition that will loop until an element is
     * {@link document.querySelector found} with the given locator.
     *
     * @param {!(By|Function)} locator The locator to use.
     * @return {!WebElementCondition}  The new condition.
     */
    GM_wrench.until.elementLocated = function (locator) {
        locator = checkedLocator(locator);
        let locatorStr = typeof locator === 'function' ? 'by function()' : locator + '';
        return new HTMLElementCondition(
            'for element to be located ' + locatorStr,
            async function (context) {
                const elements = await findElements(locator, context);
                return elements[0];
            }
        );
    };

    /**
     * TODO FINISH IMPLEMENTATION
     * Creates a condition that will loop until at least one element is
     * {@link ./webdriver.WebDriver#findElement found} with the given locator.
     *
     * @param {!(By|Function)} locator The locator to use.
     * @return {!Condition<!Array<!./webdriver.WebElement>>}
     *     The new condition.
     */
    GM_wrench.until.elementsLocated = function (locator) {
        locator = by.checkedLocator(locator)
        let locatorStr =
            typeof locator === 'function' ? 'by function()' : locator + ''
        return new Condition(
            'for at least one element to be located ' + locatorStr,
            function (driver) {
                return driver.findElements(locator).then(function (elements) {
                    return elements.length > 0 ? elements : null
                })
            }
        )
    }
})();
