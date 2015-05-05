'use strict';

exports.wrap = wrap;
exports.wrapForHelper = wrapForHelper;
exports.hostYieldWithShadowTemplate = hostYieldWithShadowTemplate;
exports.createScope = createScope;
exports.createFreshScope = createFreshScope;
exports.bindShadowScope = bindShadowScope;
exports.createChildScope = createChildScope;
exports.bindSelf = bindSelf;
exports.updateSelf = updateSelf;
exports.bindLocal = bindLocal;
exports.updateLocal = updateLocal;
exports.bindBlock = bindBlock;
exports.block = block;
exports.continueBlock = continueBlock;
exports.hostBlock = hostBlock;
exports.handleRedirect = handleRedirect;
exports.handleKeyword = handleKeyword;
exports.linkRenderNode = linkRenderNode;
exports.inline = inline;
exports.keyword = keyword;
exports.invokeHelper = invokeHelper;
exports.classify = classify;
exports.partial = partial;
exports.range = range;
exports.element = element;
exports.attribute = attribute;
exports.subexpr = subexpr;
exports.get = get;
exports.getRoot = getRoot;
exports.getChild = getChild;
exports.getValue = getValue;
exports.getCellOrValue = getCellOrValue;
exports.component = component;
exports.concat = concat;
exports.hasHelper = hasHelper;
exports.lookupHelper = lookupHelper;
exports.bindScope = bindScope;
exports.updateScope = updateScope;

var render = require('./render');
var MorphList = require('../morph-range/morph-list');
var object_utils = require('../htmlbars-util/object-utils');
var morph_utils = require('../htmlbars-util/morph-utils');
var template_utils = require('../htmlbars-util/template-utils');



/**
  HTMLBars delegates the runtime behavior of a template to
  hooks provided by the host environment. These hooks explain
  the lexical environment of a Handlebars template, the internal
  representation of references, and the interaction between an
  HTMLBars template and the DOM it is managing.

  While HTMLBars host hooks have access to all of this internal
  machinery, templates and helpers have access to the abstraction
  provided by the host hooks.

  ## The Lexical Environment

  The default lexical environment of an HTMLBars template includes:

  * Any local variables, provided by *block arguments*
  * The current value of `self`

  ## Simple Nesting

  Let's look at a simple template with a nested block:

  ```hbs
  <h1>{{title}}</h1>

  {{#if author}}
    <p class="byline">{{author}}</p>
  {{/if}}
  ```

  In this case, the lexical environment at the top-level of the
  template does not change inside of the `if` block. This is
  achieved via an implementation of `if` that looks like this:

  ```js
  registerHelper('if', function(params) {
    if (!!params[0]) {
      return this.yield();
    }
  });
  ```

  A call to `this.yield` invokes the child template using the
  current lexical environment.

  ## Block Arguments

  It is possible for nested blocks to introduce new local
  variables:

  ```hbs
  {{#count-calls as |i|}}
  <h1>{{title}}</h1>
  <p>Called {{i}} times</p>
  {{/count}}
  ```

  In this example, the child block inherits its surrounding
  lexical environment, but augments it with a single new
  variable binding.

  The implementation of `count-calls` supplies the value of
  `i`, but does not otherwise alter the environment:

  ```js
  var count = 0;
  registerHelper('count-calls', function() {
    return this.yield([ ++count ]);
  });
  ```
*/

function wrap(template) {
  if (template === null) {
    return null;
  }

  return {
    isHTMLBars: true,
    arity: template.arity,
    revision: template.revision,
    raw: template,
    render: function (self, env, options, blockArguments) {
      var scope = env.hooks.createFreshScope();

      options = options || {};
      options.self = self;
      options.blockArguments = blockArguments;

      return render['default'](template, env, scope, options);
    }
  };
}

function wrapForHelper(template, env, scope, morph, renderState, visitor) {
  if (template === null) {
    return {
      yieldIn: yieldInShadowTemplate(null, env, scope, morph, renderState, visitor)
    };
  }

  var yieldArgs = yieldTemplate(template, env, scope, morph, renderState, visitor);

  return {
    arity: template.arity,
    revision: template.revision,
    yield: yieldArgs,
    yieldItem: yieldItem(template, env, scope, morph, renderState, visitor),
    yieldIn: yieldInShadowTemplate(template, env, scope, morph, renderState, visitor),
    raw: template,

    render: function (self, blockArguments) {
      yieldArgs(blockArguments, self);
    }
  };
}

