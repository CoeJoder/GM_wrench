# userscriptUtils.js
A collection of utilities for implementing userscripts.

## Installation
Add the following to your userscript's metadata block:
```js
// @require https://cdn.jsdelivr.net/gh/CoeJoder/userscriptUtils.js@v1.0/userscriptUtils.js
```
If your userscript was already installed, you'll have to reinstall it to pickup the change. See [documentation](https://sourceforge.net/p/greasemonkey/wiki/Metadata_Block/#require).

## Usage
```js
GM_wrench.addCss(`
    p {
        height: 50px;
    }
`);
```
See full API [here](api.md).
