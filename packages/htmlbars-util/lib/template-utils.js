import { visitChildren } from "../htmlbars-util/morph-utils";

export function blockFor(render, template, blockOptions) {
  var block = function(env, blockArguments, self, renderNode, parentScope, visitor) {
    if (renderNode.lastResult) {
      renderNode.lastResult.revalidateWith(env, undefined, self, blockArguments, visitor);
    } else {
      var options = { renderState: { morphListStart: null, clearMorph: renderNode, shadowOptions: null } };

      var scope = blockOptions.scope;
      var shadowScope = scope ? env.hooks.createChildScope(scope) : env.hooks.createFreshScope();

      env.hooks.bindShadowScope(env, parentScope, shadowScope, blockOptions.options);

      if (self !== undefined) {
        env.hooks.bindSelf(env, shadowScope, self);
      } else if (blockOptions.self !== undefined) {
        env.hooks.bindSelf(env, shadowScope, blockOptions.self);
      }

      if (blockOptions.yieldTo !== undefined) {
        env.hooks.bindBlock(env, shadowScope, blockOptions.yieldTo);
      }

      renderAndCleanup(renderNode, env, options, null, function() {
        options.renderState.clearMorph = null;
        render(template, env, shadowScope, { renderNode: renderNode, blockArguments: blockArguments });
      });
    }
  };

  block.arity = template.arity;

  return block;
}

export function renderAndCleanup(morph, env, options, shadowOptions, callback) {
  options.renderState.shadowOptions = shadowOptions;
  var result = callback(options);

  if (result && result.handled) {
    return;
  }

  var item = options.renderState.morphListStart;
  var toClear = options.renderState.clearMorph;
  var morphMap = morph.morphMap;

  while (item) {
    var next = item.nextMorph;
    delete morphMap[item.key];
    clearMorph(item, env, true);
    item.destroy();
    item = next;
  }

  if (toClear) {
    if (Object.prototype.toString.call(toClear) === '[object Array]') {
      for (var i=0, l=toClear.length; i<l; i++) {
        clearMorph(toClear[i], env);
      }
    } else {
      clearMorph(toClear, env);
    }
  }
}

export function clearMorph(morph, env, destroySelf) {
  var cleanup = env.hooks.cleanupRenderNode;
  var destroy = env.hooks.destroyRenderNode;
  var willCleanup = env.hooks.willCleanupTree;
  var didCleanup = env.hooks.didCleanupTree;

  function destroyNode(node) {
    if (cleanup) { cleanup(node); }
    if (destroy) { destroy(node); }
  }

  if (willCleanup) { willCleanup(env, morph, destroySelf); }
  if (cleanup) { cleanup(morph); }
  if (destroySelf && destroy) { destroy(morph); }

  visitChildren(morph.childNodes, destroyNode);

  // TODO: Deal with logical children that are not in the DOM tree
  morph.clear();
  if (didCleanup) { didCleanup(env, morph, destroySelf); }

  morph.lastResult = null;
  morph.lastYielded = null;
  morph.childNodes = null;
}