function yieldTemplate(template, env, parentScope, morph, renderState, visitor) {
  return function (blockArguments, self) {
    renderState.clearMorph = null;

    if (morph.morphList) {
      renderState.morphList = morph.morphList.firstChildMorph;
      renderState.morphList = null;
    }

    var scope = parentScope;

    if (morph.lastYielded && isStableTemplate(template, morph.lastYielded)) {
      return morph.lastResult.revalidateWith(env, undefined, self, blockArguments, visitor);
    }

    // Check to make sure that we actually **need** a new scope, and can't
    // share the parent scope. Note that we need to move this check into
    // a host hook, because the host's notion of scope may require a new
    // scope in more cases than the ones we can determine statically.
    if (self !== undefined || parentScope === null || template.arity) {
      scope = env.hooks.createChildScope(parentScope);
    }

    morph.lastYielded = { self: self, template: template, shadowTemplate: null };

    // Render the template that was selected by the helper
    render['default'](template, env, scope, { renderNode: morph, self: self, blockArguments: blockArguments });
  };
}

function yieldItem(template, env, parentScope, morph, renderState, visitor) {
  var currentMorph = null;
  var morphList = morph.morphList;
  if (morphList) {
    currentMorph = morphList.firstChildMorph;
    renderState.morphListStart = currentMorph;
  }

  return function (key, blockArguments, self) {
    if (typeof key !== "string") {
      throw new Error("You must provide a string key when calling `yieldItem`; you provided " + key);
    }

    var morphList, morphMap;

    if (!morph.morphList) {
      morph.morphList = new MorphList['default']();
      morph.morphMap = {};
      morph.setMorphList(morph.morphList);
    }

    morphList = morph.morphList;
    morphMap = morph.morphMap;

    if (currentMorph && currentMorph.key === key) {
      yieldTemplate(template, env, parentScope, currentMorph, renderState, visitor)(blockArguments, self);
      currentMorph = currentMorph.nextMorph;
    } else if (currentMorph && morphMap[key] !== undefined) {
      var foundMorph = morphMap[key];
      yieldTemplate(template, env, parentScope, foundMorph, renderState, visitor)(blockArguments, self);
      morphList.insertBeforeMorph(foundMorph, currentMorph);
    } else {
      var childMorph = render.createChildMorph(env.dom, morph);
      childMorph.key = key;
      morphMap[key] = childMorph;
      morphList.insertBeforeMorph(childMorph, currentMorph);
      yieldTemplate(template, env, parentScope, childMorph, renderState, visitor)(blockArguments, self);
    }

    renderState.morphListStart = currentMorph;
    renderState.clearMorph = morph.childNodes;
    morph.childNodes = null;
  };
}

function isStableTemplate(template, lastYielded) {
  return !lastYielded.shadowTemplate && template === lastYielded.template;
}

function yieldInShadowTemplate(template, env, parentScope, morph, renderState, visitor) {
  var hostYield = hostYieldWithShadowTemplate(template, env, parentScope, morph, renderState, visitor);

  return function (shadowTemplate, self) {
    hostYield(shadowTemplate, env, self, []);
  };
}
function hostYieldWithShadowTemplate(template, env, parentScope, morph, renderState, visitor) {
  return function (shadowTemplate, env, self, blockArguments) {
    renderState.clearMorph = null;

    if (morph.lastYielded && isStableShadowRoot(template, shadowTemplate, morph.lastYielded)) {
      return morph.lastResult.revalidateWith(env, undefined, self, blockArguments, visitor);
    }

    var shadowScope = env.hooks.createFreshScope();
    env.hooks.bindShadowScope(env, parentScope, shadowScope, renderState.shadowOptions);
    blockToYield.arity = template.arity;
    env.hooks.bindBlock(env, shadowScope, blockToYield);

    morph.lastYielded = { self: self, template: template, shadowTemplate: shadowTemplate };

    // Render the shadow template with the block available
    render['default'](shadowTemplate.raw, env, shadowScope, { renderNode: morph, self: self, blockArguments: blockArguments });
  };

  function blockToYield(env, blockArguments, self, renderNode, shadowParent, visitor) {
    if (renderNode.lastResult) {
      renderNode.lastResult.revalidateWith(env, undefined, undefined, blockArguments, visitor);
    } else {
      var scope = parentScope;

      // Since a yielded template shares a `self` with its original context,
      // we only need to create a new scope if the template has block parameters
      if (template.arity) {
        scope = env.hooks.createChildScope(parentScope);
      }

      render['default'](template, env, scope, { renderNode: renderNode, self: self, blockArguments: blockArguments });
    }
  }
}

