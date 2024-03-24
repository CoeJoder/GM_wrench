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
const output = jsdoc2md.renderSync({data: templateData, template: template, partial: partials});
fs.writeFileSync(outputFile, output);
