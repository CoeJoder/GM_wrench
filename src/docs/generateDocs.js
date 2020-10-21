// @ts-check

'use strict'
const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs');
const path = require('path');

const inputFile = path.resolve(__dirname, '..', 'GM_wrench.js');
const outputFile = path.resolve(__dirname, '..', '..', 'README.md');
const template = fs.readFileSync(path.resolve(__dirname, 'README.md.hbs'), 'utf-8');
const partials = path.resolve(__dirname, 'scope.hbs');
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

const output = jsdoc2md.renderSync({data: templateData, template: template, partial: partials});
fs.writeFileSync(outputFile, output);