function isStableShadowRoot(template, shadowTemplate, lastYielded) {
  return template === lastYielded.template && shadowTemplate === lastYielded.shadowTemplate;
}

function optionsFor(template, inverse, env, scope, morph, visitor) {
  var renderState = { morphListStart: null, clearMorph: morph, shadowOptions: null };

  return {
    templates: {
      template: wrapForHelper(template, env, scope, morph, renderState, visitor),
      inverse: wrapForHelper(inverse, env, scope, morph, renderState, visitor)
    },
    renderState: renderState
  };
}

function thisFor(options) {
  return {
    arity: options.template.arity,
    yield: options.template.yield,
    yieldItem: options.template.yieldItem,
    yieldIn: options.template.yieldIn
  };
}
function createScope(env, parentScope) {
  if (parentScope) {
    return env.hooks.createChildScope(parentScope);
  } else {
    return env.hooks.createFreshScope();
  }
}

function createFreshScope() {
  // because `in` checks have unpredictable performance, keep a
  // separate dictionary to track whether a local was bound.
  // See `bindLocal` for more information.
  return { self: null, block: null, locals: {}, localPresent: {} };
}

function bindShadowScope(env /*, parentScope, shadowScope */) {
  return env.hooks.createFreshScope();
}

function createChildScope(parent) {
  var scope = object_utils.createObject(parent);
  scope.locals = object_utils.createObject(parent.locals);
  return scope;
}

function bindSelf(env, scope, self) {
  scope.self = self;
}

function updateSelf(env, scope, self) {
  env.hooks.bindSelf(env, scope, self);
}

function bindLocal(env, scope, name, value) {
  scope.localPresent[name] = true;
  scope.locals[name] = value;
}

function updateLocal(env, scope, name, value) {
  env.hooks.bindLocal(env, scope, name, value);
}

function bindBlock(env, scope, block) {
  scope.block = block;
}

function block(morph, env, scope, path, params, hash, template, inverse, visitor) {
  if (handleRedirect(morph, env, scope, path, params, hash, template, inverse, visitor)) {
    return;
  }

  continueBlock(morph, env, scope, path, params, hash, template, inverse, visitor);
}

function continueBlock(morph, env, scope, path, params, hash, template, inverse, visitor) {
  hostBlock(morph, env, scope, template, inverse, null, visitor, function (options) {
    var helper = env.hooks.lookupHelper(env, scope, path);
    return env.hooks.invokeHelper(morph, env, scope, visitor, params, hash, helper, options.templates, thisFor(options.templates));
  });
}

function hostBlock(morph, env, scope, template, inverse, shadowOptions, visitor, callback) {
  var options = optionsFor(template, inverse, env, scope, morph, visitor);
  template_utils.renderAndCleanup(morph, env, options, shadowOptions, callback);
}

function handleRedirect(morph, env, scope, path, params, hash, template, inverse, visitor) {
  var redirect = env.hooks.classify(env, scope, path);
  if (redirect) {
    switch (redirect) {
      case "component":
        env.hooks.component(morph, env, scope, path, params, hash, template, visitor);break;
      case "inline":
        env.hooks.inline(morph, env, scope, path, params, hash, visitor);break;
      case "block":
        env.hooks.block(morph, env, scope, path, params, hash, template, inverse, visitor);break;
      default:
        throw new Error("Internal HTMLBars redirection to " + redirect + " not supported");
    }
    return true;
  }

  if (handleKeyword(path, morph, env, scope, params, hash, template, inverse, visitor)) {
    return true;
  }

  return false;
}

