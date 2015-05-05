'use strict';

var Walker = require('./htmlbars-syntax/walker');
var builders = require('./htmlbars-syntax/builders');
var parser = require('./htmlbars-syntax/parser');

exports.Walker = Walker['default'];
exports.builders = builders['default'];
exports.parse = parser.preprocess;