/**
 * Constructor.
 *
 * @class
 * @classdesc A collection of common utilities for implementing userscripts.
 */
function UserscriptUtils() {
    var self = this;

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
     * @param {string} css - The CSS rules to add.
     */
    UserscriptUtils.prototype.addCss = function(css) {
        var style = document.createElement('style');
        style.type ='text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        }
        else {
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
     * @param {string} href - The URL of the stylesheet.
     */
    UserscriptUtils.prototype.addStylesheet = function(href) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.getElementsByTagName('head')[0].appendChild(link);
    };

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
     * @param {(string|function)} selectorOrFunction - The selector string or function.
     * @param {function}          callback           - The callback function; takes a single DOM element as parameter.
     *                                                 If returns true, element will be processed again on subsequent iterations.
     * @param {boolean}           [waitOnce=true]    - Whether to stop after the first elements are found.
     * @param {number}            [interval=300]     - The time (ms) to wait between iterations.
     * @param {number}            [maxIntervals=-1]  - The max number of intervals to run (negative number for unlimited).
     */
    UserscriptUtils.prototype.waitForKeyElements = function(selectorOrFunction, callback, waitOnce, interval, maxIntervals) {
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