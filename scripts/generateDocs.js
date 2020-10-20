'use strict'
const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs');
const path = require('path');

const inputFile = path.resolve(__dirname, '..', 'userscriptUtils.js');
const outputFile = path.resolve(__dirname, '..', 'api.md');
const templateData = jsdoc2md.getTemplateDataSync({files: inputFile});

// 1) move inner namespaces to the bottom
// 2) move classes to the bottom
const regexDot = /\./g;
const empty = [];
const namespace = 'namespace';
const klass = 'class';
templateData.sort((a, b) => {
    let cmpResult = (a.id.match(regexDot) || empty).length - (b.id.match(regexDot) || empty).length;
    if (cmpResult === 0) {
        if (a.kind === namespace) cmpResult += 1;
        if (b.kind === namespace) cmpResult -= 1;
        if (cmpResult === 0) {
            if (a.kind === klass) cmpResult += 1;
            if (b.kind === klass) cmpResult -= 1;
        }
    }
    return cmpResult;
});

// default template (main.hbs)
const template = '{{>main-index~}}{{>all-docs~}}';
const output = jsdoc2md.renderSync({data: templateData, template: template});
fs.writeFileSync(outputFile, output);
