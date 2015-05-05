'use strict';

var array_utils = require('../htmlbars-util/array-utils');
var builders = require('./builders');
var utils = require('./utils');

var voidTagNames = "area base br col command embed hr img input keygen link meta param source track wbr";
var voidMap = {};

array_utils.forEach(voidTagNames.split(" "), function (tagName) {
  voidMap[tagName] = true;
});

// Except for `mustache`, all tokens are only allowed outside of
// a start or end tag.
var tokenHandlers = {
  Comment: function (token) {
    var current = this.currentElement();
    var comment = builders.buildComment(token.chars);
    utils.appendChild(current, comment);
  },

  Chars: function (token) {
    var current = this.currentElement();
    var text = builders.buildText(token.chars);
    utils.appendChild(current, text);
  },

  StartTag: function (tag) {
    var element = builders.buildElement(tag.tagName, tag.attributes, tag.modifiers || [], []);
    element.loc = {
      start: { line: tag.firstLine, column: tag.firstColumn },
      end: { line: null, column: null }
    };

    this.elementStack.push(element);
    if (voidMap.hasOwnProperty(tag.tagName) || tag.selfClosing) {
      tokenHandlers.EndTag.call(this, tag);
    }
  },

  BlockStatement: function () {
    if (this.tokenizer.state === "comment") {
      return;
    } else if (this.tokenizer.state !== "data") {
      throw new Error("A block may only be used inside an HTML element or another block.");
    }
  },

  MustacheStatement: function (mustache) {
    var tokenizer = this.tokenizer;

    switch (tokenizer.state) {
      // Tag helpers
      case "tagName":
        tokenizer.addElementModifier(mustache);
        tokenizer.state = "beforeAttributeName";
        return;
      case "beforeAttributeName":
        tokenizer.addElementModifier(mustache);
        return;
      case "attributeName":
      case "afterAttributeName":
        tokenizer.finalizeAttributeValue();
        tokenizer.addElementModifier(mustache);
        tokenizer.state = "beforeAttributeName";
        return;
      case "afterAttributeValueQuoted":
        tokenizer.addElementModifier(mustache);
        tokenizer.state = "beforeAttributeName";
        return;

      // Attribute values
      case "beforeAttributeValue":
        tokenizer.markAttributeQuoted(false);
        tokenizer.addToAttributeValue(mustache);
        tokenizer.state = "attributeValueUnquoted";
        return;
      case "attributeValueDoubleQuoted":
      case "attributeValueSingleQuoted":
      case "attributeValueUnquoted":
        tokenizer.addToAttributeValue(mustache);
        return;

      // TODO: Only append child when the tokenizer state makes
      // sense to do so, otherwise throw an error.
      default:
        utils.appendChild(this.currentElement(), mustache);
    }
  },

  EndTag: function (tag) {
    var element = this.elementStack.pop();
    var parent = this.currentElement();
    var disableComponentGeneration = this.options.disableComponentGeneration === true;

    validateEndTag(tag, element);

    if (disableComponentGeneration || element.tag.indexOf("-") === -1) {
      utils.appendChild(parent, element);
    } else {
      var program = builders.buildProgram(element.children);
      utils.parseComponentBlockParams(element, program);
      var component = builders.buildComponent(element.tag, element.attributes, program);
      utils.appendChild(parent, component);
    }
  }

};

function validateEndTag(tag, element) {
  var error;

  if (voidMap[tag.tagName] && element.tag === undefined) {
    // For void elements, we check element.tag is undefined because endTag is called by the startTag token handler in
    // the normal case, so checking only voidMap[tag.tagName] would lead to an error being thrown on the opening tag.
    error = "Invalid end tag " + formatEndTagInfo(tag) + " (void elements cannot have end tags).";
  } else if (element.tag === undefined) {
    error = "Closing tag " + formatEndTagInfo(tag) + " without an open tag.";
  } else if (element.tag !== tag.tagName) {
    error = "Closing tag " + formatEndTagInfo(tag) + " did not match last open tag `" + element.tag + "` (on line " + element.loc.start.line + ").";
  }

  if (error) {
    throw new Error(error);
  }
}

function formatEndTagInfo(tag) {
  return "`" + tag.tagName + "` (on line " + tag.lastLine + ")";
}

exports['default'] = tokenHandlers;
/*block*/