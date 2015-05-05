'use strict';

exports.merge = merge;
exports.createObject = createObject;
exports.objectKeys = objectKeys;
exports.shallowCopy = shallowCopy;
exports.keySet = keySet;
exports.keyLength = keyLength;

function merge(options, defaults) {
  for (var prop in defaults) {
    if (options.hasOwnProperty(prop)) {
      continue;
    }
    options[prop] = defaults[prop];
  }
  return options;
}

function createObject(obj) {
  if (typeof Object.create === 'function') {
    return Object.create(obj);
  } else {
    var Temp = function () {};
    Temp.prototype = obj;
    return new Temp();
  }
}

function objectKeys(obj) {
  if (typeof Object.keys === 'function') {
    return Object.keys(obj);
  } else {
    return legacyKeys(obj);
  }
}

function shallowCopy(obj) {
  return merge({}, obj);
}

function legacyKeys(obj) {
  var keys = [];

  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      keys.push(prop);
    }
  }

  return keys;
}
function keySet(obj) {
  var set = {};

  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      set[prop] = true;
    }
  }

  return set;
}

function keyLength(obj) {
  var count = 0;

  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      count++;
    }
  }

  return count;
}