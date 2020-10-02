/**
 * Constructor.
 *
 * @class
 * @classdesc A collection of common utilities for implementing userscripts.  Some methods are adapted from the
 *            {@link https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/|selenium-webdriver}
 *            project.
 */
function UserscriptUtils() {
    var self = this;

    /**
     * Sleep for the given amount of time.
     *
     * @example
     * await userscriptUtils.sleep(2000);
     *
     * @param {number} ms      The amount of time, in milliseconds, to sleep.
     * @return {Promise<void>} A promise that will be resolved when the sleep has finished.
     * @see {@link https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_WebDriver.html#sleep|webdriver.sleep}
     */
    this.sleep = function(ms) {
        return new Promise((resolve) => setTimeout(() => resolve(), ms));
    };

    /**
     * Add a new `<style>` with the given text to the `<head>`.
     *
     * @example
     * userscriptUtils.addCss(`
     *     p {
     *         height: 50px;
     *     }
     * `);
     *
     * @param {string} css The CSS rules to add.
     */
    this.addCss = function(css) {
        var style = document.createElement('style');
        style.type ='text/css';
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
     * userscriptUtils.addStylesheet('https://fonts.googleapis.com/css?family=Open+Sans');
     *
     * @param {string} href The URL of the stylesheet.
     */
    this.addStylesheet = function(href) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.getElementsByTagName('head')[0].appendChild(link);
    };

    /**
     * Resolves a wait message from either a function or a string.
     *
     * @private
     * @param {(string|Function)=} message An optional message to use if the wait times out.
     * @return {string}                    The resolved message.
     * @see {@link https://github.com/SeleniumHQ/selenium/blob/d912be8f325d3bed9758140b50599ee0619f1929/javascript/node/selenium-webdriver/lib/webdriver.js#L221|webdriver.resolveWaitMessage}
     */
    function resolveWaitMessage(message) {
        return message
            ? `${typeof message === 'function' ? message() : message}\n`
            : '';
    }

    /**
     * Determines whether a {@code value} should be treated as a promise.
     * Any object whose "then" property is a function will be considered a promise.
     *
     * @private
     * @param {?} value The value to test.
     * @return {boolean} Whether the value is a promise.
     * @see {@link https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/lib/promise.html#isPromise|isPromise}
     */
    function isPromise(value) {
        try {
            return (value && (typeof value === 'object' || typeof value === 'function')
                    && typeof value['then'] === 'function');
        } catch (ex) {
            return false
        }
    }

    this.wait = function(condition, timeout = 0, message = undefined, pollTimeout = 200) {
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
                        reject(new UserscriptUtils.TimeoutError(`${timeoutMessage}Timed out waiting for promise to resolve after ${Date.now() - start}ms`));
                    } catch (ex) {
                        reject(new UserscriptUtils.TimeoutError(`${ex.message}\nTimed out waiting for promise to resolve after ${Date.now() - start}ms`));
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

        if (typeof fn !== 'function') {
            throw TypeError('Wait condition must be a promise-like object or a function');
        }

        function evaluateCondition() {
            return new Promise((resolve, reject) => {
                try {
                    resolve(fn(self));
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
                            reject(new UserscriptUtils.TimeoutError(`${timeoutMessage}Wait timed out after ${elapsed}ms`));
                        } catch (ex) {
                            reject(new UserscriptUtils.TimeoutError(`${ex.message}\nWait timed out after ${elapsed}ms`));
                        }
                    } else {
                        setTimeout(pollCondition, pollTimeout);
                    }
                }, reject);
            };
            pollCondition();
        });
        return result;
    }

    /**
     * Detect and handle AJAXed content.
     *
     * @example
     * userscriptUtils.waitForKeyElements("div.comments", (element) => {
     *   element.innerHTML = "This text inserted by waitForKeyElements().";
     * });
     *
     * userscriptUtils.waitForKeyElements(() => {
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
    this.waitForKeyElements = function(selectorOrFunction, callback, waitOnce, interval, maxIntervals) {
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
            targetNodes.forEach(function(targetNode) {
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
            setTimeout(function() {
                self.waitForKeyElements(selectorOrFunction, callback, waitOnce, interval, maxIntervals);
            }, interval);
        }
    };
}
