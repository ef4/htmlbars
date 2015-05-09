'use strict';

exports.compileSpec = compileSpec;
exports.template = template;
exports.compile = compile;

var parser = require('../htmlbars-syntax/parser');
var TemplateCompiler = require('./template-compiler');
var hooks = require('../htmlbars-runtime/hooks');
var render = require('../htmlbars-runtime/render');



/*
 * Compile a string into a template spec string. The template spec is a string
 * representation of a template. Usually, you would use compileSpec for
 * pre-compilation of a template on the server.
 *
 * Example usage:
 *
 *     var templateSpec = compileSpec("Howdy {{name}}");
 *     // This next step is basically what plain compile does
 *     var template = new Function("return " + templateSpec)();
 *
 * @method compileSpec
 * @param {String} string An HTMLBars template string
 * @return {TemplateSpec} A template spec string
 */
function compileSpec(string, options) {
  var ast = parser.preprocess(string, options);
  var compiler = new TemplateCompiler['default'](options);
  var program = compiler.compile(ast);
  return program;
}

function template(templateSpec) {
  return new Function("return " + templateSpec)();
}

function compile(string, options) {
  return hooks.wrap(template(compileSpec(string, options)), render['default']);
}