'use strict';

var sanitize_attribute_value = require('./morph-attr/sanitize-attribute-value');
var prop = require('./dom-helper/prop');
var build_html_dom = require('./dom-helper/build-html-dom');
var htmlbars_util = require('./htmlbars-util');

function getProperty() {
  return this.domHelper.getPropertyStrict(this.element, this.attrName);
}

function updateProperty(value) {
  if (this._renderedInitially === true || !prop.isAttrRemovalValue(value)) {
    // do not render if initial value is undefined or null
    this.domHelper.setPropertyStrict(this.element, this.attrName, value);
  }

  this._renderedInitially = true;
}

function getAttribute() {
  return this.domHelper.getAttribute(this.element, this.attrName);
}

function updateAttribute(value) {
  if (prop.isAttrRemovalValue(value)) {
    this.domHelper.removeAttribute(this.element, this.attrName);
  } else {
    this.domHelper.setAttribute(this.element, this.attrName, value);
  }
}

function getAttributeNS() {
  return this.domHelper.getAttributeNS(this.element, this.namespace, this.attrName);
}

function updateAttributeNS(value) {
  if (prop.isAttrRemovalValue(value)) {
    this.domHelper.removeAttribute(this.element, this.attrName);
  } else {
    this.domHelper.setAttributeNS(this.element, this.namespace, this.attrName, value);
  }
}

var UNSET = { unset: true };

function AttrMorph(element, attrName, domHelper, namespace) {
  this.element = element;
  this.domHelper = domHelper;
  this.namespace = namespace !== undefined ? namespace : htmlbars_util.getAttrNamespace(attrName);
  this.state = {};
  this.isDirty = false;
  this.escaped = true;
  this.lastValue = UNSET;
  this.linkedParams = null;
  this.rendered = false;
  this._renderedInitially = false;

  var normalizedAttrName = prop.normalizeProperty(this.element, attrName);
  if (this.namespace) {
    this._update = updateAttributeNS;
    this._get = getAttributeNS;
    this.attrName = attrName;
  } else {
    if (element.namespaceURI === build_html_dom.svgNamespace || attrName === "style" || !normalizedAttrName) {
      this.attrName = attrName;
      this._update = updateAttribute;
      this._get = getAttribute;
    } else {
      this.attrName = normalizedAttrName;
      this._update = updateProperty;
      this._get = getProperty;
    }
  }
}

AttrMorph.prototype.setContent = function (value) {
  if (this.lastValue === value) {
    return;
  }
  this.lastValue = value;

  if (this.escaped) {
    var sanitized = sanitize_attribute_value.sanitizeAttributeValue(this.domHelper, this.element, this.attrName, value);
    this._update(sanitized, this.namespace);
  } else {
    this._update(value, this.namespace);
  }
};

AttrMorph.prototype.getContent = function () {
  var value = this.lastValue = this._get();
  return value;
};

// renderAndCleanup calls `clear` on all items in the morph map
// just before calling `destroy` on the morph.
//
// As a future refactor this could be changed to set the property
// back to its original/default value.
AttrMorph.prototype.clear = function () {};

AttrMorph.prototype.destroy = function () {
  this.element = null;
  this.domHelper = null;
};

exports['default'] = AttrMorph;

exports.sanitizeAttributeValue = sanitize_attribute_value.sanitizeAttributeValue;