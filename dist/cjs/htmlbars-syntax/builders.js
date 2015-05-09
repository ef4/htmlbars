'use strict';

exports.buildMustache = buildMustache;
exports.buildBlock = buildBlock;
exports.buildElementModifier = buildElementModifier;
exports.buildPartial = buildPartial;
exports.buildComment = buildComment;
exports.buildConcat = buildConcat;
exports.buildElement = buildElement;
exports.buildComponent = buildComponent;
exports.buildAttr = buildAttr;
exports.buildText = buildText;
exports.buildSexpr = buildSexpr;
exports.buildPath = buildPath;
exports.buildString = buildString;
exports.buildBoolean = buildBoolean;
exports.buildNumber = buildNumber;
exports.buildNull = buildNull;
exports.buildUndefined = buildUndefined;
exports.buildHash = buildHash;
exports.buildPair = buildPair;
exports.buildProgram = buildProgram;

// Statements

function buildMustache(path, params, hash, raw) {
  return {
    type: "MustacheStatement",
    path: path,
    params: params || [],
    hash: hash || buildHash([]),
    escaped: !raw
  };
}

function buildBlock(path, params, hash, program, inverse) {
  return {
    type: "BlockStatement",
    path: path,
    params: params || [],
    hash: hash || buildHash([]),
    program: program || null,
    inverse: inverse || null
  };
}

function buildElementModifier(path, params, hash) {
  return {
    type: "ElementModifierStatement",
    path: path,
    params: params || [],
    hash: hash || buildHash([])
  };
}

function buildPartial(name, params, hash, indent) {
  return {
    type: "PartialStatement",
    name: name,
    params: params || [],
    hash: hash || buildHash([]),
    indent: indent
  };
}

function buildComment(value) {
  return {
    type: "CommentStatement",
    value: value
  };
}

function buildConcat(parts) {
  return {
    type: "ConcatStatement",
    parts: parts || []
  };
}

function buildElement(tag, attributes, modifiers, children) {
  return {
    type: "ElementNode",
    tag: tag,
    attributes: attributes || [],
    modifiers: modifiers || [],
    children: children || []
  };
}

function buildComponent(tag, attributes, program) {
  return {
    type: "ComponentNode",
    tag: tag,
    attributes: attributes,
    program: program
  };
}

function buildAttr(name, value) {
  return {
    type: "AttrNode",
    name: name,
    value: value
  };
}

function buildText(chars) {
  return {
    type: "TextNode",
    chars: chars
  };
}

function buildSexpr(path, params, hash) {
  return {
    type: "SubExpression",
    path: path,
    params: params || [],
    hash: hash || buildHash([])
  };
}

function buildPath(original) {
  return {
    type: "PathExpression",
    original: original,
    parts: original.split(".")
  };
}

function buildString(value) {
  return {
    type: "StringLiteral",
    value: value,
    original: value
  };
}

function buildBoolean(value) {
  return {
    type: "BooleanLiteral",
    value: value,
    original: value
  };
}

function buildNumber(value) {
  return {
    type: "NumberLiteral",
    value: value,
    original: value
  };
}

function buildNull() {
  return {
    type: "NullLiteral",
    value: null,
    original: null
  };
}

function buildUndefined() {
  return {
    type: "UndefinedLiteral",
    value: undefined,
    original: undefined
  };
}

function buildHash(pairs) {
  return {
    type: "Hash",
    pairs: pairs || []
  };
}

function buildPair(key, value) {
  return {
    type: "HashPair",
    key: key,
    value: value
  };
}

function buildProgram(body, blockParams) {
  return {
    type: "Program",
    body: body || [],
    blockParams: blockParams || []
  };
}

exports['default'] = {
  mustache: buildMustache,
  block: buildBlock,
  partial: buildPartial,
  comment: buildComment,
  element: buildElement,
  elementModifier: buildElementModifier,
  component: buildComponent,
  attr: buildAttr,
  text: buildText,
  sexpr: buildSexpr,
  path: buildPath,
  string: buildString,
  boolean: buildBoolean,
  number: buildNumber,
  undefined: buildUndefined,
  null: buildNull,
  concat: buildConcat,
  hash: buildHash,
  pair: buildPair,
  program: buildProgram
};