function handleKeyword(path, morph, env, scope, params, hash, template, inverse, visitor) {
  var keyword = env.hooks.keywords[path];
  if (!keyword) {
    return false;
  }

  if (typeof keyword === "function") {
    return keyword(morph, env, scope, params, hash, template, inverse, visitor);
  }

  if (keyword.willRender) {
    keyword.willRender(morph, env);
  }

  var lastState, newState;
  if (keyword.setupState) {
    lastState = object_utils.shallowCopy(morph.state);
    newState = morph.state = keyword.setupState(lastState, env, scope, params, hash);
  }

  if (keyword.childEnv) {
    morph.lastEnv = keyword.childEnv(morph.state);
    env = object_utils.merge(object_utils.shallowCopy(morph.lastEnv), env);
  }

  var firstTime = !morph.rendered;

  if (keyword.isEmpty) {
    var isEmpty = keyword.isEmpty(morph.state, env, scope, params, hash);

    if (isEmpty) {
      if (!firstTime) {
        template_utils.clearMorph(morph, env, false);
      }
      return true;
    }
  }

  if (firstTime) {
    if (keyword.render) {
      keyword.render(morph, env, scope, params, hash, template, inverse, visitor);
    }
    morph.rendered = true;
    return true;
  }

  var isStable;
  if (keyword.isStable) {
    isStable = keyword.isStable(lastState, newState);
  } else {
    isStable = stableState(lastState, newState);
  }

  if (isStable) {
    if (keyword.rerender) {
      var newEnv = keyword.rerender(morph, env, scope, params, hash, template, inverse, visitor);
      env = newEnv || env;
    }
    morph_utils.validateChildMorphs(env, morph, visitor);
    return true;
  } else {
    template_utils.clearMorph(morph, env, false);
  }

  // If the node is unstable, re-render from scratch
  if (keyword.render) {
    keyword.render(morph, env, scope, params, hash, template, inverse, visitor);
    morph.rendered = true;
    return true;
  }
}

function stableState(oldState, newState) {
  if (object_utils.keyLength(oldState) !== object_utils.keyLength(newState)) {
    return false;
  }

  for (var prop in oldState) {
    if (oldState[prop] !== newState[prop]) {
      return false;
    }
  }

  return true;
}
function linkRenderNode() {
  return;
}

function inline(morph, env, scope, path, params, hash, visitor) {
  if (handleRedirect(morph, env, scope, path, params, hash, null, null, visitor)) {
    return;
  }

  var options = optionsFor(null, null, env, scope, morph);

  var helper = env.hooks.lookupHelper(env, scope, path);
  var result = env.hooks.invokeHelper(morph, env, scope, visitor, params, hash, helper, options.templates, thisFor(options.templates));

  if (result && result.value) {
    var value = result.value;
    if (morph.lastValue !== value) {
      morph.setContent(value);
    }
    morph.lastValue = value;
  }
}

function keyword(path, morph, env, scope, params, hash, template, inverse, visitor) {
  handleKeyword(path, morph, env, scope, params, hash, template, inverse, visitor);
}

function invokeHelper(morph, env, scope, visitor, _params, _hash, helper, templates, context) {
  var params = normalizeArray(env, _params);
  var hash = normalizeObject(env, _hash);
  return { value: helper.call(context, params, hash, templates) };
}

function normalizeArray(env, array) {
  var out = new Array(array.length);

  for (var i = 0, l = array.length; i < l; i++) {
    out[i] = env.hooks.getCellOrValue(array[i]);
  }

  return out;
}

function normalizeObject(env, object) {
  var out = {};

  for (var prop in object) {
    out[prop] = env.hooks.getCellOrValue(object[prop]);
  }

  return out;
}
function classify() {
  return null;
}

var keywords = {
  partial: function (morph, env, scope, params) {
    var value = env.hooks.partial(morph, env, scope, params[0]);
    morph.setContent(value);
    return true;
  },

  yield: function (morph, env, scope, params, hash, template, inverse, visitor) {
    // the current scope is provided purely for the creation of shadow
    // scopes; it should not be provided to user code.
    if (scope.block) {
      scope.block(env, params, hash.self, morph, scope, visitor);
    }
    return true;
  }
};function partial(renderNode, env, scope, path) {
  var template = env.partials[path];
  return template.render(scope.self, env, {}).fragment;
}

