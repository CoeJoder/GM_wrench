/**
 * A utility class for for userscripts.
 *
 * @class
 */
function UserscriptUtils() {
    var that = this;

    /**
     * Add a new <style> with the given text to the <head>.
     *
     * Usage example:
     *
     * utils.addCss(`
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
    }

    /**
     * Add a new <link> stylesheet at the given URL to the <head>.
     */
    UserscriptUtils.prototype.addStylesheet = function(href) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.getElementsByTagName('head')[0].appendChild(link);
    }

    /**
     * Detect and handle AJAXed content.
     *
     * Usage example:
     *
     * function callback(domElement) {
     *     domElement.innerHTML = "This text inserted by waitForKeyElements().";
     * }
     *
     * utils.waitForKeyElements("div.comments", callback);
     * // or
     * utils.waitForKeyElements(selectorFunction, callback);
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
                that.waitForKeyElements(selectorOrFunction, callback, waitOnce, interval, maxIntervals);
            }, interval);
        }
    }
}