function range(morph, env, scope, path, value, visitor) {
  if (handleRedirect(morph, env, scope, path, [value], {}, null, null, visitor)) {
    return;
  }

  value = env.hooks.getValue(value);

  if (morph.lastValue !== value) {
    morph.setContent(value);
  }

  morph.lastValue = value;
}

function element(morph, env, scope, path, params, hash, visitor) {
  if (handleRedirect(morph, env, scope, path, params, hash, null, null, visitor)) {
    return;
  }

  var helper = env.hooks.lookupHelper(env, scope, path);
  if (helper) {
    env.hooks.invokeHelper(null, env, scope, null, params, hash, helper, { element: morph.element });
  }
}

function attribute(morph, env, scope, name, value) {
  value = env.hooks.getValue(value);

  if (morph.lastValue !== value) {
    morph.setContent(value);
  }

  morph.lastValue = value;
}

function subexpr(env, scope, helperName, params, hash) {
  var helper = env.hooks.lookupHelper(env, scope, helperName);
  var result = env.hooks.invokeHelper(null, env, scope, null, params, hash, helper, {});
  if (result && result.value) {
    return result.value;
  }
}

function get(env, scope, path) {
  if (path === "") {
    return scope.self;
  }

  var keys = path.split(".");
  var value = env.hooks.getRoot(scope, keys[0])[0];

  for (var i = 1; i < keys.length; i++) {
    if (value) {
      value = env.hooks.getChild(value, keys[i]);
    } else {
      break;
    }
  }

  return value;
}

function getRoot(scope, key) {
  if (scope.localPresent[key]) {
    return [scope.locals[key]];
  } else if (scope.self) {
    return [scope.self[key]];
  } else {
    return [undefined];
  }
}

function getChild(value, key) {
  return value[key];
}

function getValue(reference) {
  return reference;
}

function getCellOrValue(reference) {
  return reference;
}

function component(morph, env, scope, tagName, attrs, template, visitor) {
  if (env.hooks.hasHelper(env, scope, tagName)) {
    return env.hooks.block(morph, env, scope, tagName, [], attrs, template, null, visitor);
  }

  componentFallback(morph, env, scope, tagName, attrs, template);
}

function concat(env, params) {
  var value = "";
  for (var i = 0, l = params.length; i < l; i++) {
    value += env.hooks.getValue(params[i]);
  }
  return value;
}

function componentFallback(morph, env, scope, tagName, attrs, template) {
  var element = env.dom.createElement(tagName);
  for (var name in attrs) {
    element.setAttribute(name, env.hooks.getValue(attrs[name]));
  }
  var fragment = render['default'](template, env, scope, {}).fragment;
  element.appendChild(fragment);
  morph.setNode(element);
}
function hasHelper(env, scope, helperName) {
  return env.helpers[helperName] !== undefined;
}

function lookupHelper(env, scope, helperName) {
  return env.helpers[helperName];
}

function bindScope() {}

function updateScope(env, scope) {
  env.hooks.bindScope(env, scope);
}

exports['default'] = {
  // fundamental hooks that you will likely want to override
  bindLocal: bindLocal,
  bindSelf: bindSelf,
  bindScope: bindScope,
  classify: classify,
  component: component,
  concat: concat,
  createFreshScope: createFreshScope,
  getChild: getChild,
  getRoot: getRoot,
  getValue: getValue,
  getCellOrValue: getCellOrValue,
  keywords: keywords,
  linkRenderNode: linkRenderNode,
  partial: partial,
  subexpr: subexpr,

  // fundamental hooks with good default behavior
  bindBlock: bindBlock,
  bindShadowScope: bindShadowScope,
  updateLocal: updateLocal,
  updateSelf: updateSelf,
  updateScope: updateScope,
  createChildScope: createChildScope,
  hasHelper: hasHelper,
  lookupHelper: lookupHelper,
  invokeHelper: invokeHelper,
  cleanupRenderNode: null,
  destroyRenderNode: null,
  willCleanupTree: null,
  didCleanupTree: null,

  // derived hooks
  attribute: attribute,
  block: block,
  createScope: createScope,
  element: element,
  get: get,
  inline: inline,
  range: range,
  keyword: keyword
};
/* morph, env, scope, params, hash */ /* env, scope, path */ /* env, scope */
// this function is used to handle host-specified extensions to scope
// other than `self`, `locals` and `block`.

exports.keywords = keywords;